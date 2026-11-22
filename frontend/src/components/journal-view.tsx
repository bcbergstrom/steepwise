import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { quantityInGrams, recommendedTemperature, type SavedTea } from "@/lib/selected-tea";
export type { SavedTea } from "@/lib/selected-tea";

export const TYPES = ["Green", "Black", "Oolong", "White", "Pu-erh", "Herbal"];
export const blank = { name: "", type: "Green", temp: "", steep_time: "", rating: 4, notes: "" };
export type TeaDraft = typeof blank;
export type TeaEntry = TeaDraft & { id: string; brewed_on: string };

export function JournalView({ name, list, teas, onAdd, onRemove, onExit, exitLabel, pending = false, loading = false, teasLoading = false, teasError = false, headerActions }: {
  name: string; list: TeaEntry[]; onAdd: (entry: TeaDraft) => void; onRemove: (id: string) => void;
  teas: SavedTea[]; onExit: () => void; exitLabel: string; pending?: boolean; loading?: boolean; teasLoading?: boolean; teasError?: boolean; headerActions?: ReactNode;
}) {
  const [filter, setFilter] = useState("All");
  const [f, setF] = useState(blank);
  const [teaId, setTeaId] = useState("");
  const selectedTea = teas.find((tea) => tea.id === teaId);
  const recommendedTemp = selectedTea ? recommendedTemperature(selectedTea) : null;
  const shown = filter === "All" ? list : list.filter((e) => e.type === filter);
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pt-16 pb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{name}'s tea journal</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl text-foreground">Steep AI</h1>
          <p className="mt-3 max-w-md text-muted-foreground">Slow notes on the leaves you brew — {list.length} cups recorded.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {headerActions}
          <Button onClick={onExit} variant="outline" className="text-foreground">{exitLabel}</Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 md:grid-cols-[320px_1fr]">
        <form onSubmit={(ev) => { ev.preventDefault(); if (selectedTea) { onAdd({ ...f, name: selectedTea.name, type: selectedTea.type, temp: "" }); setF(blank); setTeaId(""); } }} className="h-fit space-y-3 rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">New entry</h2>
          <label className="block text-sm">Tea
            <select required className={`${input} mt-2 min-w-0`} value={teaId} disabled={teasLoading || teasError || !teas.length} onChange={(e) => setTeaId(e.target.value)}>
              <option value="">{teasLoading ? "Loading teas…" : "Select a saved tea"}</option>
              {teas.map((tea) => <option key={tea.id} value={tea.id}>{tea.name} — {tea.type}</option>)}
            </select>
          </label>
          {teasError && <p role="alert" className="text-sm text-destructive">Your saved teas couldn’t load. Please refresh and try again.</p>}
          {!teasLoading && !teasError && !teas.length && <p className="text-sm text-muted-foreground">No saved teas yet. Add a tea on the Tea upload page first.</p>}
          {selectedTea && (
            <section aria-label="Selected tea details" className="space-y-3 border-y border-border py-4">
              <h3 className="font-serif text-xl">Tea details</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Tea name", selectedTea.name],
                  ["Tea type", selectedTea.type],
                  ["Origin country", selectedTea.origin_country?.trim() || "Not provided"],
                  ["Current quantity (g)", quantityInGrams(selectedTea.quantity_stored)],
                  ["Recommended temp", recommendedTemp === null ? "Not provided" : `${recommendedTemp}°C`],
                  ["Tea notes", selectedTea.notes?.trim() || "No notes"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          <div>
            <input className={input} placeholder="Steep time" value={f.steep_time} onChange={(e) => setF({ ...f, steep_time: e.target.value })} />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button type="button" key={n} aria-label={`${n} leaves`} onClick={() => setF({ ...f, rating: n })}
                variant="ghost" size="icon" className={`text-xl ${n <= f.rating ? "text-primary" : "text-border"}`}>❦</Button>
            ))}
          </div>
          <textarea className={input} rows={3} placeholder="Tasting notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <Button disabled={pending || !selectedTea || teasLoading || teasError} className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add to journal</Button>
        </form>
        <section>
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", ...TYPES].map((t) => (
              <Button key={t} onClick={() => setFilter(t)}
                className={`rounded-full px-3 py-1 text-xs ${filter === t ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{t}</Button>
            ))}
          </div>
          <ul className="space-y-4">
            {shown.map((e) => (
              <li key={e.id} className="group rounded-lg border border-border bg-card p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl">{e.name}</h3>
                  <span className="text-xs text-muted-foreground">{e.brewed_on}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 text-accent-foreground">{e.type}</span>
                  {e.temp && <span>{e.temp}</span>}{e.steep_time && <span>· {e.steep_time}</span>}
                  <span className="text-primary">{"❦".repeat(e.rating)}</span>
                </div>
                {e.notes && <p className="mt-3 font-serif text-lg italic text-foreground/80">“{e.notes}”</p>}
                <Button onClick={() => onRemove(e.id)}
                  variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground hover:text-destructive">Remove</Button>
              </li>
            ))}
            {!loading && !shown.length && <p className="text-muted-foreground">No cups logged here yet.</p>}
          </ul>
        </section>
      </main>
    </div>
  );
}
