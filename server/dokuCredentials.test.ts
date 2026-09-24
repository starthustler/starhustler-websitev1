import { describe, expect, it } from "vitest";
import { extractDokuCredential } from "../shared/dokuCredentials.js";

describe("DOKU admin credential paste", () => {
  it("accepts values copied directly from DOKU", () => {
    expect(extractDokuCredential("  BANK-ABC123  ", "clientId")).toBe("BANK-ABC123");
    expect(extractDokuCredential("  SK-example_secret-123  ", "secretKey")).toBe("SK-example_secret-123");
  });

  it("extracts labelled values copied from the dashboard", () => {
    expect(extractDokuCredential("Client ID: BANK-ABC123\nCopy Client ID", "clientId")).toBe("BANK-ABC123");
    expect(extractDokuCredential("Active Secret Key (19)\nSK-example123\nKeep your secret safe", "secretKey")).toBe("SK-example123");
  });

  it("does not mistake a whole unrelated page for a credential", () => {
    expect(extractDokuCredential("API Keys\nDOKU Public Key\nMerchant Public Key", "secretKey")).toBe("");
  });
});
