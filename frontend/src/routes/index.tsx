import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Steep AI — Tea Journal" },
      { name: "description", content: "Log every cup: tea, type, steep time and tasting notes." },
      { property: "og:title", content: "Steep AI — Tea Journal" },
      { property: "og:description", content: "Log every cup: tea, type, steep time and tasting notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center bg-background px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A tea journal</p>
        <h1 className="mt-3 font-serif text-7xl text-foreground">Steep AI</h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">Slow notes on the leaves you brew. Keep every cup — the tea, the temperature, the steep and how it tasted — in a journal that's yours alone.</p>
        <div className="mt-8 flex gap-4">
          <Link to="/journal" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Open my journal</Link>
          <Link to="/auth" className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground hover:bg-secondary">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
