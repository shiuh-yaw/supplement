import { describe, expect, it } from "vitest";
import { defaultLabUnit, fromSi, suggestOtherUnit, toSi } from "../src";

describe("lab unit conversion", () => {
  it("converts conventional units to SI", () => {
    expect(toSi("creatinineUmolL", 1, "conv")).toBe(88.4);
    expect(toSi("uricAcidUmolL", 6, "conv")).toBe(356.9);
    expect(toSi("vitaminDNmolL", 20, "conv")).toBe(49.9);
    expect(toSi("b12PmolL", 300, "conv")).toBe(221.4);
    expect(toSi("creatinineUmolL", 80, "si")).toBe(80);
  });

  it("converts back for display", () => {
    expect(fromSi("creatinineUmolL", 88.42, "conv")).toBe(1);
    expect(fromSi("vitaminDNmolL", 74.88, "conv")).toBe(30);
  });

  it("spots values entered in the wrong unit", () => {
    expect(suggestOtherUnit("creatinineUmolL", 0.9, "si")).toBe("conv");
    expect(suggestOtherUnit("creatinineUmolL", 85, "conv")).toBe("si");
    expect(suggestOtherUnit("creatinineUmolL", 85, "si")).toBeNull();
    expect(suggestOtherUnit("uricAcidUmolL", 6.5, "si")).toBe("conv");
    expect(suggestOtherUnit("vitaminDNmolL", 180, "conv")).toBe("si");
  });

  it("defaults to SI in Malaysia/Singapore and conventional elsewhere", () => {
    expect(defaultLabUnit("MY")).toBe("si");
    expect(defaultLabUnit("ID")).toBe("conv");
  });
});
