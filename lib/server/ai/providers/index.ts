import { envPresent } from "@/modules/payment-providers";

function isDevelopmentAiEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.FLASH_ONE_ENABLE_DEV_AI_PROVIDER === "true"
  );
}

export type AiProviderReply = {
  body: string;
  suggestion?: Record<string, unknown>;
  providerCode: string;
  modelIdentifier: string | null;
};

export type AiProviderAdapter = {
  code: string;
  displayName: string;
  isConfigured(): boolean;
  complete(input: { body: string }): Promise<AiProviderReply | { unavailable: string }>;
};

export const developmentTestAiAdapter: AiProviderAdapter = {
  code: "development_test",
  displayName: "Development test",
  isConfigured() {
    return isDevelopmentAiEnabled();
  },
  async complete(input) {
    if (!this.isConfigured()) {
      return { unavailable: "Development AI is not enabled." };
    }
    return {
      body: "This is a Flash One development assistant, not a live language model. Review any suggestion before acting. Nothing was submitted automatically.",
      suggestion: {
        title: input.body.slice(0, 160) || "Project idea",
        summary: input.body.slice(0, 400) || "A structured draft prepared from the submitted idea.",
      },
      providerCode: "development_test",
      modelIdentifier: "development_test",
    };
  },
};

export const openaiAdapter: AiProviderAdapter = {
  code: "openai",
  displayName: "OpenAI",
  isConfigured() {
    return envPresent("OPENAI_API_KEY");
  },
  async complete() {
    return {
      unavailable: "OpenAI is not enabled without verified credentials and official API wiring.",
    };
  },
};

export const anthropicAdapter: AiProviderAdapter = {
  code: "anthropic",
  displayName: "Anthropic",
  isConfigured() {
    return envPresent("ANTHROPIC_API_KEY");
  },
  async complete() {
    return {
      unavailable: "Anthropic is not enabled without verified credentials and official API wiring.",
    };
  },
};

const adapters: AiProviderAdapter[] = [
  developmentTestAiAdapter,
  openaiAdapter,
  anthropicAdapter,
];

export function listAiAdapters() {
  return adapters;
}

export function resolveAiAdapter(): AiProviderAdapter | null {
  if (developmentTestAiAdapter.isConfigured()) {
    return developmentTestAiAdapter;
  }
  if (openaiAdapter.isConfigured()) {
    return openaiAdapter;
  }
  if (anthropicAdapter.isConfigured()) {
    return anthropicAdapter;
  }
  return null;
}
