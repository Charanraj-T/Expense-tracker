# Expense Tracker — Frontend

React web client for the expense tracker API.

## Stack

- React 19 + Vite 8
- react-router-dom 7 (routing)
- Zustand 5 (state)
- Axios (HTTP, with refresh-token handling)
- lucide-react (icons)

## Setup

```bash
cd frontend
npm install
```

Create a `.env` file (or copy `.env.example`):

```
VITE_API_URL=http://localhost:5000
```

## Scripts

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm start`     | Run Vite dev server on port 3000  |
| `npm run build` | Production build to `dist/`       |
| `npm run preview` | Preview the production build    |

## Structure

```
src/
├─ api/          axios instance + auth interceptors
├─ components/   shared UI (charts, modals, common)
├─ containers/   menu / sidebar
├─ pages/        route-level screens (home, transactions, analytics, account, auth)
├─ routes/       protected-route wrapper
├─ services/     API calls (auth, transactions)
├─ store/        zustand stores (auth, transactions)
├─ utils/        date-range helpers, CSV export, token storage, initials
└─ styles/       global CSS tokens
```

## Sessions

- The refresh token is stored by the browser in an `HttpOnly` cookie (set by the API) and is never exposed to JavaScript.
- The access token lives **only in memory** — never in `localStorage` — so an XSS script has no long-lived secret to steal.
- On page load, if a previous user is recorded, the app silently calls `POST /auth/refresh` and restores the session; if that fails it clears state and shows `/login`.
- `api/axios.js` attaches the in-memory access token as a bearer header and, on a 401, performs a single-flight `POST /auth/refresh` (the browser sends the cookie automatically) before retrying once. If refresh fails, it clears state and redirects to `/login`.
- Logout calls `POST /auth/logout` to revoke the session, clear the cookie, and wipe in-memory state.