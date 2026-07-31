/**
 * Built-in custom-provider presets (add-provider gallery).
 * Values are stored in agent-home config.toml when applied.
 */

import type { ProviderEffortEntry, ProviderModelEntry } from "@/lib/api";
import { GROK_BUILD_EFFORTS } from "@/lib/grokCatalog";

/** Known brand marks with dedicated logos (see ProviderBrandIcon). */
export type ProviderBrandId = never;

export type ProviderPreset = {
  id: string;
  /** Channel display name (provider card / group). */
  name: string;
  /** Suggested config section id. */
  suggestedId: string;
  baseUrl: string;
  apiBackend: "responses" | "chat_completions" | "messages";
  models: ProviderModelEntry[];
  efforts: ProviderEffortEntry[];
  /** Optional short blurb for the gallery chip. */
  blurbKey?: string;
  /** Where to obtain an API key (opened from the form). */
  apiKeyUrl?: string;
  /** Brand logo key when available (NextAPI has none yet). */
  brandId?: ProviderBrandId;
};

/** Grok / official default reasoning tiers (low · medium · high). */
export const GROK_CHANNEL_EFFORTS: ProviderEffortEntry[] = GROK_BUILD_EFFORTS.map(
  (e) => ({
    id: e.id,
    name: e.id,
    isDefault: e.id === "medium",
  }),
);

/** NextAPI OpenAI-compatible relay. */
export const NEXTAPI_MODELS: ProviderModelEntry[] = [
  { id: "grok-4.5", name: "Grok 4.5" },
];

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "nextapi",
    name: "NextAPI",
    suggestedId: "nextapi",
    baseUrl: "https://api.openai-next.com/v1",
    apiBackend: "responses",
    models: NEXTAPI_MODELS,
    efforts: GROK_CHANNEL_EFFORTS.map((e) => ({ ...e })),
    blurbKey: "prov.preset.nextapi.blurb",
    apiKeyUrl: "https://api.openai-next.com",
  },
];

export function findProviderPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id);
}

function matchPreset(opts: {
  providerId?: string | null;
  baseUrl?: string | null;
}): ProviderPreset | undefined {
  const pid = opts.providerId?.trim().toLowerCase() ?? "";
  if (pid) {
    const byId = PROVIDER_PRESETS.find(
      (p) => p.id === pid || p.suggestedId === pid,
    );
    if (byId) return byId;
  }
  let host = "";
  try {
    host = new URL(opts.baseUrl?.trim() || "").host.toLowerCase();
  } catch {
    host = "";
  }
  if (!host) return undefined;
  for (const p of PROVIDER_PRESETS) {
    try {
      if (new URL(p.baseUrl).host.toLowerCase() === host) return p;
    } catch {
      /* skip */
    }
  }
  for (const p of PROVIDER_PRESETS) {
    try {
      const ph = new URL(p.baseUrl).host.toLowerCase();
      if (host === ph || host.endsWith(`.${ph}`) || ph.endsWith(`.${host}`)) {
        return p;
      }
    } catch {
      /* skip */
    }
  }
  return undefined;
}

/** Resolve API-key signup URL for a form (by preset id or base URL host). */
export function resolveProviderApiKeyUrl(opts: {
  providerId?: string | null;
  baseUrl?: string | null;
}): string | null {
  return matchPreset(opts)?.apiKeyUrl ?? null;
}

/** Resolve brand logo key for UI avatars (null when no mark). */
export function resolveProviderBrandId(opts: {
  providerId?: string | null;
  baseUrl?: string | null;
}): ProviderBrandId | null {
  return matchPreset(opts)?.brandId ?? null;
}

/** Default efforts when creating a blank custom channel (Grok-compatible). */
export function defaultCustomChannelEfforts(): ProviderEffortEntry[] {
  return GROK_CHANNEL_EFFORTS.map((e) => ({ ...e }));
}
