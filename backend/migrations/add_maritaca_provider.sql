-- Migration: adiciona 'maritaca' ao CHECK constraint de user_api_keys.provider
-- Executar uma vez em instâncias existentes.

ALTER TABLE public.user_api_keys
    DROP CONSTRAINT IF EXISTS user_api_keys_provider_check;

ALTER TABLE public.user_api_keys
    ADD CONSTRAINT user_api_keys_provider_check
    CHECK (provider IN ('claude', 'gemini', 'openai', 'maritaca'));
