import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ArrowRight, LockKeyhole } from "lucide-react";
// JSX components are intentionally JavaScript in the existing client codebase.
// @ts-ignore no declaration file for this JSX module
import { Button } from "../client/src/components/PrimaryButton";
// @ts-ignore no declaration file for this JSX module
import { BenefitItem, ClassImage, EventInfo, FormField, PriceDisplay } from "../client/src/components/class/ClassUi";

const h = React.createElement;

describe("class landing reusable UI", () => {
  it("renders CTA label and icons in one shared, non-fragmented content row", () => {
    const html = renderToStaticMarkup(
      h(
        Button,
        {
          href: "#daftar-kelas",
          startIcon: h("span", null, "🚀"),
          endIcon: h(ArrowRight, { size: 16 }),
        },
        "Daftar Kelas"
      )
    );

    expect(html).toContain('class="button button--primary button--md"');
    expect(html).toContain('class="button__content"');
    expect(html).toContain('class="button__label">Daftar Kelas</span>');
    expect(html.match(/button__icon/g)).toHaveLength(2);
    expect(html).not.toContain("<br");
  });

  it("uses the same Button for a full-width checkout submit state", () => {
    const html = renderToStaticMarkup(
      h(
        Button,
        {
          type: "submit",
          fullWidth: true,
          startIcon: h(LockKeyhole, { size: 17 }),
        },
        "Lanjut ke Pembayaran"
      )
    );

    expect(html).toContain("button--full");
    expect(html).toContain('type="submit"');
    expect(html).toContain("Lanjut ke Pembayaran");
  });

  it("renders reusable price, event, benefit, and form primitives", () => {
    const html = renderToStaticMarkup(
      h(
        React.Fragment,
        null,
        h(PriceDisplay, { sellingPrice: 10_000, originalPrice: 20_000, promoLabel: "Hemat Rp10.000" }),
        h(EventInfo, {
          items: [{ key: "schedule", value: "Jumat, 19.00 WIB" }],
        }),
        h(BenefitItem, null, "Akses rekaman kelas"),
        h(FormField, { label: "Email", name: "email", type: "email" })
      )
    );

    expect(html).toContain("Rp10.000");
    expect(html).toContain("Rp20.000");
    expect(html).toContain("Harga normal");
    expect(html).toContain("Hemat Rp10.000");
    expect(html.indexOf("Rp20.000")).toBeLessThan(html.indexOf("Rp10.000"));
    expect(html.indexOf("Rp10.000")).toBeLessThan(html.indexOf("Hemat Rp10.000"));
    expect(html).toContain("Jumat, 19.00 WIB");
    expect(html).toContain("Akses rekaman kelas");
    expect(html).toContain('name="email"');
  });

  it("keeps image loading policy inside the shared class image atom", () => {
    const lazyImage = renderToStaticMarkup(
      h(ClassImage, { src: "/below-fold.webp", alt: "Materi", width: 800, height: 600 })
    );
    const heroImage = renderToStaticMarkup(
      h(ClassImage, { src: "/hero.webp", alt: "Hero", width: 1920, height: 1080, eager: true })
    );

    expect(lazyImage).toContain('loading="lazy"');
    expect(lazyImage).toContain('fetchPriority="auto"');
    expect(lazyImage).toContain('width="800"');
    expect(heroImage).toContain('loading="eager"');
    expect(heroImage).toContain('fetchPriority="high"');
  });

  it("keeps CTA content unbroken on desktop and narrow mobile layouts", () => {
    const css = readFileSync(
      new URL("../client/src/index.css", import.meta.url),
      "utf8"
    );

    expect(css).toMatch(/\.button__content\s*\{[^}]*display:inline-flex[^}]*flex-wrap:nowrap[^}]*white-space:nowrap/s);
    expect(css).toMatch(/\.button__label\s*\{[^}]*white-space:nowrap/s);
    expect(css).toContain("@media (max-width: 460px)");
    expect(css).toMatch(/\.class-checkout-card \.button\s*\{[^}]*font-size: 13px/s);
    expect(css).toMatch(/\.class-checkout-card__product\s*\{[^}]*text-align:center;/s);
    expect(css).toMatch(/\.class-checkout-card__product \.price-display\s*\{[^}]*align-items:center;[^}]*text-align:center;/s);
    expect(css).toMatch(/\.class-checkout-card__product \.event-info--compact\s*\{[^}]*text-align:center;[^}]*width:100%;/s);
  });

  it("can hide the global join CTA on managed class landing pages", () => {
    const navbar = readFileSync(
      new URL("../client/src/components/Navbar.jsx", import.meta.url),
      "utf8"
    );
    const page = readFileSync(
      new URL("../client/src/pages/ManagedClassPage.jsx", import.meta.url),
      "utf8"
    );
    expect(navbar).toContain("showCta = true");
    expect(navbar).toContain("{showCta &&");
    expect(page.match(/<Navbar showCta=\{false\} \/>/g)).toHaveLength(2);
  });

  it("keeps registration anchor scrolling active when another listener prevents the default link action", () => {
    const source = readFileSync(
      new URL("../client/src/pages/ManagedClassPage.jsx", import.meta.url),
      "utf8"
    );

    expect(source).toContain('document.getElementById("daftar-kelas")?.scrollIntoView');
    expect(source).not.toContain("if (event.defaultPrevented) return;");
  });
});
