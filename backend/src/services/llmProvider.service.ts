// ==============================================================================
// SISODIA ATELIER - PLUG-AND-PLAY MULTI-PROVIDER LLM ADAPTER
// Supports: Gemini | Claude (Anthropic) | OpenAI | Groq | OpenRouter
// Zero code changes required: switch anytime purely via .env variables
// ==============================================================================

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'groq' | 'openrouter';

export interface LLMMessage {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface GenerateAtelierReplyOptions {
  systemInstruction: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProviderResult {
  reply: string;
  provider: AIProvider;
  model: string;
}

interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export class LlmProviderService {
  /**
   * Resolve active provider, API key, and model according to resolution rules:
   * 1. Provider: process.env.AI_PROVIDER || env.AI_PROVIDER || 'gemini'
   * 2. Key: process.env.AI_API_KEY || providerSpecificKey
   * 3. Model: process.env.AI_MODEL || provider default
   */
  public static resolveProviderConfig(): ProviderConfig {
    const rawProvider = (process.env.AI_PROVIDER || (env as any).AI_PROVIDER || 'gemini').trim().toLowerCase();
    const provider: AIProvider = (['gemini', 'claude', 'openai', 'groq', 'openrouter'].includes(rawProvider)
      ? rawProvider
      : 'gemini') as AIProvider;

    const unifiedKey = (process.env.AI_API_KEY || (env as any).AI_API_KEY || '').trim();

    let providerKey = unifiedKey;
    if (!providerKey) {
      switch (provider) {
        case 'gemini':
          providerKey = (process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '').trim();
          break;
        case 'claude':
          providerKey = (process.env.ANTHROPIC_API_KEY || (env as any).ANTHROPIC_API_KEY || '').trim();
          break;
        case 'openai':
          providerKey = (process.env.OPENAI_API_KEY || (env as any).OPENAI_API_KEY || '').trim();
          break;
        case 'groq':
          providerKey = (process.env.GROQ_API_KEY || (env as any).GROQ_API_KEY || '').trim();
          break;
        case 'openrouter':
          providerKey = (process.env.OPENROUTER_API_KEY || (env as any).OPENROUTER_API_KEY || '').trim();
          break;
      }
    }

    const customModel = (process.env.AI_MODEL || (env as any).AI_MODEL || '').trim();
    let defaultModel = 'gemini-1.5-flash';

    switch (provider) {
      case 'gemini':
        defaultModel = 'gemini-1.5-flash';
        break;
      case 'claude':
        defaultModel = 'claude-3-5-haiku-latest';
        break;
      case 'openai':
        defaultModel = 'gpt-4o-mini';
        break;
      case 'groq':
        defaultModel = 'llama-3.3-70b-versatile';
        break;
      case 'openrouter':
        defaultModel = 'meta-llama/llama-3.3-70b-instruct:free';
        break;
    }

    return {
      provider,
      apiKey: providerKey,
      model: customModel || defaultModel,
    };
  }

  /**
   * Unified Entry Point for Generating Atelier Replies
   */
  public static async generateAtelierReply(
    options: GenerateAtelierReplyOptions
  ): Promise<LLMProviderResult | null> {
    const config = this.resolveProviderConfig();

    if (!config.apiKey) {
      console.warn(`[LLM_PROVIDER_NOTICE]: No API key configured for active provider "${config.provider}".`);
      return null;
    }

    try {
      switch (config.provider) {
        case 'gemini':
          return await this.callGemini(config, options);
        case 'claude':
          return await this.callClaude(config, options);
        case 'openai':
          return await this.callOpenAICompatible(
            'https://api.openai.com/v1/chat/completions',
            config,
            options
          );
        case 'groq':
          return await this.callOpenAICompatible(
            'https://api.groq.com/openai/v1/chat/completions',
            config,
            options
          );
        case 'openrouter':
          return await this.callOpenAICompatible(
            'https://openrouter.ai/api/v1/chat/completions',
            config,
            options,
            {
              'HTTP-Referer': 'https://sisodiaatelier.com',
              'X-Title': 'SISODIA ATELIER ✧',
            }
          );
        default:
          return await this.callGemini(config, options);
      }
    } catch (err: any) {
      console.error('[LLM_PROVIDER_ERROR]:', err?.message || err);
      return null;
    }
  }

  /**
   * Provider 1: Google Gemini (SDK + Fallback Chain)
   */
  private static async callGemini(
    config: ProviderConfig,
    options: GenerateAtelierReplyOptions
  ): Promise<LLMProviderResult | null> {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const customModel = (process.env.AI_MODEL || (env as any).AI_MODEL || '').trim();
    const modelsToTry = customModel
      ? [customModel]
      : ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const contents = options.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    for (const model of modelsToTry) {
      try {
        const responsePromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.3,
            maxOutputTokens: options.maxTokens ?? 1000,
          },
        });

        const response = (await Promise.race([
          responsePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout waiting for Gemini model ${model}`)), 4000)
          ),
        ])) as any;

        const reply = response?.text?.trim();
        if (reply) {
          return {
            reply,
            provider: 'gemini',
            model,
          };
        }
      } catch (err: any) {
        console.error(`[LLM_PROVIDER_ERROR]: Gemini ${model} failed:`, err?.message || err);
      }
    }

    return null;
  }

  /**
   * Provider 2: Anthropic Claude (REST API)
   */
  private static async callClaude(
    config: ProviderConfig,
    options: GenerateAtelierReplyOptions
  ): Promise<LLMProviderResult | null> {
    const claudeMessages = options.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    if (claudeMessages.length === 0) {
      return null;
    }

    const payload = {
      model: config.model || 'claude-3-5-haiku-latest',
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.3,
      system: options.systemInstruction,
      messages: claudeMessages,
    };

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Claude API error (${resp.status}): ${errText}`);
      }

      const data: any = await resp.json();
      const text = data.content?.[0]?.text?.trim();

      if (text) {
        return {
          reply: text,
          provider: 'claude',
          model: config.model,
        };
      }
    } catch (err: any) {
      console.error('[LLM_PROVIDER_ERROR]: Claude call failed:', err?.message || err);
      throw err;
    }

    return null;
  }

  /**
   * Providers 3, 4, 5: OpenAI, Groq, OpenRouter (OpenAI-compatible /v1/chat/completions)
   */
  private static async callOpenAICompatible(
    url: string,
    config: ProviderConfig,
    options: GenerateAtelierReplyOptions,
    extraHeaders: Record<string, string> = {}
  ): Promise<LLMProviderResult | null> {
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: options.systemInstruction },
      ...options.messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const payload = {
      model: config.model,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1024,
      messages: apiMessages,
    };

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
          ...extraHeaders,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`${config.provider.toUpperCase()} API error (${resp.status}): ${errText}`);
      }

      const data: any = await resp.json();
      const text = data.choices?.[0]?.message?.content?.trim();

      if (text) {
        return {
          reply: text,
          provider: config.provider,
          model: config.model,
        };
      }
    } catch (err: any) {
      console.error(`[LLM_PROVIDER_ERROR]: ${config.provider} call failed:`, err?.message || err);
      throw err;
    }

    return null;
  }
}
