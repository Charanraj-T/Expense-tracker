# Expense Tracker — Backend API

Express REST API for tracking income, expenses, and investments.

## Stack

- Node.js + Express 5
- Mongoose 9 + MongoDB
- jsonwebtoken (access/refresh JWTs)
- bcrypt (password hashing)
- cookie-parser (refresh-token cookie)

## Setup

```bash
cd backend
npm install
```

Create a `.env` file (or copy `.env.example`) and fill in the values.

### Environment variables

| Variable        | Default                   | Description                                      |
| --------------- | ------------------------- | ------------------------------------------------ |
| `PORT`          | `5000`                    | Server port                                      |
| `MONGODB_URI`  | —                         | MongoDB connection string (supports `srv://`)    |
| `JWT_SECRET_KEY` | —                       | Secret used to sign access/refresh JWTs          |
| `CORS_ORIGIN`   | `http://localhost:3000`   | Allowed frontend origin                          |
| `COOKIE_SECURE` | `false`                   | `true` sends refresh cookie over HTTPS only      |

## Scripts

| Script     | Description                |
| ---------- | -------------------------- |
| `npm start`| Run the server             |
| `npm run dev` | Run with nodemon        |

## Auth model

- **Access token**: JWT, 15-minute expiry, sent as `Authorization: Bearer <token>`.
- **Refresh token**: JWT, 30-day expiry, stored in an HttpOnly `SameSite=Lax` cookie (`refreshToken`). Rotated on every refresh; a hashed copy is stored in the `Session` collection.
- **Reuse detection**: presenting an already-rotated refresh token revokes all of the user's sessions.
- **Logout**: deletes the session and clears the cookie.

## API

All transaction routes require `Authorization: Bearer <accessToken>`.

### Auth (`/auth`)

| Method | Route      | Body                           | Description                |
| ------ | ---------- | ------------------------------ | -------------------------- |
| POST   | `/register`| `username`, `email`, `password`| Register a user            |
| POST   | `/login`   | `email`, `password`            | Login; sets refresh cookie |
| POST   | `/refresh` | cookie                         | Rotate cookie, return new access token |
| POST   | `/logout`  | cookie                         | Revoke session, clear cookie |

### Transactions (`/transactions`)

| Method   | Route       | Query / Body                                   | Description          |
| -------- | ----------- | ---------------------------------------------- | -------------------- |
| GET      | `/`         | `page`, `limit`, `type`, `month`, `startDate`, `endDate`, `search` | List (paginated, sorted by date desc) |
| GET      | `/summary`  | `month` / `startDate`, `endDate`, `type`        | Income/expense/investment totals |
| GET      | `/export/csv` | `month` / `startDate`, `endDate`, `type`, `search` | All matching rows as a CSV download |
| POST     | `/`         | `amount`, `type`, `category`, `date`, `note`    | Create transaction   |
| PATCH    | `/:id`      | Same fields as create                           | Update transaction   |
| DELETE   | `/:id`      | —                                              | Delete transaction   |

`type` is one of `income`, `expense`, `investment`. Dates use `YYYY-MM-DD`; `month` uses `YYYY-MM`.

Errors are returned as `{ message }` with the matching HTTP status; server errors are masked to a generic message.