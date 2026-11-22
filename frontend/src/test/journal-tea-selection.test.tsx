import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JournalView } from "@/components/journal-view";

afterEach(cleanup);
describe("journal tea selection", () => {
  it("logs the selected tea and submitted brewing details", () => {
    const onAdd = vi.fn();
    render(<JournalView name="Tester" list={[]} teas={[{ id: "saved-oolong", name: "Uploaded oolong", type: "Oolong" }]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Tea" }), { target: { value: "saved-oolong" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Steep temperature" }), { target: { value: "85°C" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Number of steeps" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Steep time" }), { target: { value: "30 seconds" } });
    fireEvent.click(screen.getByRole("button", { name: "Describe notes" }));
    expect(screen.getByText(/aroma, flavor, texture, and aftertaste/)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Flavor notes" }), { target: { value: "Orchid and honey" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).toHaveBeenCalledWith({
      name: "Uploaded oolong", type: "Oolong", temp: "85°C", steep_count: 3, steep_time: "30 seconds", notes: "Orchid and honey",
    });
  });
  it("cannot add an entry without a saved tea selection", () => {
    const onAdd = vi.fn();
    render(<JournalView name="Tester" list={[]} teas={[]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});