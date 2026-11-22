import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { springAccount, springAuth } from "@/lib/spring-api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = springAuth ? await springAccount() : (await supabase.auth.getUser()).data.user;
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => <Outlet />,
});
