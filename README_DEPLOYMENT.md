
# StudyHub - Deployment Guide

A robust, deployment-ready application for managing study materials (PDFs, Notes, Links, Videos).

## 1. Project Overview
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (File-based)
- **Storage**: Local filesystem (`server/uploads`)

## 2. Local Development

### Backend
1. Open a terminal in the root.
2. Navigate to server: `cd server`
3. Install dependencies: `npm install`
4. Start server: `npm start`
   - Server runs on `http://localhost:5000`
   - Uploads stored in `server/uploads`
   - SQLite DB file created automatically

### Frontend
1. Open a new terminal in the root.
2. Install dependencies: `npm install`
3. Start React: `npm run dev`
4. Open the link provided by Vite (e.g., `http://localhost:5173`)

## 3. Deployment Configuration (Critical)

Since this app serves files dynamically, you must configure Environment Variables correctly in your deployment platform.

### Backend (e.g., Render.com)
Deploy the `/server` folder as a **Web Service**.
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `PORT`: `5000` (or let platform decide)
  - `BASE_URL`: **REQUIRED**. The public URL of your backend.
    - Example: `https://studyhub-api.onrender.com`
    - *Why?* This is used to construct the absolute URLs for file downloads so they work from anywhere.
- **Persistent Storage**:
  - Because SQLite and Uploads are files, you **MUST** mount a persistent disk (Volume) to `/server/uploads` and `/server` (or wherever DB is) if using a service like Render, otherwise your data will disappear on every restart.

### Frontend (e.g., Vercel / Netlify)
Deploy the root (or `/client` if separated) as a static site.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE`: **REQUIRED**. The full URL to your backend API.
    - Example: `https://studyhub-api.onrender.com/api`
    - *Note:* Do not forget the `/api` suffix if your backend is configured that way (our server.js uses `/api` prefix).

## 4. Troubleshooting Downloads

If you see "Site can't be reached" when downloading:
1. Ensure the Backend is running.
2. Check that `BASE_URL` in backend env vars matches the actual running server URL.
3. Check that the file actually exists in `server/uploads`.

## 5. Security Notes for Production
- The current setup allows any PDF upload up to 20MB.
- `cors` is enabled for all origins (`*`). For production, restrict this to your frontend domain in `server/server.js`.
