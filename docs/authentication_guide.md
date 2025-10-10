# Authentication Guide for LinkShield AI

## Overview

LinkShield AI now ships with a fully self-hosted authentication stack. The backend exposes FastAPI endpoints for registration, login, and profile management, and issues signed JSON Web Tokens (JWTs) without relying on any external identity provider.

## Authentication Flow

1. **Sign Up**: Users register via `/api/v1/auth/register`, supplying name, email, and password.
2. **Sign In**: Users authenticate with `/api/v1/auth/login`. Successful logins return a JWT plus user metadata.
3. **Token Storage**: The frontend is responsible for storing the `access_token` (for example in memory or secure storage).
4. **Protected Requests**: Subsequent API calls include the token via the `Authorization: Bearer <token>` header.
5. **Profile Management**: Authenticated users can read and update their profile via `/api/v1/profile` endpoints.

## Backend Configuration

Create `backend/.env` from the provided template and set the following values:

```
SECRET_KEY=change_me
JWT_SECRET_KEY=change_me
PROJECT_NAME="LinkShield AI"
API_V1_STR="/api/v1"
```

The `SECRET_KEY` secures FastAPI sessions, while `JWT_SECRET_KEY` signs access tokens. Rotate both secrets per environment.

## Frontend Configuration

Create `frontend/.env` (or `.env.local`) with the API base URL:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_COMMUNITY_PROTECTION=true
```

The React app calls the backend directly and expects JWT tokens returned from the `/auth` routes.

## Testing the Flow Locally

1. Start the backend (`uvicorn app.main:app --reload`).
2. Start the frontend (`npm run dev`).
3. Register a new user through the UI or with `POST /api/v1/auth/register`.
4. Log in to retrieve a JWT and verify that protected routes such as `/api/v1/profile/me` respond when the `Authorization` header is present.

## Troubleshooting

- **401 Unauthorized**: Confirm the `Authorization` header uses the `Bearer` prefix and the JWT has not expired.
- **Password Validation**: The backend hashes passwords with bcrypt; ensure the plaintext matches the stored value.
- **Expired Tokens**: Re-authenticate to obtain a new token. Token lifetime defaults to seven days and can be tuned in `app/api/v1/auth.py`.

## Security Recommendations

- Never commit `.env` files or hard-coded secrets to source control.
- Use environment-specific secrets (`development`, `staging`, `production`).
- Serve the backend behind HTTPS in production to protect tokens in transit.
- Consider enabling refresh tokens or short-lived access tokens combined with session rotation for production deployments.
