# meucontato-backend

Simple Node + Express backend for contact form using SendGrid.

## Env variables
- `PORT` — server port (default 3001)
- `SENDGRID_API_KEY` — your SendGrid API Key
- `TO_EMAIL` — your email address that will receive messages
- `FROM_EMAIL` — optional, 'from' header for outgoing emails
- `ALLOWED_CLIENTS_ORIGIN` — comma-separated list of allowed origins for CORS. Example: `http://localhost:5173,http://example.com`.
	- The server also accepts `*` to allow all origins.
	- The code will also accept `FRONTEND_ORIGIN` (for backward compatibility).
- `ALLOWED_CLIENTS_IP` — comma-separated list of allowed client IPs (optional). Example: `ALLOWED_CLIENTS_IP=123.45.67.89,127.0.0.1`.
	- When `ALLOWED_CLIENTS_IP` is set, the server will only accept requests from those IPs (or `*` to allow all). This restriction is applied server-side and is separate from CORS.
	- If you are behind a reverse proxy, set `TRUST_PROXY=true` so the server reads `X-Forwarded-For` correctly.

## Commands
```bash
npm install
npm run dev
```