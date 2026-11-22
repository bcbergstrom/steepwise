import { z } from "zod";

export const teaCollectionSchema = z.object({
  name: z.string().trim().min(1, "Tea name is required.").max(200),
  type: z.string().trim().min(1, "Tea type is required.").max(100),
  origin_country: z.string().trim().max(200),
  origin_region: z.string().trim().max(200),
  harvest_year: z.number().int().min(1).max(9999).nullable(),
  harvest_season: z.string().trim().max(100),
  quantity_stored: z.string().trim().max(100),
  notes: z.string().trim().max(5000),
  recommended_temp_min: z.number().min(0).max(100, "Temperature cannot exceed 100°C.").nullable(),
  recommended_temp_max: z.number().min(0).max(100, "Temperature cannot exceed 100°C.").nullable(),
}).superRefine((tea, context) => {
  const min = tea.recommended_temp_min;
  const max = tea.recommended_temp_max;
  if ((min === null) !== (max === null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["recommended_temp_min"], message: "Enter both temperatures or leave both blank." });
  } else if (min !== null && max !== null && min > max) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["recommended_temp_max"], message: "Maximum temperature must be at least the minimum." });
  }
});
export type CollectionDraft = z.infer<typeof teaCollectionSchema>;
export const emptyCollection: CollectionDraft = {
  name: "", type: "", origin_country: "", origin_region: "", harvest_year: null,
  harvest_season: "", quantity_stored: "", notes: "",
  recommended_temp_min: null, recommended_temp_max: null,
};