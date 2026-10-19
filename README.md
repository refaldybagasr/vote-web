# vote-web

Frontend for the voting app technical assessment.

## Tech stack

Vite, React 19, TypeScript (strict), Tailwind CSS v4, `react-router`, `axios`. No state-management library, no component library.

```
src/
├── api/     axios client (token, interceptors), per-resource wrappers (users, votes, candidates, results)
├── auth/    AuthProvider (session restore, login, logout), RequireRole route guard
├── pages/   LoginPage, VotePage, AdminUsersPage, AdminResultsPage
└── App.tsx  routes
```

## Prerequisites

Node.js `20.20.2` (see `.nvmrc`), npm. The backend (`vote-api`) must be running first — see that repo's README.

## Running locally

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`. `/api` requests are proxied to `VITE_API_PROXY_TARGET` (`.env`, default `http://localhost:3000`).

Production build: `npm run build && npm run preview`.

Other scripts: `npm run lint`, `npm run typecheck`.

## Pages and roles

| Path | Role | Page |
|---|---|---|
| `/login` | public | Log in |
| `/vote` | user | Cast a vote, or see the already-cast vote |
| `/admin/users` | admin | Manage user accounts |
| `/admin/results` | admin | Live vote totals, auto-refreshing |

Visiting a page for the wrong role redirects to your own landing page (`/vote` for a user, `/admin/results` for an admin); visiting while logged out redirects to `/login`.
