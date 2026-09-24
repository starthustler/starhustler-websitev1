import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLASS_CONTENT,
  DEFAULT_CLASS_RECORDS,
  DEFAULT_PAYMENT_URL,
  formatClassSchedule,
  formatRupiah,
  getClassCheckoutAmount,
  getSharedClassConfig,
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

  it("migrates legacy CTA, schedule, and floating values to canonical fields", () => {
    const normalized = normalizeClassContent({
      hero: {
        ...DEFAULT_CLASS_CONTENT.hero,
        primaryCtaLabel: "Ikut Sekarang",
        dateBadge: "SEP 30",
        scheduleText: "Rabu, 30 September 2026\n19.00 - 21.00",
      },
      floatingCta: {
        ...DEFAULT_CLASS_CONTENT.floatingCta,
        currentPrice: 999999,
        originalPrice: 1999999,
        icon: "✨",
      },
    } as Partial<typeof DEFAULT_CLASS_CONTENT>);

    expect(normalized.cta).toEqual({ label: "Ikut Sekarang", icon: "✨" });
    expect(normalized.schedule.badge).toBe("SEP 30");
    expect(normalized.schedule.displayText).toContain("30 September 2026");
    expect(normalized.floatingCta).not.toHaveProperty("currentPrice");
    expect(normalized.floatingCta).not.toHaveProperty("originalPrice");
    expect(normalized.floatingCta).not.toHaveProperty("icon");
  });

  it("uses one Selling Price for UI configuration and server checkout", () => {
    const content = structuredClone(DEFAULT_CLASS_CONTENT);
    content.pricing.sellingPrice = 10_000;
    const before = {
      cta: structuredClone(content.cta),
      schedule: structuredClone(content.schedule),
      originalPrice: content.pricing.originalPrice,
    };
    const shared = getSharedClassConfig("Kelas Solopreneur", content);

    expect(shared.pricing.sellingPrice).toBe(10_000);
    expect(getClassCheckoutAmount(content)).toBe(10_000);
    expect(formatRupiah(shared.pricing.sellingPrice)).toBe("Rp10.000");
    expect(content.cta).toEqual(before.cta);
    expect(content.schedule).toEqual(before.schedule);
    expect(content.pricing.originalPrice).toBe(before.originalPrice);
  });

  it("formats a schedule from its canonical date when display copy is empty", () => {
    expect(
      formatClassSchedule({
        badge: "",
        displayText: "",
        sessionDateTime: "2026-08-28T19:00:00+07:00",
        timezone: "Asia/Jakarta",
      })
    ).toContain("28 Agustus 2026");
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
