# Production Deployment Guide

This guide details how to deploy ConnectHub AI to Vercel (Frontend) and Railway / Render (Backend).

---

## 🌐 Frontend Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variable:
   - `VITE_API_URL`: Your deployed backend production URL (e.g. `https://connecthub-api.up.railway.app`).

---

## 🗄️ Backend & WebSockets Deployment (Railway / Render)

1. Create a new service on [Railway.app](https://railway.app) or [Render.com](https://render.com).
2. Set **Root Directory** to `server`.
3. Build Command: `npm run build && npx prisma generate`
4. Start Command: `npm start`
5. Add Production Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: Production random secret key.
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `CORS_ORIGIN`: Your production Vercel frontend URL.

---

## 🔄 GitHub Actions CI/CD Pipeline

The included `.github/workflows/ci-cd.yml` automatically builds, lints, runs tests, and verifies database generation on every push to `main` or `master`.
