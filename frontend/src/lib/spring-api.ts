import type { TeaDraft, TeaEntry } from "@/components/journal-view";
import type { CollectionDraft } from "@/lib/tea-collection";

export const springAuth = import.meta.env["VITE_SPRING_AUTH"] === "true";

type Account = { id: string; email: string; displayName: string };
type Csrf = { headerName: string; token: string };
type CollectionTea = CollectionDraft & { id: string };

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error("Steep AI could not load this information.");
  return response.json() as Promise<T>;
}

async function write(path: string, method: "POST" | "DELETE", data?: object) {
  const csrf = await read<Csrf>(await fetch("/api/auth/csrf", { cache: "no-store" }));
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  if (!response.ok) {
    if (response.status === 503) throw new Error("Sign-in email is currently unavailable.");
    throw new Error("Steep AI could not complete that request.");
  }
}

export async function springAccount(): Promise<Account | null> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (response.status === 401) return null;
  return read<Account>(response);
}

export const requestSpringLink = (email: string) => write("/api/auth/link", "POST", { email });
export const registerSpringAccount = (email: string, displayName: string) =>
  write("/api/auth/register", "POST", { email, displayName });

export const springSignOut = () => write("/logout", "POST");
export const springEntries = async () => read<TeaEntry[]>(await fetch("/api/journal/entries"));
export const springCollection = async () => read<CollectionTea[]>(await fetch("/api/journal/collection"));
export const addSpringEntry = (entry: TeaDraft) => write("/api/journal/entries", "POST", entry);
export const addSpringTea = (tea: CollectionDraft) => write("/api/journal/collection", "POST", tea);
export const removeSpringEntry = (id: string) => write(`/api/journal/entries/${encodeURIComponent(id)}`, "DELETE");
export const removeSpringTea = (id: string) => write(`/api/journal/collection/${encodeURIComponent(id)}`, "DELETE");
