import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

describe("Solopreneur landing presentation", () => {
  it("centers a single registration card and anchors directly to it", () => {
    const component = read("../client/src/components/class/ClassCheckoutSection.jsx");
    const css = read("../client/src/index.css");

    expect(component).toContain('form id="daftar-kelas"');
    expect(component).not.toContain("Amankan tempatmu sekarang");
    expect(component).not.toContain("Harga diverifikasi oleh server");
    expect(component).not.toContain("tidak dapat diubah dari browser");
    expect(css).toMatch(/\.class-checkout-section__layout\s*\{[^}]*display:flex[^}]*justify-content:center/s);
    expect(css).toMatch(/\.class-checkout-card\s*\{[^}]*scroll-margin-top:112px[^}]*width:100%/s);
  });

  it("uses two benefit columns on desktop and aligned rows on mobile", () => {
    const css = read("../client/src/index.css");

    expect(css).toMatch(/\.benefit-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
    expect(css).toMatch(/@media \(max-width: 760px\)[\s\S]*?\.benefit-grid \.benefit-item\s*\{[^}]*flex-direction:row[^}]*text-align:left/s);
    expect(css).toContain(".benefit-grid .benefit-item > span");
  });

  it("centers the bonus section and removes the redundant hero date badge", () => {
    const page = read("../client/src/pages/ManagedClassPage.jsx");
    const css = read("../client/src/index.css");

    expect(page).toContain('className="class-managed-list--centered"');
    expect(page).not.toContain("shared.schedule.badge");
    expect(page).toContain('label: "Jadwal Kelas"');
    expect(css).toContain(".class-managed-list--centered .class-managed-list__grid");
    expect(css).toContain(".class-detail-meta.event-info--hero");
  });
});
