# Histórico de desenvolvimento — Mike (fork local)

> Última atualização: 2026-05-12
> Branch de trabalho: `claude/admiring-blackwell-5ce33e`
> Ponto de fork do upstream: commit `469ee4a` (2026-05-11)

---

## Upstream (origem do fork)

O projeto é um fork do repositório OSS **Mike**, assistente jurídico com IA. Os commits abaixo vieram do repositório original e são a base sobre a qual o trabalho local foi feito.

| Hash | Data | Descrição |
|------|------|-----------|
| `469ee4a` | 2026-05-11 | Merge PR #56 — atualiza docs OSS e remove páginas legais do app |
| `0ac2744` | 2026-05-11 | Merge PR #21 — fail-fast quando secret de download está ausente |
| `a84c1cc` | 2026-05-10 | Melhora guia de setup e exemplos de variáveis de ambiente |
| `dbbf196` | 2026-05-10 | Merge PR #51 — corrige IDOR em revisões tabulares (CWE-639) |
| `029181b` | 2026-05-10 | Merge PR #52 — fix filtros JSONB shared_with e S3 path-style |
| `f40c25d` | 2026-05-09 | Merge PR #48 — adiciona suporte OpenAI e endurece segurança OSS |
| `adc2cf2` | 2026-05-08 | Merge PR #31 — guia de testes locais seguros |
| `e5a3d6f` | 2026-05-08 | Merge PR #28 — validação de limites de pastas de projeto |
| `7f5dd21` | 2026-05-08 | Merge PR #46 — updates de segurança no perfil e headers de chat |
| `d969096` | 2026-04-29 | Conteúdo inicial do repositório local |

---

## Trabalho local (nossa branch)

### 1. Setup inicial

#### `a096a76` — 2026-05-11
**chore: instala dependencias do backend e frontend**

Atualização dos `package-lock.json` do backend e frontend após instalação
local das dependências. Passo preparatório antes de qualquer desenvolvimento.

Arquivos: `backend/package-lock.json`, `frontend/package-lock.json`

---

### 2. Internacionalização (i18n) — pt-BR

Série de commits que traduz toda a interface para português brasileiro usando
a biblioteca `next-intl`. Toda string hardcoded em inglês foi substituída por
chamadas `t()` com chaves em `frontend/messages/pt-BR.json`.

#### `f12456c` — 2026-05-11
**feat(i18n): configura next-intl e cria traducoes pt-BR**

Ponto de partida da internacionalização. Instala `next-intl`, configura o
roteador no `next.config.ts`, cria o provider `src/i18n/request.ts` e o
arquivo base `frontend/messages/pt-BR.json` com as primeiras chaves.

Arquivos: `next.config.ts`, `package.json`, `src/i18n/request.ts`, `messages/pt-BR.json`

---

#### `1f6b152` — 2026-05-12
**feat(i18n): traduz login, signup, modais shared e componentes de diretório**

Cobre os fluxos de autenticação e os modais compartilhados. Também cria o
arquivo `TRADUCAO.md` como checklist de progresso da tradução.

Componentes: páginas de login/signup, `AddDocumentsModal` e outros modais shared,
componentes de diretório.

---

#### `826e25f` — 2026-05-12
**feat(i18n): traduz componentes de assistant e tabular**

Maior commit de tradução. Cobre toda a área de chat com assistente e
revisões tabulares. Os nomes dos presets de colunas foram adaptados para
terminologia jurídica brasileira.

Componentes: `AssistantWorkflowModal`, `ChatView`, `ChatInput`, `InitialView`,
`SelectAssistantProjectModal`, `AddColumnModal`, `AddNewTRModal`, `TRChatPanel`,
`columnPresets`, `NewProjectModal`, `ProjectExplorer`, `ProjectPage`, `ProjectsOverview`.

---

#### `693e2fe` — 2026-05-12
**feat(i18n): traduz workflows, modais, páginas e hook de chat para pt-BR**

Completa a tradução das páginas de nível de rota e dos hooks. 250 novas chaves
adicionadas ao `pt-BR.json`.

Componentes: `ShareWorkflowModal`, `WFEditColumnModal`, `WorkflowList`,
`NewWorkflowModal`, `delete-chats-modal`, páginas de account, tabular-reviews,
workflows/[id], projects/chat, `useAssistantChat`.

---

#### `170e7bc` — 2026-05-12
**feat(i18n): traduz menu lateral (AppSidebar) para pt-BR**

Itens de navegação, histórico de chats, tooltips e nome do app no sidebar
substituídos por chamadas `t()` no namespace `shared.appSidebar`.

Arquivos: `AppSidebar.tsx`, `pt-BR.json`

---

#### `b6ed3d1` — 2026-05-12
**feat(i18n): traduz botão de documentos (AddDocButton) para pt-BR**

Textos do botão de adição de documentos traduzidos.

Arquivos: `AddDocButton.tsx`, `pt-BR.json`

---

#### `ab9b0d7` — 2026-05-12
**feat(i18n): renomeia "Revisões Tabulares" para terminologia jurídica brasileira**

No menu lateral: "Dados". Na página: "Extração e comparação de dados entre
documentos". Corrige também um título hardcoded que havia escapado das
traduções anteriores.

Arquivos: `pt-BR.json`, `tabular-reviews/page.tsx`

---

#### `50553c3` — 2026-05-12
**feat(i18n): traduz painel de alterações rastreadas para pt-BR**

Traduz os labels do painel de diff/tracked changes: labels de ferramentas,
botões "Accept all"/"Reject all", resumo de alterações e cards individuais
de edição.

Arquivos: `AssistantMessage.tsx`, `EditCard.tsx`, `pt-BR.json`

---

### 3. White-label / configuração de marca

#### `9dfa9ca` — 2026-05-12
**feat: centraliza configuração de marca em brand.ts + componente AppLogo**

Cria `src/config/brand.ts` lendo `NEXT_PUBLIC_APP_NAME` e `NEXT_PUBLIC_LOGO_URL`
do ambiente. Cria o componente `AppLogo` que renderiza imagem customizada (URL)
ou o ícone SVG padrão como fallback. Substitui os usos de `MikeIcon` como logo
nos componentes de interface (usos como spinner/status permanecem com `MikeIcon`).

Arquivos novos: `src/config/brand.ts`, `src/components/chat/app-logo.tsx`
Arquivos alterados: `AppSidebar.tsx`, `InitialView.tsx`, `TRChatPanel.tsx`,
`WorkflowList.tsx`, `site-logo.tsx`, página de chat de projeto.

---

#### `4556c94` — 2026-05-12
**feat: título da aba do navegador configurável via variáveis de ambiente**

Metadados do `<head>` deixam de ser hardcoded. Novas variáveis:
- `NEXT_PUBLIC_APP_TITLE` — título principal da aba
- `NEXT_PUBLIC_APP_DESCRIPTION` — meta description
- `NEXT_PUBLIC_APP_URL` — URL canônica

Usa `NEXT_PUBLIC_APP_NAME` como fallback quando `APP_TITLE` não for definido.

Arquivos: `frontend/src/app/layout.tsx`

---

### 4. Correções de estabilidade no frontend

#### `4872c90` — 2026-05-12
**fix: corrige removeChild durante streaming do ReactMarkdown**

Adicionado `key="streaming"/"done"` no `ReactMarkdown` para forçar remount
ao fim do streaming. Evita que `rehypeKatex`/`remarkGfm` produzam árvores
DOM inconsistentes durante a reconciliação com markdown parcial.

Arquivos: `AssistantMessage.tsx`

---

#### `78e2b03` — 2026-05-12
**fix: desativa plugins do ReactMarkdown durante streaming**

Refinamento do fix anterior. Durante o streaming, o `ReactMarkdown` é renderizado
sem plugins (árvore DOM estável). Ao fim do streaming, a `key` muda para `"done"`,
forçando um remount único com `rehypeKatex` e `remarkGfm` para renderização final.

Arquivos: `AssistantMessage.tsx`

---

### 5. Localização de terminologia e UX

#### `937d816` — 2026-05-12
**feat: traduz áreas de prática para português e documenta como config de instância**

As 19 opções de `PRACTICE_OPTIONS` foram traduzidas para português jurídico.
Os workflows embutidos foram atualizados para usar os novos valores. Adicionado
comentário em `practices.ts` documentando como cada instância pode personalizar
suas áreas de prática.

Arquivos: `practices.ts`, `builtinWorkflows.ts`

---

#### `0aef173` — 2026-05-12
**chore: desativa painel de dev tools do Next.js (devIndicators)**

O painel interno do Next.js estava em inglês e sobrepunha elementos da interface.
Como não é traduzível, foi desativado via `devIndicators: false` no `next.config.ts`.

Arquivos: `frontend/next.config.ts`

---

#### `1dcd8a8` — 2026-05-12
**feat: renomeia Workflows para "Fluxos de trabalho" + label no botão Criar**

Atualiza sidebar, título da página e todas as strings relacionadas para
"Fluxos de trabalho". Adiciona label "Criar Fluxo" ao botão `+` na listagem.

Arquivos: `pt-BR.json`, `WorkflowList.tsx`

---

#### `846ce3f` — 2026-05-12
**feat: atualiza modal de novo fluxo com nomenclatura em português**

Substitui todas as ocorrências de "workflow" por "fluxo" dentro do modal de
criação/edição: breadcrumb, placeholder do nome, botão de confirmação,
mensagens de erro e estado.

Arquivos: `pt-BR.json`, `NewWorkflowModal.tsx`

---

### 6. Integração com Maritaca (Sabiá) — LLM nacional

#### `fed8d1e` — 2026-05-12
**feat: adiciona provedor Maritaca (Sabiá) com todos os modelos disponíveis**

Maior adição técnica do projeto. Integra a API Maritaca como novo provider de LLM.
A API é compatível com OpenAI `/v1/chat/completions`, mas foi criado um adaptador
próprio por causa de particularidades no formato SSE e no comportamento de streaming.

**Modelos adicionados:**
- `sabia-4` (main tier)
- `sabiazinho-4` (main tier)
- `sabia-3.1` (mid tier)
- `sabia-3` (mid tier)
- `sabiazinho-3` (low tier)

**O que foi implementado:**
- `backend/src/lib/llm/maritaca.ts` — adaptador completo com streaming, tool calling e aula de erros
- `backend/migrations/add_maritaca_provider.sql` — migration para instâncias existentes (adiciona coluna `maritaca` na tabela de API keys)
- `backend/schema.sql` — atualizado com o novo campo
- `backend/src/lib/llm/models.ts` — novos model IDs e `providerForModel("sabia*" | "sabiazinho*")`
- `backend/src/lib/llm/types.ts` — `Provider` estendido com `"maritaca"`
- `backend/src/lib/userApiKeys.ts` — suporte a encrypt/decrypt da chave Maritaca
- `frontend/src/app/(pages)/account/models/page.tsx` — campo de API key Maritaca na tela de conta
- `frontend/src/app/components/assistant/ModelToggle.tsx` — modelos Maritaca no seletor
- `frontend/src/app/lib/modelAvailability.ts` — disponibilidade condicional à API key
- `frontend/src/contexts/UserProfileContext.tsx` — carrega a chave Maritaca no contexto

Arquivos: 12 arquivos, +359 / -10 linhas

---

#### `dba0323` — 2026-05-12
**fix: corrige adaptador Maritaca — separador SSE `\r\n\r\n`**

O parser SSE original usava `/\n\n/` como separador, mas a API Maritaca usa
`\r\n\r\n`. Isso causava acúmulo de buffer sem parsing e o streaming ficava
silencioso. Corrigido para `/\r?\n\r?\n/`. Também melhora serialização de erros
no log da rota de API keys.

Arquivos: `maritaca.ts`, `backend/src/routes/user.ts`

---

#### `f845f03` — 2026-05-12
**fix: corrige label "Workflows" → "Fluxos de trabalho" no chat input**

Chave de tradução errada estava sendo usada no componente `ChatInput`, mostrando
"Workflows" em inglês mesmo após a renomeação.

Arquivos: `frontend/messages/pt-BR.json`

---

#### `d644d4f` — 2026-05-12
**fix: corrige streaming Maritaca — deltas incrementais e timeout de idle**

Dois bugs corrigidos:

1. **Streaming em lote → incremental**: quando ferramentas estavam ativas
   (`hasTools=true`), `onContentDelta` só era chamado uma vez ao final com
   todo o texto acumulado. Corrigido para emitir deltas imediatamente,
   igual aos outros providers.

2. **Spinner infinito ao trocar de modelo**: se a API Maritaca travasse ou
   demorasse demais (contexto maior na segunda mensagem), o `fetch` do Node.js
   nunca resolvia e `res.end()` nunca era chamado. Adicionado timeout de 4 min
   por chamada de `reader.read()` — se nenhum dado chegar no prazo, a Promise
   rejeita, o erro sobe até o `catch` do `chat.ts`, que emite o evento de erro
   + `[DONE]` e encerra o stream corretamente.

Arquivos: `backend/src/lib/llm/maritaca.ts`

---

## Resumo por área

| Área | Commits | Status |
|------|---------|--------|
| Setup inicial | 1 | ✅ |
| i18n pt-BR | 9 | ✅ |
| White-label / marca | 2 | ✅ |
| Estabilidade ReactMarkdown | 2 | ✅ |
| Terminologia e UX | 4 | ✅ |
| Provedor Maritaca | 4 | ✅ |
| **Total** | **22** | |

---

## Próximos passos em avaliação

- [ ] Integração com Ollama (modelos locais via `http://localhost:11434`)
  - Requer novo provider `ollama.ts` usando Chat Completions API
  - Atualização de `models.ts` com prefixo `ollama:`
  - UI no seletor de modelos
