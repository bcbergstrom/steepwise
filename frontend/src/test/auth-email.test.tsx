import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/auth";
import { Route as CreateAccountRoute } from "@/routes/create-account";

const { requestLink, navigate, getUser } = vi.hoisted(() => ({
  requestLink: vi.fn(), navigate: vi.fn(), getUser: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {
  signInWithOtp: requestLink, getUser,
} } }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  useNavigate: () => navigate,
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

function openAuth(route: typeof Route | typeof CreateAccountRoute = Route) {
  const Component = route.options.component;
  if (!Component) throw new Error("Auth component is missing");
  render(<Component />);
}

describe("passwordless email accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: null } });
    requestLink.mockResolvedValue({ error: null });
  });
  afterEach(cleanup);

  it("requests an email sign-in link without creating an account or sending a password", async () => {
    openAuth();
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "reader@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Email sign-in link" }));
    await waitFor(() => expect(requestLink).toHaveBeenCalledWith({ email: "reader@example.com", options: {
      emailRedirectTo: `${window.location.origin}/auth`, shouldCreateUser: false,
    } }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("creates an email-only account with the username in profile metadata", async () => {
    openAuth(CreateAccountRoute);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "reader@example.com" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), { target: { value: " TeaReader " } });
    fireEvent.click(screen.getByRole("button", { name: "Email confirmation link" }));
    await waitFor(() => expect(requestLink).toHaveBeenCalledWith({ email: "reader@example.com", options: {
      emailRedirectTo: `${window.location.origin}/auth`, shouldCreateUser: true, data: { display_name: "TeaReader" },
    } }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only signup username", () => {
    openAuth(CreateAccountRoute);
    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "reader@example.com" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Display name" }), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Email confirmation link" }));
    expect(requestLink).not.toHaveBeenCalled();
  });

  it("opens the journal only after the email callback has a verified user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "verified-reader" } } });
    openAuth();
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: "/journal", replace: true }));
  });
});