import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLASS_CONTENT,
  DEFAULT_CLASS_RECORDS,
  DEFAULT_PAYMENT_URL,
  normalizeClassContent,
} from "../shared/classContent";
import { getYouTubeId } from "../shared/youtube";

describe("class CMS content", () => {
  it("keeps the official payment URL centralized", () => {
    expect(DEFAULT_CLASS_CONTENT.pricing.paymentUrl).toBe(DEFAULT_PAYMENT_URL);
    expect(DEFAULT_PAYMENT_URL).toBe(
      "https://pay.doku.com/p-link/p/JFB442avKB"
    );
  });

  it("fills missing nested values without overwriting edits", () => {
    const normalized = normalizeClassContent({
      hero: { ...DEFAULT_CLASS_CONTENT.hero, headline: "Headline baru" },
    });
    expect(normalized.hero.headline).toBe("Headline baru");
    expect(normalized.pricing.paymentUrl).toBe(DEFAULT_PAYMENT_URL);
  });

  it("provides an instant CMS fallback for every catalogue class", () => {
    expect(DEFAULT_CLASS_RECORDS.map(item => item.slug)).toEqual([
      "kelas-solopreneur",
      "cara-setup-hermes-agent",
      "konten-media-sosial-dengan-ai",
    ]);
    expect(DEFAULT_CLASS_RECORDS.every(item => item.status === "published")).toBe(true);
  });
});

describe("YouTube URL parsing", () => {
  it.each([
    ["https://www.youtube.com/watch?v=T0sqrp8r810", "T0sqrp8r810"],
    ["https://youtu.be/T0sqrp8r810", "T0sqrp8r810"],
    ["https://www.youtube.com/embed/T0sqrp8r810", "T0sqrp8r810"],
  ])("extracts video id from %s", (url, expected) =>
    expect(getYouTubeId(url)).toBe(expected)
  );

  it("rejects invalid URLs", () => expect(getYouTubeId("not-a-url")).toBe(""));
});
