import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — Steep AI" },
    { name: "description", content: "Choose a new password for your Steep AI account." },
    { property: "og:title", content: "Reset password — Steep AI" },
    { property: "og:description", content: "Choose a new password for your Steep AI account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let active = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const recovery = hash.get("type") === "recovery" || sessionStorage.getItem("steepwise-recovery") === "true";
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setReady(recovery && Boolean(data.user));
      setChecking(false);
    }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    if (password !== confirm) { setError("Passwords don’t match."); return; }
    setError(""); setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); return; }
      sessionStorage.removeItem("steepwise-recovery");
      setDone(true);
    } catch { setError("Unable to connect. Please try again."); }
    finally { setBusy(false); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
    <div className="w-full max-w-sm">
      <Link to="/" className="text-sm text-muted-foreground">Steep AI</Link>
      <h1 className="mt-3 font-serif text-5xl">New password</h1>
      {checking ? <p role="status" className="mt-6 text-muted-foreground">Checking reset link…</p> : done ? <div className="mt-6 space-y-4"><p role="status">Your password has been updated.</p><Button asChild><Link to="/journal">Open my journal</Link></Button></div> : ready ?
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm">New password<input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
          <label className="block text-sm">Confirm new password<input type="password" autoComplete="new-password" required minLength={6} value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button disabled={busy} className="w-full">{busy ? "Saving…" : "Save new password"}</Button>
        </form> : <div className="mt-6 space-y-4"><p role="alert" className="text-muted-foreground">This reset link is missing or expired. Request a fresh link from the sign-in page.</p><Button asChild variant="outline"><Link to="/auth">Back to sign in</Link></Button></div>}
    </div>
  </main>;
}