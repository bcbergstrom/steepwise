import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { JournalView, type TeaEntry } from "@/components/journal-view";

export const Route = createFileRoute("/journal-preview")({
  head: () => ({ meta: [
    { title: "Journal preview — Steep AI" },
    { name: "description", content: "Try a sample Steep AI tea journal without signing in." },
    { property: "og:title", content: "Journal preview — Steep AI" },
    { property: "og:description", content: "Try a sample Steep AI tea journal without signing in." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: JournalPreview,
});

function JournalPreview() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TeaEntry[]>([
    { id: "sample-green", name: "Sencha", type: "Green", temp: "80°C", steep_time: "2 min", steep_count: 1, notes: "Fresh grass, a little sweetness, a clean finish.", brewed_on: "Sample cup" },
    { id: "sample-oolong", name: "Tie Guan Yin", type: "Oolong", temp: "90°C", steep_time: "3 min", steep_count: 2, notes: "Soft orchid notes with a lingering honey finish.", brewed_on: "Sample cup" },
    { id: "sample-black", name: "Darjeeling", type: "Black", temp: "95°C", steep_time: "3 min", steep_count: 1, notes: "Light, floral, and gently fruity.", brewed_on: "Sample cup" },
  ]);
  return <JournalView name="Preview" list={entries} teas={[
    { id: "preview-sencha", name: "Sencha", type: "Green", origin_country: "Japan", quantity_stored: "100 g", recommended_temp_min: 70, recommended_temp_max: 80, notes: "Deep green needle-shaped leaves with a fresh grassy aroma." },
    { id: "preview-oolong", name: "Tie Guan Yin", type: "Oolong", origin_country: "China", quantity_stored: "50 g", recommended_temp_min: 85, recommended_temp_max: 95, notes: "Tightly rolled green leaves, bought from a local tea shop." },
    { id: "preview-darjeeling", name: "Darjeeling", type: "Black", origin_country: "India", quantity_stored: "75 g", recommended_temp_min: 90, recommended_temp_max: 100, notes: "Fine twisted leaves with silver tips." },
  ]}
    onAdd={(entry) => setEntries((current) => [{ ...entry, id: crypto.randomUUID(), brewed_on: new Date().toLocaleDateString() }, ...current])}
    onRemove={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))}
    onExit={() => navigate({ to: "/auth" })} exitLabel="Back to sign in" />;
}