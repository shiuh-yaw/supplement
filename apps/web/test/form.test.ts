import { describe, expect, it } from "vitest";
import { errorsForStep, fieldFromIssuePath, initialForm, toProfile, validate, type FormState } from "@/lib/form";

const valid: FormState = {
  ...initialForm,
  age: "34",
  sex: "male",
  weightKg: "72",
  goal: "muscle_gain",
  consent: true,
};

describe("validate", () => {
  it("accepts a complete form", () => {
    expect(validate(valid)).toEqual({});
  });

  it("reports each problem on its own field and step", () => {
    const errors = validate({ ...initialForm });
    expect(Object.keys(errors).sort()).toEqual(["age", "consent", "goal", "sex", "weightKg"]);
    expect(Object.keys(errorsForStep(errors, 0)).sort()).toEqual(["age", "sex", "weightKg"]);
    expect(Object.keys(errorsForStep(errors, 1))).toEqual(["goal"]);
  });

  it("flags creatinine typed in mg/dL while µmol/L is selected", () => {
    const errors = validate({ ...valid, country: "MY", creatinineUmolL: "0.9" });
    expect(errors.creatinineUmolL).toMatch(/probably uses mg\/dL/);
  });

  it("accepts creatinine in mg/dL for Indonesia by default and converts it", () => {
    const form = { ...valid, country: "ID" as const, creatinineUmolL: "1.0", uricAcidUmolL: "6" };
    expect(validate(form)).toEqual({});
    expect(toProfile(form).labs).toMatchObject({ creatinineUmolL: 88.4, uricAcidUmolL: 356.9 });
  });

  it("respects a unit the user picked over the country default", () => {
    const form: FormState = { ...valid, country: "ID", creatinineUmolL: "90", labUnits: { creatinineUmolL: "umol", uricAcidUmolL: null } };
    expect(validate(form)).toEqual({});
    expect(toProfile(form).labs?.creatinineUmolL).toBe(90);
  });

  it("explains out-of-range lab values", () => {
    expect(validate({ ...valid, egfr: "500" }).egfr).toMatch(/between 1 and 200/);
    expect(validate({ ...valid, monthlyBudget: "abc" }).monthlyBudget).toBeDefined();
  });

  it("maps server issue paths to fields", () => {
    expect(fieldFromIssuePath(["labs", "egfr"])).toBe("egfr");
    expect(fieldFromIssuePath(["age"])).toBe("age");
    expect(fieldFromIssuePath(["unknown"])).toBeNull();
  });
});
