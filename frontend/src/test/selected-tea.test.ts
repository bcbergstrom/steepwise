import { describe, expect, it } from "vitest";
import { quantityInGrams, recommendedTemperature } from "@/lib/selected-tea";

const tea = { id: "tea", name: "Sencha", type: "Green" };

describe("tea quantities in grams", () => {
  it("treats bare quantities as grams", () => {
    expect(quantityInGrams("125")).toBe("125 g");
    expect(quantityInGrams("0")).toBe("0 g");
  });
  it("does not duplicate existing gram units", () => {
    expect(quantityInGrams("125 g")).toBe("125 g");
    expect(quantityInGrams("12.5 grams")).toBe("12.5 g");
  });
  it("converts existing kilogram quantities to grams", () => {
    expect(quantityInGrams("0.25 kg")).toBe("250 g");
  });
  it("does not invent a quantity when none was entered", () => {
    expect(quantityInGrams("")).toBe("Not provided");
  });
});

describe("selected tea recommended temperature", () => {
  it("averages the minimum and maximum temperatures", () => {
    expect(recommendedTemperature({ ...tea, recommended_temp_min: 75, recommended_temp_max: 90 })).toBe(82.5);
  });
  it("keeps zero as a valid endpoint", () => {
    expect(recommendedTemperature({ ...tea, recommended_temp_min: 0, recommended_temp_max: 100 })).toBe(50);
  });
  it("does not invent a recommendation when a range is missing", () => {
    expect(recommendedTemperature(tea)).toBeNull();
    expect(recommendedTemperature({ ...tea, recommended_temp_min: 80, recommended_temp_max: null })).toBeNull();
  });
});