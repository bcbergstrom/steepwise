import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/journal-preview";

const privateRead = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: privateRead } }));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  useNavigate: () => vi.fn(),
}));

describe("temporary journal preview", () => {
  beforeEach(() => privateRead.mockClear());
  it("allows a visitor to add a cup without reading private journals", () => {
    const Component = Route.options.component;
    if (!Component) throw new Error("Preview component is missing");
    render(<Component />);
    fireEvent.change(screen.getByRole("combobox", { name: "Tea" }), { target: { value: "preview-sencha" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(screen.getAllByRole("heading", { name: "Sencha" })).toHaveLength(2);
    expect(privateRead).not.toHaveBeenCalled();
  });
});
