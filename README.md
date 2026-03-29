# DayZ Reforger Panel Base

A clean React + TypeScript starter for rebuilding the DayZ Reforger web panel from scratch.

## Included

- modern landing page
- dashboard shell with sidebar and topbar
- auth callback route
- integrations page with Discord and Nitrado entry points
- guild list page and starter guild workspace page
- API wrapper aligned to the current Go API endpoints
- CSS variables and reusable UI structure for future work

## Stack

- React
- TypeScript
- Vite
- React Router
- plain CSS with design tokens

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_FRONTEND_URL=http://localhost:5173
```

## Current structure

```text
src/
  app/
  assets/
  components/
    dashboard/
    layout/
    marketing/
    ui/
  features/
    auth/
    dashboard/
    guilds/
    integrations/
  lib/
  styles/
```

## API routes already mapped in `src/lib/api.ts`

- `GET /auth/discord/login`
- `GET /api/auth/me`
- `GET /api/guilds`
- `GET /api/guilds/linked`
- `POST /api/guilds/:id/link`
- `POST /api/guilds/:id/unlink`
- `GET /api/guilds/:id/config`
- `PUT /api/guilds/:id/config`
- `GET /api/guilds/:id/channels`
- `GET /api/guilds/:id/readiness`
- `POST /api/guilds/:id/activate`
- `POST /api/guilds/:id/deactivate`
- `GET /api/nitrado/servers`
- `POST /api/nitrado/unlink`

## Notes

This base uses mock data in a few pages so the structure is easy to inspect before wiring every screen to live API data.

The next sensible step is replacing the mock guild data with `api.getGuilds()`, then building:

1. a real auth context
2. a real integrations state flow
3. guild linking modal / flow
4. channel mapping UI
5. full config editor grouped by sections
6. readiness and parser controls
