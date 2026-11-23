export type SavedTea = {
  id: string;
  name: string;
  type: string;
  origin_country?: string | null;
  quantity_stored?: string | null;
  notes?: string | null;
  recommended_temp_min?: number | null;
  recommended_temp_max?: number | null;
};

export function recommendedTemperature(tea: SavedTea): number | null {
  const min = tea.recommended_temp_min;
  const max = tea.recommended_temp_max;
  return min == null || max == null ? null : (min + max) / 2;
}

export function stockWeightInGrams(quantity?: string | null): number | null {
  const value = quantity?.trim();
  if (!value) return null;
  const match = /^(\d+(?:\.\d+)?)\s*(g|grams?|kg|kilograms?)?$/i.exec(value);
  if (!match?.[1]) return null;
  const amount = Number(match[1]);
  const kilograms = match[2]?.toLowerCase().startsWith("k");
  return kilograms ? Number((amount * 1000).toFixed(6)) : amount;
}

export function quantityInGrams(quantity?: string | null): string {
  const grams = stockWeightInGrams(quantity);
  return grams === null ? quantity?.trim() || "Not provided" : `${grams} g`;
}