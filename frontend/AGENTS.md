<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Share journal presentation between the authenticated journal and an isolated public preview; preview entries stay in component state and never access private data.
- Password recovery uses a public reset page and recovery-scoped session marker; ordinary signed-in sessions cannot activate the recovery form.
- Keep tea inventory separate from brewed-cup entries; validate inventory with a shared client schema and database constraints, with owner-scoped access policies.
- Tea inventory entry and collection display live on a dedicated authenticated page linked from the journal, not embedded in the journal.
- New brewed-cup entries select from the user's saved inventory and snapshot its name/type; the isolated preview uses sample tea choices.
- Selected-tea details derive directly from the selected inventory row using the browser-safe selected-tea module; temperature recommendations average both range endpoints without changing inventory or cup data.
- Passwordless account requests use email OTP links with account creation disabled for sign-in; signup usernames use the existing profile display-name metadata, and link callbacks return to the public auth page before journal navigation.
