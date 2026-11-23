import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JournalView, type TeaDraft } from "@/components/journal-view";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  addSpringEntry, describeSpringNotes, removeSpringEntry, springAuth, springCollection, springEntries, springSignOut,
} from "@/lib/spring-api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "My journal — Steep AI" },
      { name: "description", content: "Your private log of teas, steep times and tasting notes." },
      { property: "og:title", content: "My journal — Steep AI" },
      { property: "og:description", content: "Your private log of teas, steep times and tasting notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Journal,
});

function Journal() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const profile = useQuery({
    queryKey: ["profile", user.id],
    enabled: !springAuth,
    queryFn: async () => (await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()).data,
  });
  const entries = useQuery({
    queryKey: ["entries", user.id],
    queryFn: async () => {
      if (springAuth) return springEntries();
      const { data, error } = await supabase.from("tea_entries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const teas = useQuery({
    queryKey: ["tea-collection", user.id],
    queryFn: async () => {
      if (springAuth) return springCollection();
      const { data, error } = await supabase.from("tea_collection").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const add = useMutation({
    mutationFn: async (entry: TeaDraft) => {
      if (springAuth) return addSpringEntry(entry);
      const { name, type, temp, steep_time, notes } = entry;
      const { error } = await supabase.from("tea_entries").insert({
        name, type, temp, steep_time, notes, rating: 4, user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["entries", user.id] }),
        qc.invalidateQueries({ queryKey: ["tea-collection", user.id] }),
      ]);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { if (springAuth) return removeSpringEntry(id); const { error } = await supabase.from("tea_entries").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entries", user.id] }),
  });

  const signOut = async () => {
    try {
      if (springAuth) await springSignOut();
      else await supabase.auth.signOut();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
      return;
    }
    await qc.cancelQueries(); qc.clear();
    navigate({ to: "/auth", replace: true });
  };

  const list = entries.data ?? [];
  const name = "displayName" in user ? user.displayName : profile.data?.display_name ?? user.email;

  return <JournalView name={name ?? "My"} list={list} teas={teas.data ?? []} teasLoading={teas.isLoading} teasError={teas.isError} trackInventory={springAuth} {...(springAuth && { onDescribeNotes: describeSpringNotes })} onAdd={async (entry) => {
    try {
      await add.mutateAsync(entry);
      return true;
    } catch {
      return false;
    }
  }} onRemove={(id) => remove.mutate(id)} onExit={signOut} exitLabel="Sign out" pending={add.isPending} loading={entries.isLoading} headerActions={<Button asChild><Link to="/tea-upload"><Plus />Tea upload</Link></Button>} />;
}
