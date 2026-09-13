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

## Security notes

- Passwords are hashed with bcrypt; access tokens last 15 minutes and refresh tokens are rotated on every use and stored hashed server-side.
- `JWT_SECRET_KEY` must be a long, random value. Generate one with: `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. The backend warns at startup if it is missing or weak.
- Never commit `.env` files. Only the `.env.example` files with placeholders are tracked.
- MongoDB Atlas: restrict the cluster IP access list to your own IPs and the backend host (never `0.0.0.0/0`), and use a strong, randomly generated database user password.