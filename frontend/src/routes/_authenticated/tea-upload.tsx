import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeaCollection } from "@/components/tea-collection";

export const Route = createFileRoute("/_authenticated/tea-upload")({
  head: () => ({
    meta: [
      { title: "Tea upload — Steep AI" },
      { name: "description", content: "Add teas to your private Steep AI collection with origin, harvest and storage details." },
      { property: "og:title", content: "Tea upload — Steep AI" },
      { property: "og:description", content: "Add teas to your private Steep AI collection with origin, harvest and storage details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeaUploadPage,
});

function TeaUploadPage() {
  const { user } = Route.useRouteContext();
  return <main className="min-h-screen bg-background">
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8">
      <Link to="/journal" className="font-serif text-3xl text-foreground">Steep AI</Link>
      <Button asChild variant="outline"><Link to="/journal"><ArrowLeft />Back to journal</Link></Button>
    </header>
    <TeaCollection userId={user.id} />
  </main>;
}