import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JournalView } from "@/components/journal-view";

afterEach(cleanup);
describe("journal tea selection", () => {
  it("logs the selected tea and submitted brewing details", () => {
    const onAdd = vi.fn(() => true);
    render(<JournalView name="Tester" list={[]} teas={[{ id: "saved-oolong", name: "Uploaded oolong", type: "Oolong" }]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.change(screen.getByRole("combobox", { name: "Tea" }), { target: { value: "saved-oolong" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Steep temperature" }), { target: { value: "85°C" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Number of steeps" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Steep time" }), { target: { value: "30 seconds" } });
    fireEvent.click(screen.getByRole("button", { name: "Describe notes" }));
    expect(screen.getByText(/aroma, flavor, texture, and aftertaste/)).toBeTruthy();
    expect(onAdd).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "Flavor notes" }), { target: { value: "Orchid and honey" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Grams of tea brewed" }), { target: { value: "4.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
      name: "Uploaded oolong", type: "Oolong", temp: "85°C", steep_count: 3, steep_time: "30 seconds", notes: "Orchid and honey",
      tea_id: "saved-oolong", grams_brewed: 4.5, request_id: expect.any(String),
    }));
  });
  it("keeps the original notes until the AI suggestion is accepted", async () => {
    const onDescribeNotes = vi.fn(async () => "Orchid leads, with honey lingering on the finish.");
    const onAdd = vi.fn(() => true);
    render(<JournalView name="Tester" list={[]} teas={[]} onAdd={onAdd} onDescribeNotes={onDescribeNotes} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);

    const notes = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Flavor notes" });
    fireEvent.change(notes, { target: { value: "Orchid, honey finish" } });
    fireEvent.click(screen.getByRole("button", { name: "Describe notes" }));
    const useSuggestion = await screen.findByRole("button", { name: "Use suggestion" });

    expect(onDescribeNotes).toHaveBeenCalledWith("Orchid, honey finish");
    expect(notes.value).toBe("Orchid, honey finish");
    expect(onAdd).not.toHaveBeenCalled();
    fireEvent.click(useSuggestion);
    expect(notes.value).toBe("Orchid leads, with honey lingering on the finish.");
  });

  it("displays the submission timestamp in local time", () => {
    const submittedAt = new Date(2026, 10, 23, 9, 41);
    const list = [{
      id: "saved-entry", name: "Oolong", type: "Oolong", temp: "", steep_time: "", notes: "",
      brewed_on: "2026-11-22", created_at: submittedAt.toISOString(),
    }];
    render(<JournalView name="Tester" list={list} teas={[]} onAdd={vi.fn()} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);

    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(submittedAt);
    expect(screen.getByText(expected).getAttribute("datetime")).toBe(submittedAt.toISOString());
  });

  it("filters by saved tea types and groups capitalization variants together", () => {
    const entry = { temp: "", steep_time: "", notes: "", brewed_on: "Sample cup" };
    const list = [
      { ...entry, id: "1", name: "First blend", type: "Blackberry blend" },
      { ...entry, id: "2", name: "Second blend", type: "blackberry blend" },
      { ...entry, id: "3", name: "Sencha", type: "Green" },
    ];
    const props = { name: "Tester", teas: [], onAdd: vi.fn(), onRemove: vi.fn(), onExit: vi.fn(), exitLabel: "Sign out" };
    const view = render(<JournalView {...props} list={list} />);

    expect(screen.queryByRole("button", { name: "Oolong" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Blackberry blend" }));
    expect(screen.getByRole("heading", { name: "First blend" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Second blend" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Sencha" })).toBeNull();

    view.rerender(<JournalView {...props} list={list.slice(2)} />);
    expect(screen.queryByRole("button", { name: "Blackberry blend" })).toBeNull();
    expect(screen.getByRole("button", { name: "All types" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("heading", { name: "Sencha" })).toBeTruthy();
  });

  it("cannot add an entry without a saved tea selection", () => {
    const onAdd = vi.fn(() => true);
    render(<JournalView name="Tester" list={[]} teas={[]} onAdd={onAdd} onRemove={vi.fn()} onExit={vi.fn()} exitLabel="Sign out" />);
    fireEvent.click(screen.getByRole("button", { name: "Add to journal" }));
    expect(onAdd).not.toHaveBeenCalled();
  });
});