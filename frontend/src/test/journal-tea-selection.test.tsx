import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JournalView } from "@/components/journal-view";

afterEach(cleanup);
describe("journal tea selection", () => {
  it("logs the selected submitted tea's name and type without a temperature", () => {
    const onAdd = vi.fn();
    render(<JournalView name="Tester" list={[]} teas={[{ id: "saved-oolong", name: "Uploaded oolong", type: "Oolong" }]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Tea" }), { target: { value: "saved-oolong" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).toHaveBeenCalledWith({ name: "Uploaded oolong", type: "Oolong", temp: "", steep_time: "", rating: 4, notes: "" });
  });
  it("cannot add an entry without a saved tea selection", () => {
    const onAdd = vi.fn();
    render(<JournalView name="Tester" list={[]} teas={[]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});