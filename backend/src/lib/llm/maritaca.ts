// Maritaca AI adapter — API compatível com OpenAI /v1/chat/completions
// Documentação: https://maritaca.ai/
// Base URL: https://chat.maritaca.ai/api

import type {
    LlmMessage,
    NormalizedToolCall,
    NormalizedToolResult,
    OpenAIToolSchema,
    StreamChatParams,
    StreamChatResult,
} from "./types";

const MARITACA_BASE_URL = "https://chat.maritaca.ai/api";
const MAX_OUTPUT_TOKENS = 8192;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function apiKey(override?: string | null): string {
    return override?.trim() || process.env.MARITACA_API_KEY?.trim() || "";
}

function extractSseJson(buffer: string): { events: unknown[]; rest: string } {
    const events: unknown[] = [];
    const chunks = buffer.split(/\n\n/);
    const rest = chunks.pop() ?? "";

    for (const chunk of chunks) {
        const dataLines = chunk
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim());

        for (const data of dataLines) {
            if (!data || data === "[DONE]") continue;
            try {
                events.push(JSON.parse(data));
            } catch {
                // Incomplete events stay buffered until the next read.
            }
        }
    }

    return { events, rest };
}

function buildMessages(
    systemPrompt: string,
    messages: LlmMessage[],
): { role: string; content: string }[] {
    const result: { role: string; content: string }[] = [];
    if (systemPrompt) {
        result.push({ role: "system", content: systemPrompt });
    }
    for (const m of messages) {
        result.push({ role: m.role, content: m.content });
    }
    return result;
}

function toMaritacaTools(tools: OpenAIToolSchema[]) {
    return tools.map((t) => ({
        type: "function",
        function: {
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
        },
    }));
}

function parseToolCalls(
    toolCallsRaw: {
        id?: string;
        function?: { name?: string; arguments?: string };
    }[],
): NormalizedToolCall[] {
    return toolCallsRaw.map((tc) => {
        let input: Record<string, unknown> = {};
        try {
            const parsed = JSON.parse(tc.function?.arguments || "{}");
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                input = parsed as Record<string, unknown>;
            }
        } catch {
            input = {};
        }
        return {
            id: tc.id ?? tc.function?.name ?? "tool_call",
            name: tc.function?.name ?? "",
            input,
        };
    });
}

async function chatCompletion(params: {
    model: string;
    messages: { role: string; content: string }[];
    tools?: ReturnType<typeof toMaritacaTools>;
    stream: boolean;
    maxTokens: number;
    apiKey: string;
}): Promise<Response> {
    const body: Record<string, unknown> = {
        model: params.model,
        messages: params.messages,
        stream: params.stream,
        max_tokens: params.maxTokens,
    };
    if (params.tools?.length) {
        body.tools = params.tools;
        body.tool_choice = "auto";
    }

    const response = await fetch(`${MARITACA_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${params.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Maritaca request failed (${response.status}): ${text || response.statusText}`,
        );
    }

    return response;
}

// ---------------------------------------------------------------------------
// Stream chat with tools
// ---------------------------------------------------------------------------

export async function streamMaritaca(
    params: StreamChatParams,
): Promise<StreamChatResult> {
    const {
        model,
        systemPrompt,
        tools = [],
        callbacks = {},
        runTools,
        apiKeys,
    } = params;
    const maxIter = params.maxIterations ?? 10;
    const key = apiKey(apiKeys?.maritaca);
    const maritacaTools = toMaritacaTools(tools);
    const hasTools = maritacaTools.length > 0;

    let conversationMessages = buildMessages(systemPrompt, params.messages);
    let fullText = "";

    for (let iter = 0; iter < maxIter; iter++) {
        const response = await chatCompletion({
            model,
            messages: conversationMessages,
            tools: hasTools ? maritacaTools : undefined,
            stream: true,
            maxTokens: MAX_OUTPUT_TOKENS,
            apiKey: key,
        });

        if (!response.body) throw new Error("Maritaca response had no body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let iterText = "";
        const toolCallAccumulator: Record<
            number,
            { id: string; name: string; arguments: string }
        > = {};

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const { events, rest } = extractSseJson(buffer);
            buffer = rest;

            for (const event of events as {
                choices?: {
                    delta?: {
                        content?: string;
                        tool_calls?: {
                            index?: number;
                            id?: string;
                            function?: { name?: string; arguments?: string };
                        }[];
                    };
                    finish_reason?: string;
                }[];
            }[]) {
                const delta = event.choices?.[0]?.delta;
                if (!delta) continue;

                if (typeof delta.content === "string" && delta.content) {
                    iterText += delta.content;
                    if (!hasTools) {
                        fullText += delta.content;
                        callbacks.onContentDelta?.(delta.content);
                    }
                }

                if (delta.tool_calls) {
                    for (const tc of delta.tool_calls) {
                        const idx = tc.index ?? 0;
                        if (!toolCallAccumulator[idx]) {
                            toolCallAccumulator[idx] = {
                                id: tc.id ?? `tool_${idx}`,
                                name: tc.function?.name ?? "",
                                arguments: "",
                            };
                        }
                        if (tc.function?.arguments) {
                            toolCallAccumulator[idx].arguments +=
                                tc.function.arguments;
                        }
                        if (tc.function?.name) {
                            toolCallAccumulator[idx].name = tc.function.name;
                        }
                        if (tc.id) {
                            toolCallAccumulator[idx].id = tc.id;
                        }
                    }
                }
            }
        }

        const toolCallsRaw = Object.values(toolCallAccumulator);

        if (!toolCallsRaw.length || !runTools) {
            if (iterText && hasTools) {
                fullText += iterText;
                callbacks.onContentDelta?.(iterText);
            }
            break;
        }

        // Notify listeners of each tool call start
        const normalizedCalls = parseToolCalls(toolCallsRaw);
        for (const call of normalizedCalls) {
            callbacks.onToolCallStart?.(call);
        }

        // Append assistant turn with tool_calls then tool results
        conversationMessages.push({
            role: "assistant",
            content: JSON.stringify({
                tool_calls: toolCallsRaw.map((tc) => ({
                    id: tc.id,
                    type: "function",
                    function: { name: tc.name, arguments: tc.arguments },
                })),
            }),
        });

        const results: NormalizedToolResult[] = await runTools(normalizedCalls);
        for (const result of results) {
            conversationMessages.push({
                role: "tool",
                content: result.content,
            } as unknown as { role: string; content: string });
        }
    }

    return { fullText };
}

// ---------------------------------------------------------------------------
// One-shot text completion (used for title generation, etc.)
// ---------------------------------------------------------------------------

export async function completeMaritacaText(params: {
    model: string;
    systemPrompt?: string;
    user: string;
    maxTokens?: number;
    apiKeys?: { maritaca?: string | null };
}): Promise<string> {
    const messages = buildMessages(params.systemPrompt ?? "", [
        { role: "user", content: params.user },
    ]);

    const response = await chatCompletion({
        model: params.model,
        messages,
        stream: false,
        maxTokens: params.maxTokens ?? 512,
        apiKey: apiKey(params.apiKeys?.maritaca),
    });

    const json = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
    };

    return json.choices?.[0]?.message?.content ?? "";
}
