import { describe, expect, it } from "vitest";
import { emptyCollection, teaCollectionSchema } from "@/lib/tea-collection";

describe("tea upload fields", () => {
  it("requires a tea name", () => {
    expect(teaCollectionSchema.safeParse({ ...emptyCollection, name: " ", type: "Green" }).success).toBe(false);
  });
  it("requires a tea type", () => {
    expect(teaCollectionSchema.safeParse({ ...emptyCollection, name: "Sencha", type: " " }).success).toBe(false);
  });
  it("allows every remaining field to be omitted", () => {
    expect(teaCollectionSchema.parse({ ...emptyCollection, name: "Sencha", type: "Green" })).toEqual({ ...emptyCollection, name: "Sencha", type: "Green" });
  });
  it("accepts the 100°C cap and rejects temperatures above it", () => {
    const tea = { ...emptyCollection, name: "Sencha", type: "Green", recommended_temp_min: 80, recommended_temp_max: 100 };
    expect(teaCollectionSchema.safeParse(tea).success).toBe(true);
    expect(teaCollectionSchema.safeParse({ ...tea, recommended_temp_max: 101 }).success).toBe(false);
    expect(teaCollectionSchema.safeParse({ ...tea, recommended_temp_min: 101, recommended_temp_max: 101 }).success).toBe(false);
  });
  it("requires an ordered temperature range", () => {
    expect(teaCollectionSchema.safeParse({ ...emptyCollection, name: "Sencha", type: "Green", recommended_temp_min: 90, recommended_temp_max: 80 }).success).toBe(false);
  });
  it("requires both range endpoints when a temperature is provided", () => {
    expect(teaCollectionSchema.safeParse({ ...emptyCollection, name: "Sencha", type: "Green", recommended_temp_min: 80 }).success).toBe(false);
  });
});