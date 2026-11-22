import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Leaf, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addSpringTea, removeSpringTea, springAuth, springCollection } from "@/lib/spring-api";
import { supabase } from "@/integrations/supabase/client";
import { teaCollectionSchema, emptyCollection, type CollectionDraft } from "@/lib/tea-collection";
import { quantityInGrams } from "@/lib/selected-tea";

export function TeaCollection({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState(emptyCollection);
  const [formError, setFormError] = useState("");
  const queryKey = ["tea-collection", userId];
  const teas = useQuery({ queryKey, queryFn: async () => {
    if (springAuth) return springCollection();
    const { data, error } = await supabase.from("tea_collection").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } });
  const add = useMutation({
    mutationFn: async (input: CollectionDraft) => {
      const validated = teaCollectionSchema.parse(input);
      if (springAuth) return addSpringTea(validated);
      const { error } = await supabase.from("tea_collection").insert({ ...validated, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => { setDraft(emptyCollection); qc.invalidateQueries({ queryKey }); toast.success("Tea added to your collection."); },
    onError: (error: Error) => setFormError(error.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (springAuth) return removeSpringTea(id);
      const { error } = await supabase.from("tea_collection").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (error: Error) => toast.error(error.message),
  });
  const inputClass = "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";
  const field = (key: "name" | "origin_country" | "origin_region" | "quantity_stored", label: string, maxLength: number, required = false) => (
    <label className="block text-sm" key={key}>{label}{required && <span className="text-primary"> *</span>}
      <input className={inputClass} required={required} maxLength={maxLength} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
    </label>
  );
  return <section aria-labelledby="tea-upload-heading" className="border-t border-border">
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="tea-upload-heading" className="font-serif text-4xl">Tea upload</h2>
        <span className="text-sm text-muted-foreground">{teas.data?.length ?? 0} teas stored</span>
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        <form className="space-y-5" onSubmit={(event) => {
          event.preventDefault(); setFormError("");
          const result = teaCollectionSchema.safeParse(draft);
          if (!result.success) { setFormError(result.error.issues[0]?.message ?? "Please check the tea details."); return; }
          add.mutate(result.data);
        }}>
          {field("name", "Name of tea", 200, true)}
          <label className="block text-sm">Type of tea <span className="text-primary">*</span>
            <input required maxLength={100} list="collection-tea-types" className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} />
            <datalist id="collection-tea-types">{["Green", "Black", "Oolong", "White", "Pu-erh", "Herbal", "Yellow"].map((type) => <option key={type} value={type} />)}</datalist>
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("origin_country", "Origin country", 200)}
            {field("origin_region", "Origin region", 200)}
            <label className="block text-sm">Harvest year<input className={inputClass} type="number" min={1} max={9999} step={1} value={draft.harvest_year ?? ""} onChange={(event) => setDraft({ ...draft, harvest_year: event.target.value === "" ? null : Number(event.target.value) })} /></label>
            <label className="block text-sm">Harvest season<select className={inputClass} value={draft.harvest_season} onChange={(event) => setDraft({ ...draft, harvest_season: event.target.value })}><option value="">Not specified</option>{["Spring", "Summer", "Autumn", "Winter"].map((season) => <option key={season}>{season}</option>)}</select></label>
          </div>
          {field("quantity_stored", "Quantity stored (g)", 100)}
          <fieldset>
            <legend className="text-sm">Recommended temperature range (°C)</legend>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="block text-sm text-muted-foreground">Minimum (°C)<input className={inputClass} type="number" min={0} max={100} step="any" value={draft.recommended_temp_min ?? ""} onChange={(event) => setDraft({ ...draft, recommended_temp_min: event.target.value === "" ? null : Number(event.target.value) })} /></label>
              <label className="block text-sm text-muted-foreground">Maximum (°C)<input className={inputClass} type="number" min={0} max={100} step="any" value={draft.recommended_temp_max ?? ""} onChange={(event) => setDraft({ ...draft, recommended_temp_max: event.target.value === "" ? null : Number(event.target.value) })} /></label>
            </div>
          </fieldset>
          <label className="block text-sm">Notes<textarea className={inputClass} rows={4} maxLength={5000} placeholder="Appearance, where you obtained it…" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
          <Button type="submit" disabled={add.isPending}><Plus />{add.isPending ? "Saving…" : "Add tea"}</Button>
        </form>
        <div>
          <h3 className="mb-5 font-serif text-2xl">Tea collection</h3>
          {teas.isLoading && <p role="status" className="text-muted-foreground">Loading teas…</p>}
          {teas.isError && <div role="alert"><p className="text-destructive">Your tea collection couldn’t load.</p><Button variant="outline" className="mt-3" onClick={() => teas.refetch()}>Try again</Button></div>}
          {!teas.isLoading && !teas.isError && !teas.data?.length && <div className="py-8 text-muted-foreground"><Leaf className="mb-3 size-6" /><p>No teas stored yet.</p></div>}
          <ul className="space-y-4">{teas.data?.map((tea) => <li key={tea.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="break-words font-serif text-2xl">{tea.name}</h4><p className="mt-1 break-words text-sm text-primary">{tea.type}</p></div><Button variant="ghost" size="icon" title={`Remove ${tea.name}`} aria-label={`Remove ${tea.name}`} disabled={remove.isPending} onClick={() => remove.mutate(tea.id)}><Trash2 className="text-muted-foreground" /></Button></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">{[
              ["Country", tea.origin_country], ["Region", tea.origin_region], ["Harvest year", tea.harvest_year], ["Season", tea.harvest_season], ["Quantity stored (g)", tea.quantity_stored ? quantityInGrams(tea.quantity_stored) : ""],
            ].map(([label, value]) => value ? <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div> : null)}</dl>
            {tea.recommended_temp_min !== null && tea.recommended_temp_max !== null && <div className="mt-3 text-sm"><p className="text-xs text-muted-foreground">Recommended temperature</p><p>{tea.recommended_temp_min}–{tea.recommended_temp_max}°C</p></div>}
            {tea.notes && <p className="mt-4 whitespace-pre-wrap break-words text-sm text-foreground/80">{tea.notes}</p>}
          </li>)}</ul>
        </div>
      </div>
    </div>
  </section>;
}