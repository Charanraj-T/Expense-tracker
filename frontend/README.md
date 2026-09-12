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

- Logging in stores the access token in localStorage and receives the refresh token as an HttpOnly cookie.
- `api/axios.js` attaches the access token as a bearer header and, on a 401, performs a single-flight `POST /auth/refresh` before retrying the request once. If refresh fails, it clears state and redirects to `/login`.
- Logout calls `POST /auth/logout` to revoke the server-side session and clears local state.