import { describe, expect, it } from "vitest";
import {
  NEXTAPI_MODELS,
  PROVIDER_PRESETS,
  defaultCustomChannelEfforts,
  findProviderPreset,
  resolveProviderApiKeyUrl,
  resolveProviderBrandId,
} from "./providerPresets";

describe("providerPresets", () => {
  it("ships only NextAPI preset", () => {
    expect(PROVIDER_PRESETS.map((p) => p.id)).toEqual(["nextapi"]);
    expect(findProviderPreset("deepseek")).toBeUndefined();
    expect(findProviderPreset("amux")).toBeUndefined();
    expect(findProviderPreset("yun-api")).toBeUndefined();
  });

  it("ships NextAPI with grok-4.5 and openai-next base", () => {
    const next = findProviderPreset("nextapi");
    expect(next).toBeDefined();
    expect(next!.name).toBe("NextAPI");
    expect(next!.baseUrl).toBe("https://api.openai-next.com/v1");
    expect(next!.apiBackend).toBe("responses");
    expect(NEXTAPI_MODELS).toEqual([{ id: "grok-4.5", name: "Grok 4.5" }]);
    expect(next!.models).toEqual(NEXTAPI_MODELS);
    expect(next!.efforts.map((e) => e.id)).toEqual(["low", "medium", "high"]);
    expect(next!.apiKeyUrl).toBe("https://api.openai-next.com");
  });

  it("resolves get-api-key URLs by id or base host", () => {
    expect(resolveProviderApiKeyUrl({ providerId: "nextapi" })).toBe(
      "https://api.openai-next.com",
    );
    expect(
      resolveProviderApiKeyUrl({ baseUrl: "https://api.openai-next.com/v1" }),
    ).toBe("https://api.openai-next.com");
    expect(resolveProviderApiKeyUrl({ providerId: "deepseek" })).toBe(null);
    expect(
      resolveProviderApiKeyUrl({ baseUrl: "https://api.amux.ai/v1" }),
    ).toBe(null);
    expect(resolveProviderApiKeyUrl({ baseUrl: "https://example.com" })).toBe(
      null,
    );
  });

  it("has no brand logos for gallery presets", () => {
    expect(resolveProviderBrandId({ providerId: "nextapi" })).toBe(null);
    expect(
      resolveProviderBrandId({ baseUrl: "https://api.openai-next.com/v1" }),
    ).toBe(null);
  });

  it("defaults blank custom channels to Grok low/medium/high (ladder order)", () => {
    expect(defaultCustomChannelEfforts().map((e) => e.id)).toEqual([
      "low",
      "medium",
      "high",
    ]);
  });
});
