import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-ignore existing client helpers are JavaScript modules.
import { buildOrdersCsv } from "../client/src/lib/orderCsv";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("admin class and order usability", () => {
  it("exports UTF-8 CSV with customer, payment, and timestamp fields", () => {
    const csv = buildOrdersCsv([{
      orderId: "SH-001",
      name: "André, Tuwan",
      email: "andre@example.com",
      phone: "08111602028",
      className: "Kelas Solopreneur",
      amount: 200000,
      paymentStatus: "paid",
      paymentMethod: "QRIS",
      createdAt: "2026-09-25T03:00:00.000Z",
      paidAt: "2026-09-25T03:05:00.000Z",
    }]);

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"Order ID","Nama","Email","Nomor HP"');
    expect(csv).toContain('"André, Tuwan"');
    expect(csv).toContain('"\t08111602028"');
    expect(csv).toContain('"200000","paid","QRIS"');
  });

  it("keeps inline slug editing scoped to a dedicated backend mutation", () => {
    const page = read("../client/src/pages/AdminClassesPage.jsx");
    const router = read("./routers.ts");
    const db = read("./db.ts");

    expect(page).toContain("trpc.classAdmin.updateSlug.useMutation");
    expect(page).toContain("/kelas/");
    expect(router).toContain("updateSlug: adminProcedure");
    expect(router).toContain("slug: slugSchema");
    expect(db).toContain("SLUG_ALREADY_EXISTS");
    expect(db).toContain("canonicalUrl: `https://www.starthustler.com/kelas/${slug}`");
  });

  it("shows separate operational customer columns in the order table", () => {
    const page = read("../client/src/pages/AdminOrdersPage.jsx");
    for (const heading of ["<th>Nama</th>", "<th>Email</th>", "<th>Nomor HP</th>"]) {
      expect(page).toContain(heading);
    }
    expect(page).toContain("Export Orders");
    expect(page).toContain("trpc.commerceAdmin.exportOrders.useQuery");
  });
});
