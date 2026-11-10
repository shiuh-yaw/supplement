import { describe, expect, it } from "vitest";
import { fromUmolL, suggestOtherUnit, toUmolL } from "../src";

describe("lab unit conversion", () => {
  it("converts creatinine and uric acid from mg/dL to µmol/L", () => {
    expect(toUmolL("creatinineUmolL", 1, "mgdl")).toBe(88.4);
    expect(toUmolL("uricAcidUmolL", 6, "mgdl")).toBe(356.9);
    expect(toUmolL("creatinineUmolL", 80, "umol")).toBe(80);
  });

  it("converts back for display", () => {
    expect(fromUmolL("creatinineUmolL", 88.42, "mgdl")).toBe(1);
  });

  it("spots values entered in the wrong unit", () => {
    expect(suggestOtherUnit("creatinineUmolL", 0.9, "umol")).toBe("mgdl");
    expect(suggestOtherUnit("creatinineUmolL", 85, "mgdl")).toBe("umol");
    expect(suggestOtherUnit("creatinineUmolL", 85, "umol")).toBeNull();
    expect(suggestOtherUnit("uricAcidUmolL", 6.5, "umol")).toBe("mgdl");
    expect(suggestOtherUnit("uricAcidUmolL", 380, "mgdl")).toBe("umol");
    expect(suggestOtherUnit("uricAcidUmolL", 6.5, "mgdl")).toBeNull();
  });
});
