import { describe, expect, it } from "vitest";
import { decodeProfile, marketplaceLabel, readSharedProfile, shareUrl } from "@/lib/share";

const profile = {
  age: 34,
  sex: "female" as const,
  weightKg: 58,
  country: "ID" as const,
  goal: "strength" as const,
  trainingDaysPerWeek: 3,
  diet: "vegan" as const,
  halalRequired: true,
  allergies: [],
  conditions: ["hypertension" as const],
  medications: [],
  labs: { egfr: 92, creatinineUmolL: 70 },
};

describe("share links", () => {
  it("round-trips a profile through the URL fragment", () => {
    const url = shareUrl("https://sukat.example", profile);
    expect(url.startsWith("https://sukat.example/check#r=")).toBe(true);
    const decoded = readSharedProfile(new URL(url).hash);
    expect(decoded).toMatchObject({ age: 34, country: "ID", conditions: ["hypertension"], labs: { egfr: 92, creatinineUmolL: 70 } });
  });

  it("rejects tampered or invalid links", () => {
    expect(decodeProfile("not-base64!!")).toBeNull();
    expect(decodeProfile(btoa(JSON.stringify({ age: "x" })))).toBeNull();
    expect(readSharedProfile("#other=1")).toBeNull();
  });

  it("labels marketplace links", () => {
    expect(marketplaceLabel("https://shopee.com.my/product/1")).toBe("Buy on Shopee");
    expect(marketplaceLabel("https://www.lazada.co.id/p/1")).toBe("Buy on Lazada");
    expect(marketplaceLabel("https://www.tokopedia.com/x")).toBe("Buy on Tokopedia");
    expect(marketplaceLabel("https://example.com/x")).toBe("Where to buy");
    expect(marketplaceLabel("not a url")).toBe("Where to buy");
  });
});
