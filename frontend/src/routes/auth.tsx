import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestSpringLink, springAccount, springAuth } from "@/lib/spring-api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Steep AI" },
      { name: "description", content: "Sign in to your Steep AI tea journal." },
      { property: "og:title", content: "Sign in — Steep AI" },
      { property: "og:description", content: "Sign in to your Steep AI tea journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (springAuth) setExpired(new URLSearchParams(window.location.search).has("expired"));
    const account = springAuth ? springAccount() : supabase.auth.getUser().then(({ data }) => data.user);
    account.then((user) => {
      if (user) navigate({ to: "/journal", replace: true });
    }).catch(() => toast.error("Unable to check your account. Please try again."));
  }, [navigate]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (springAuth) {
        await requestSpringLink(email.trim());
        setSent(true);
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: false,
        },
      });
      if (error) toast.error(error.message);
      else setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Steep AI</Link>
        <h1 className="mt-3 font-serif text-5xl text-foreground">Welcome back</h1>
        {expired &&
          <p role="alert" className="mt-4 text-destructive">This link expired or was already used. Request a new link.</p>}
        {sent && springAuth ? (
          <p role="status" className="mt-6 text-muted-foreground">If an account exists for that email, a sign-in link is on its way.</p>
        ) : sent ? (
          <p role="status" className="mt-6 break-words text-muted-foreground">Check your inbox at <b>{email.trim()}</b> for a secure sign-in link.</p>
        ) : (
          <div className="mt-8 space-y-3 rounded-lg border border-border bg-card p-6">
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm">Email<input className={`${input} mt-2`} type="email" autoComplete="email" required placeholder="Email" disabled={busy} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : "Email sign-in link"}</Button>
            </form>
          </div>
        )}
        {sent && <Button variant="outline" className="mt-4 w-full" onClick={() => setSent(false)}>Use a different email</Button>}
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/create-account">Create an account</Link>
        </Button>
        <div className="mt-6 border-t border-border pt-4">
          <Button asChild variant="outline" className="w-full"><Link to="/journal-preview">Try the journal without signing in</Link></Button>
        </div>
      </div>
    </div>
  );
}
