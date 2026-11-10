import { describe, expect, it } from "vitest";
import { mapMeasurement } from "@/lib/lab-map";

describe("mapping units printed on lab reports", () => {
  it("keeps SI units and flags conventional ones", () => {
    expect(mapMeasurement("creatinineUmolL", { value: 84, unit: "µmol/L" })).toEqual({ value: 84, unit: "si" });
    expect(mapMeasurement("creatinineUmolL", { value: 0.95, unit: "mg/dL" })).toEqual({ value: 0.95, unit: "conv" });
    expect(mapMeasurement("vitaminDNmolL", { value: 22, unit: "ng/mL" })).toEqual({ value: 22, unit: "conv" });
    expect(mapMeasurement("b12PmolL", { value: 350, unit: "pg/mL" })).toEqual({ value: 350, unit: "conv" });
  });

  it("handles common spelling variants", () => {
    expect(mapMeasurement("creatinineUmolL", { value: 84, unit: "umol/l" })?.unit).toBe("si");
    expect(mapMeasurement("creatinineUmolL", { value: 84, unit: "μmol / L" })?.unit).toBe("si");
    expect(mapMeasurement("altUL", { value: 30, unit: "IU/L" })).toEqual({ value: 30 });
    expect(mapMeasurement("egfr", { value: 95, unit: "mL/min/1.73m2" })).toEqual({ value: 95 });
    expect(mapMeasurement("ferritinUgL", { value: 40, unit: "ng/mL" })).toEqual({ value: 40 });
  });

  it("converts units the form doesn't offer", () => {
    expect(mapMeasurement("uricAcidUmolL", { value: 0.36, unit: "mmol/L" })).toEqual({ value: 360, unit: "si" });
    expect(mapMeasurement("hba1cPercent", { value: 48, unit: "mmol/mol" })).toEqual({ value: 6.5 });
  });

  it("refuses units it doesn't recognise rather than guessing", () => {
    expect(mapMeasurement("creatinineUmolL", { value: 1, unit: "mg/L" })).toBeNull();
    expect(mapMeasurement("vitaminDNmolL", { value: 1, unit: "IU" })).toBeNull();
  });
});
