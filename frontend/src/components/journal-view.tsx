import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { quantityInGrams, recommendedTemperature, type SavedTea } from "@/lib/selected-tea";
export type { SavedTea } from "@/lib/selected-tea";

const blank = { name: "", type: "Green", temp: "", steep_time: "", notes: "" };
export type TeaDraft = typeof blank & { steep_count?: number | null; tea_id?: string; grams_brewed?: number | null; request_id?: string };
export type TeaEntry = TeaDraft & { id: string; brewed_on: string; created_at?: string };

const submissionDateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function SubmissionTime({ entry }: { entry: TeaEntry }) {
  const timestamp = entry.created_at ?? entry.brewed_on;
  const date = new Date(timestamp);
  const className = "text-xs text-muted-foreground";

  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp) || Number.isNaN(date.getTime())) {
    return <span className={className}>{entry.brewed_on}</span>;
  }

  return <time className={className} dateTime={date.toISOString()}>{submissionDateFormat.format(date)}</time>;
}

export function JournalView({ name, list, teas, onAdd, onRemove, onExit, exitLabel, pending = false, loading = false, teasLoading = false, teasError = false, trackInventory = true, onDescribeNotes, headerActions }: {
  name: string; list: TeaEntry[]; onAdd: (entry: TeaDraft) => boolean | Promise<boolean>; onRemove: (id: string) => void;
  onDescribeNotes?: (notes: string) => Promise<string>;
  teas: SavedTea[]; onExit: () => void; exitLabel: string; pending?: boolean; loading?: boolean; teasLoading?: boolean; teasError?: boolean; trackInventory?: boolean; headerActions?: ReactNode;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [f, setF] = useState(blank);
  const [teaId, setTeaId] = useState("");
  const [steepCount, setSteepCount] = useState("");
  const [grams, setGrams] = useState("");
  const saving = useRef(false);
  const attemptedEntry = useRef<{ body: string; id: string } | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [description, setDescription] = useState<{ suggestion?: string; error?: string }>({});
  const [describing, setDescribing] = useState(false);
  const notesRevision = useRef(0);
  const notes = useRef<HTMLTextAreaElement>(null);
  const selectedTea = teas.find((tea) => tea.id === teaId);
  const recommendedTemp = selectedTea ? recommendedTemperature(selectedTea) : null;
  const teaTypes = new Map<string, string>();
  for (const entry of list) {
    const label = entry.type.trim();
    const key = label.toLowerCase();
    if (key && !teaTypes.has(key)) teaTypes.set(key, label);
  }
  const activeFilter = filter !== null && teaTypes.has(filter) ? filter : null;
  const filters = [...teaTypes].sort(([, first], [, second]) => first.localeCompare(second));
  const shown = activeFilter === null ? list : list.filter((entry) => entry.type.trim().toLowerCase() === activeFilter);
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
  const updateNotes = (value: string) => {
    notesRevision.current += 1;
    setDescription({});
    setF((draft) => ({ ...draft, notes: value }));
  };

  const describeNotes = async () => {
    if (!onDescribeNotes || !f.notes.trim()) {
      setShowPrompts(!showPrompts);
      if (!showPrompts) notes.current?.focus();
      return;
    }
    const revision = notesRevision.current;
    setDescription({});
    setDescribing(true);
    try {
      const suggestion = await onDescribeNotes(f.notes.trim());
      if (revision === notesRevision.current) setDescription({ suggestion });
    } catch (error) {
      if (revision === notesRevision.current) {
        setDescription({ error: error instanceof Error ? error.message : "AI suggestions are unavailable right now." });
      }
    } finally {
      setDescribing(false);
    }
  };

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
        <form onSubmit={async (event) => {
          event.preventDefault();
          if (!selectedTea || pending || saving.current) return;
          const weight = Number(grams);
          if (trackInventory && (!Number.isFinite(weight) || weight <= 0)) return;
          const entry: TeaDraft = {
            ...f,
            name: selectedTea.name,
            type: selectedTea.type,
            ...(steepCount && { steep_count: Number(steepCount) }),
            ...(trackInventory && { tea_id: selectedTea.id, grams_brewed: weight }),
          };

          if (trackInventory) {
            const body = JSON.stringify(entry);
            if (attemptedEntry.current?.body !== body) {
              attemptedEntry.current = { body, id: crypto.randomUUID() };
            }
            entry.request_id = attemptedEntry.current.id;
          }

          saving.current = true;
          try {
            const result = onAdd(entry);
            if (!(typeof result === "boolean" ? result : await result)) return;
            attemptedEntry.current = null;
            setF(blank);
            setTeaId("");
            setSteepCount("");
            setGrams("");
            setShowPrompts(false);
            notesRevision.current += 1;
            setDescription({});
          } finally {
            saving.current = false;
          }
        }} className="h-fit space-y-3 rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">New Tasting Entry</h2>
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
          {trackInventory && (
            <div>
              <label className="block text-sm">Grams of tea brewed
                <input className={`${input} mt-2`} type="number" inputMode="decimal" min="0.001"
                  max="999999999.999" step="0.001" required value={grams} disabled={pending}
                  aria-describedby="brewed-weight-help" onChange={(event) => setGrams(event.target.value)} />
              </label>
              <p id="brewed-weight-help" className="mt-1 text-xs text-muted-foreground">Enter the total dry tea used for this tasting.</p>
            </div>
          )}
          <label className="block text-sm">Steep temperature
            <input className={`${input} mt-2`} placeholder="e.g. 85°C" maxLength={100}
              value={f.temp} onChange={(event) => setF({ ...f, temp: event.target.value })} />
          </label>
          <label className="block text-sm">Number of steeps
            <input className={`${input} mt-2`} type="number" inputMode="numeric" min={1} max={2147483647} step={1}
              value={steepCount} onChange={(event) => setSteepCount(event.target.value)} />
          </label>
          <label className="block text-sm">Steep time
            <input className={`${input} mt-2`} placeholder="e.g. 30 seconds" maxLength={100}
              value={f.steep_time} onChange={(event) => setF({ ...f, steep_time: event.target.value })} />
          </label>
          <label className="block text-sm">Flavor notes
            <textarea ref={notes} className={`${input} mt-2`} rows={3} maxLength={5000}
              value={f.notes} aria-describedby={showPrompts ? "flavor-prompts" : undefined}
              onChange={(event) => updateNotes(event.target.value)} />
          </label>
          <Button type="button" variant="outline" className="w-full" disabled={describing || pending}
            aria-expanded={!onDescribeNotes || !f.notes.trim() ? showPrompts : undefined} onClick={describeNotes}>
            {describing ? "Describing notes…" : "Describe notes"}
          </Button>
          {description.error && <p role="alert" className="text-sm text-destructive">{description.error}</p>}
          {description.suggestion && (
            <div className="space-y-2 rounded-md border border-border p-3 text-sm">
              <p className="font-medium">AI suggestion</p>
              <p role="status" className="whitespace-pre-wrap break-words">{description.suggestion}</p>
              <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => {
                updateNotes(description.suggestion ?? "");
                notes.current?.focus();
              }}>Use suggestion</Button>
            </div>
          )}
          {showPrompts && <p id="flavor-prompts" className="text-sm text-muted-foreground">
            What did you notice first? Try describing the aroma, flavor, texture, and aftertaste. Did they change across steeps?
          </p>}
          <Button disabled={pending || !selectedTea || teasLoading || teasError} className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add to journal</Button>
        </form>
        <section>
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter tastings by tea type">
            {([[null, "All types"], ...filters] as const).map(([key, label]) => (
              <Button key={key ?? ""} aria-pressed={activeFilter === key} onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs ${activeFilter === key ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>{label}</Button>
            ))}
          </div>
          <ul className="space-y-4">
            {shown.map((e) => (
              <li key={e.id} className="group rounded-lg border border-border bg-card p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl">{e.name}</h3>
                  <SubmissionTime entry={e} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 text-accent-foreground">{e.type}</span>
                  {e.grams_brewed != null && <span>{e.grams_brewed} g brewed</span>}
                  {e.temp && <span>{e.temp}</span>}
                  {e.steep_count != null && <span>{e.steep_count} {e.steep_count === 1 ? "steep" : "steeps"}</span>}
                  {e.steep_time && <span>{e.steep_time}</span>}
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
