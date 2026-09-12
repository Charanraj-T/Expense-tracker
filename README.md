# ClearSpend

A personal expense tracker with a React frontend and an Express API.

## Structure

- [`frontend/`](frontend/README.md) — React 19 + Vite web client (dev server on port 3000)
- [`backend/`](backend/README.md) — Express 5 + Mongoose REST API (port 5000)

## Quick start

```bash
# Backend (terminal 1)
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET_KEY
npm run dev

# Frontend (terminal 2)
cd frontend
npm install
cp .env.example .env
npm start
```

Open http://localhost:3000 and register a user.

See the backend and frontend READMEs for API details, environment variables, and scripts.