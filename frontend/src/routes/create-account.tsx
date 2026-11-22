import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { registerSpringAccount, springAuth } from "@/lib/spring-api";

export const Route = createFileRoute("/create-account")({
  head: () => ({ meta: [{ title: "Create an account — Steep AI" }] }),
  component: CreateAccount,
});

function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const address = email.trim();
    const displayName = name.trim();
    if (!displayName) {
      toast.error("Enter a display name.");
      return;
    }

    setPending(true);
    try {
      if (springAuth) {
        await registerSpringAccount(address, displayName);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: address,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            shouldCreateUser: true,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
      }
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to request a confirmation link.");
    } finally {
      setPending(false);
    }
  }

  const input = "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Steep AI</Link>
        <h1 className="mt-3 font-serif text-5xl text-foreground">Create an account</h1>
        {sent ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="text-muted-foreground">
              If this email can be registered, you’ll receive a confirmation link. If you already have an account, use sign in.
            </p>
            <Button type="button" variant="outline" onClick={() => setSent(false)}>Use a different email</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
            <label className="block text-sm">
              Display name
              <input className={input} autoComplete="nickname" required maxLength={100}
                disabled={pending} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block text-sm">
              Email
              <input className={input} type="email" autoComplete="email" required maxLength={255}
                disabled={pending} value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending…" : "Email confirmation link"}
            </Button>
          </form>
        )}
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/auth">Already have an account? Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
