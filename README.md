Steep AI is a personal AI powered Tea Journal, created with Lovable on the frontend, and mostly hand-coded in the backend.

## Run locally with Docker

Start Docker and run this from the repository root.

```sh
docker compose up --build
```

Compose uses the PostgreSQL settings in the root `.env` and the Lovable/Supabase settings in `frontend/.env`. Keep both files available locally. After changing the frontend’s `VITE_*` values, run `docker compose build --no-cache frontend` followed by `docker compose up -d`.

- Frontend: http://localhost:5173
- Spring Boot API documentation: http://localhost:8080/swagger-ui/index.html

The frontend uses Lovable/Supabase for its existing features. The Spring Boot API runs alongside it and uses the Compose PostgreSQL database.

Run `docker compose down` to stop the stack. The PostgreSQL volume persists between runs.

## Switch to Spring sign-in

The Docker stack defaults to Lovable/Supabase mode so existing users retain access while accounts and journals are prepared. Spring mode uses the same Steep AI screens with Spring sessions and PostgreSQL data. In Spring mode, new users can register at `/create-account` and confirm their email.

1. Add the following values to the root `.env` using your mail provider's settings. Keep your SMTP credentials private.

   ```dotenv
   STEEPWISE_PUBLIC_URL=http://localhost:5173
   STEEPWISE_MAIL_FROM=your-verified-sender
   SPRING_MAIL_HOST=your-smtp-host
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your-smtp-username
   SPRING_MAIL_PASSWORD=your-smtp-password
   SPRING_MAIL_SMTP_AUTH=true
   SPRING_MAIL_STARTTLS=true
   ```

   Use the exact browser origin without a trailing slash. For a public deployment, use an HTTPS origin and set `STEEPWISE_SECURE_COOKIE=true`.

2. Run `docker compose up -d --build` to apply the Spring database migration.
3. To bring existing Lovable journals across, export from the Lovable/Supabase PostgreSQL database using an authorized connection with access to `auth.users`. Import into Spring PostgreSQL from the same working directory with a PostgreSQL client that can reach both databases. Back up the target first and pause new writes during the final export and cutover.

   ```sh
   psql "$LOVABLE_DATABASE_URL" -f backend/scripts/export-lovable-journal.sql
   psql "$STEEPWISE_DATABASE_URL" -f backend/scripts/import-lovable-journal.sql
   ```

   The export reads verified accounts, profiles, inventory, and journal entries. The import maps existing Spring accounts by exact email, preserves original journal IDs and dates, and aborts on unmapped owners or conflicting data. Keep the two CSV files private. Review the imported account and item counts before switching modes.
4. Set `STEEPWISE_SPRING_AUTH=true` in the root `.env`, run `docker compose up -d --build`, and open `http://localhost:5173/auth`. Sign in with an existing account or open `http://localhost:5173/create-account` to register.

## Public site at steepai.app

Point the apex DNS record for `steepai.app` to your server. Start with a DNS-only record so Caddy can issue its HTTPS certificate. Allow incoming TCP traffic on ports 80 and 443.

Onboard `steepai.app` for Cloudflare Email Sending and configure SMTP credentials in the server’s root `.env`. The production settings send from `sign-in@steepai.app` and use `https://steepai.app` for signup and sign-in links.

On the server, start the stack with:

```sh
docker compose -f docker-compose.yml -f compose.production.yml up -d --build
```

Local development still uses `http://localhost:5173`. Production exposes only the Caddy gateway and keeps the Spring API and PostgreSQL on the Docker network.
