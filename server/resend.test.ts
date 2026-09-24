import { describe, expect, it } from "vitest";
import { enrollmentEmailHtml, paymentEmailHtml } from "./integrations/resend.js";

describe("transactional email templates", () => {
  it("escapes customer data and includes the checkout link", () => {
    const html = paymentEmailHtml({
      name: "<script>alert(1)</script>",
      className: "Kelas Solopreneur",
      invoiceNumber: "SH-1",
      amountLabel: "Rp200.000",
      paymentUrl: "https://checkout.example.test/pay",
      expiresLabel: "24 September 2026",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("https://checkout.example.test/pay");
  });

  it("only includes meeting access in the paid email", () => {
    const html = enrollmentEmailHtml({
      name: "Andre",
      className: "Kelas Solopreneur",
      schedule: "19.00 WIB",
      meetingLabel: "Live via Zoom",
      meetingUrl: "https://zoom.example.test/j/123",
      setupUrl: "https://starthustler.com/akun/aktivasi/token",
    });
    expect(html).toContain("zoom.example.test");
    expect(html).toContain("Buat Password Akun");
  });
});
