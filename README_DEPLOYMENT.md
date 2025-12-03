# StudyHub Deployment Guide

This project consists of a React Frontend and a Node.js/Express Backend with SQLite.

## 1. Local Development

### Backend
1. Navigate to the `/server` directory (create it if you copied the files).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### Frontend
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. **Note:** The frontend `services/api.ts` is configured to try `http://localhost:5000` first. If the backend is not running, it falls back to **LocalStorage** so you can test the UI immediately.

## 2. Deployment (Render.com example)

Since this app uses SQLite (a file-based DB), typical serverless deployment (Vercel/Netlify) won't persist data between restarts unless you use a mounted volume. **Render** is recommended for this setup using a "Web Service".

### Steps for Render:
1. Create a GitHub repository with structure:
   ```
   /client (frontend code)
   /server (backend code)
   ```
2. **Deploy Backend:**
   - Create a new **Web Service** on Render connected to your repo.
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - **Important:** Add a *Disk* in Render settings and mount it to `/server/uploads` and ensure the database file is stored there or initialized there to persist data.

3. **Deploy Frontend:**
   - Create a **Static Site** on Render.
   - Root Directory: `client` (or root)
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - **Environment Variable:** Set `VITE_API_URL` (or modify `api.ts`) to point to your deployed backend URL (e.g., `https://my-api.onrender.com`).

## 3. Project Structure
```
/
├── components/       # React UI Components
├── services/         # API Service (Frontend)
├── server/           # Backend Code
│   ├── uploads/      # PDF storage
│   ├── database.js   # SQLite config
│   └── server.js     # Express API
├── App.tsx           # Main Frontend Logic
└── types.ts          # TypeScript interfaces
```
