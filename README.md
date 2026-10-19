# MyAnalyzer • Multi-Platform Competitive Programming Tracker & Heatmap

A clean, modern web application built on the **MERN** stack (MongoDB, Express.js, React, Node.js) that tracks, aggregates, and compares daily competitive programming activity across **Codeforces**, **LeetCode**, and **CodeChef** for multiple users and friends.

---

## 📁 Project Architecture

The project is structured into two clean components:

```
MyAnalyzer/
├── client/                     # Frontend (React 18 + Vite 6 + Tailwind CSS) -> Host on VERCEL
│   ├── src/
│   │   ├── components/
│   │   │   ├── Heatmap.jsx          # 53x7 GitHub-style 365-day contribution heatmap
│   │   │   ├── DayDetailModal.jsx   # Detailed problem breakdown modal with links
│   │   │   ├── StatsOverview.jsx    # Streaks, platform counters & sync controls
│   │   │   ├── CompareView.jsx      # Side-by-side head-to-head comparison
│   │   │   ├── Leaderboard.jsx      # Friends ranking leaderboard
│   │   │   ├── ProblemsList.jsx     # Searchable/filterable problems explorer
│   │   │   ├── UserModal.jsx        # Add & edit friend handles modal
│   │   │   ├── Navbar.jsx           # Top navigation and user selector
│   │   │   └── PlatformBadge.jsx
│   │   ├── api.js                   # Axios API service
│   │   ├── App.jsx                  # Main view coordinator
│   │   └── main.jsx
│   ├── vercel.json                  # SPA routing configuration for Vercel
│   ├── vite.config.js               # Dev server configuration
│   └── package.json
│
├── server/                     # Backend (Node.js + Express.js + Mongoose) -> Host on RENDER
│   ├── config/
│   │   └── db.js                    # MongoDB connection with DNS SRV resolver fix
│   ├── models/
│   │   ├── User.js                  # User schema with handles, baseline, and stats
│   │   └── SolvedProblem.js         # Compound index { userId, platform, problemId }
│   ├── services/
│   │   ├── codeforcesService.js     # Codeforces API fetcher with OK verdict filter & dedup
│   │   ├── leetcodeService.js       # LeetCode GraphQL fetcher (recent AC + calendar)
│   │   ├── codechefService.js       # CodeChef profile scraper & recent activity parser
│   │   └── syncService.js           # Multi-platform sync, bulkWrite upsert, streak engine
│   ├── routes/
│   │   └── api.js                   # REST API routes
│   ├── utils/
│   │   └── dateUtils.js             # IST timezone (Asia/Kolkata) date helpers & streak logic
│   ├── cron/
│   │   └── syncCron.js              # Background sync scheduler (node-cron)
│   ├── server.js                    # Express entry point
│   └── package.json
│
├── .env                        # Local environment variables
├── .env.example
├── package.json                # Root package.json for concurrent local development
└── README.md
```

---

## 🚀 Local Development

1. Ensure your MongoDB Atlas connection string is configured in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/myanalyzer?retryWrites=true&w=majority
   ```
2. Run both the backend and frontend concurrently:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

### Part 1: Deploy Backend to **Render**
1. Push this repository to **GitHub**.
2. Go to [dashboard.render.com](https://dashboard.render.com) → Click **New +** → Select **Web Service**.
3. Select your GitHub repository.
4. Set the following settings:
   - **Name:** `myanalyzer-api` (or any name you choose)
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. In **Environment Variables** on Render, add:
   - `MONGODB_URI`: `mongodb+srv://kasiram5473_db_user:MQkd3K6VSyPA6rBM@cluster0.fgqrpfv.mongodb.net/myanalyzer?retryWrites=true&w=majority`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
   Render will provide your live API URL, for example: `https://myanalyzer-api.onrender.com`.

---

### Part 2: Deploy Frontend to **Vercel**
1. Go to [vercel.com](https://vercel.com) → Click **Add New...** → **Project**.
2. Import the same GitHub repository.
3. Configure the project:
   - **Root Directory:** Click **Edit** and choose `client`
   - **Framework Preset:** `Vite` (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `BACKEND_URL`: `https://myanalyzer-d3tb.onrender.com` *(Your Render backend URL)*
5. Click **Deploy**.
   Vercel will give you your live frontend URL, for example: `https://myanalyzer.vercel.app`.

---

## ⚙️ Environment Variables Summary

### Backend (`server/`)
- `MONGODB_URI`: MongoDB Atlas connection URI.
- `PORT`: Port for the server (Render sets this automatically).
- `CLIENT_URL`: Optional frontend URL (CORS automatically accepts `.vercel.app` domains).
- `SYNC_CRON_SCHEDULE`: Cron pattern for automatic periodic syncs (default: `0 */6 * * *` - every 6 hours).

### Frontend (`client/`)
- `BACKEND_URL`: URL pointing to your Express API on Render (e.g. `https://myanalyzer-d3tb.onrender.com`). No `VITE_` prefix required!
