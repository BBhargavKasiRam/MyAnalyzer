# MyAnalyzer • Multi-Platform Competitive Programming Tracker & Heatmap

A production-ready full-stack web application built on the **MERN** stack (MongoDB, Express.js, React, Node.js) that tracks, aggregates, and compares daily competitive programming activity across **Codeforces**, **LeetCode**, and **CodeChef** for you and your friends.

---

## 🌟 Highlights & Features

- **GitHub-Style 365-Day Contribution Heatmap:**
  - 53-week × 7-day grid accurately aligned to days of the week and month labels.
  - Cell color intensity reflects total unique problems solved across all three platforms on that day.
  - Interactive tooltip on hover with exact date, total solves, and platform-by-platform counts.
  - Interactive Platform Filter (Combined All, Codeforces, LeetCode, CodeChef) that dynamically recolors cells according to platform-specific activity.
- **Detailed Day Problem Breakdown Modal:**
  - Clicking any heatmap cell opens a breakdown of the exact problems solved on that date.
  - Direct clickable links to the problems on Codeforces, LeetCode, and CodeChef.
  - Platform badges, difficulty tags, problem IDs, and accepted timestamps.
- **Multi-Friend Competition & Social Tracking:**
  - Register friends with their handles on Codeforces, LeetCode, and CodeChef.
  - Switch active users seamlessly via the top navbar dropdown.
  - **Compare Friends View:** Head-to-head comparison table and side-by-side heatmaps.
  - **Friends Leaderboard:** Ranked by Total Solved, Current Streak, or Longest Streak with Crown and Medal badges.
- **Streak & Consistency Engine:**
  - Current streak and longest streak calculations formatted in Indian Standard Time (`Asia/Kolkata` timezone).
  - Graceful handling of today's progress vs. yesterday's active streak.
- **Live Sync & Anti-Spam Cooldown:**
  - One-click "Sync Now" button with spin animation.
  - 5-minute cooldown protection with an optional "Bypass 5m cooldown" toggle (`?force=true`).
- **Scheduled Background Sync:**
  - Automated periodic background synchronization powered by `node-cron`.
- **Dual Deployment Ready:**
  - Run as a standalone Node/Express server (`server.js`) serving both API and Vite React static build, OR
  - Deploy serverlessly to **Vercel** (`api/index.js` + `vercel.json`).

---

## 🏗️ Architecture & Tech Stack

```
MyAnalyzer/
├── client/                     # Frontend (React 18, Vite 6, Tailwind CSS, Lucide React, Axios)
│   ├── src/
│   │   ├── components/
│   │   │   ├── DayDetailModal.jsx   # Modal showing exact problem links on cell click
│   │   │   ├── Heatmap.jsx          # 53x7 GitHub-style 365-day SVG/grid contribution graph
│   │   │   ├── StatsOverview.jsx    # Top KPI cards, streaks, platform progress bars
│   │   │   ├── ProblemsList.jsx     # Searchable & filterable problems explorer
│   │   │   ├── CompareView.jsx      # Side-by-side head-to-head friend comparison
│   │   │   ├── Leaderboard.jsx      # Friends ranking leaderboard
│   │   │   ├── UserModal.jsx        # Add/edit friend handles modal
│   │   │   ├── Navbar.jsx           # Navigation & user switcher
│   │   │   └── PlatformBadge.jsx    # Platform tags
│   │   ├── api.js                   # Axios API service
│   │   ├── App.jsx                  # Main view coordinator
│   │   └── main.jsx
│   ├── vite.config.js               # Dev server with proxy to backend
│   └── tailwind.config.js
│
├── server/                     # Backend (Node.js, Express, Mongoose, Cheerio, Node-Cron)
│   ├── config/
│   │   └── db.js                    # MongoDB connection with serverless connection reuse
│   ├── models/
│   │   ├── User.js                  # User schema with handles, baseline, and streak stats
│   │   └── SolvedProblem.js         # Compound unique index { userId, platform, problemId }
│   ├── services/
│   │   ├── codeforcesService.js     # Codeforces API fetcher with OK verdict filter & dedup
│   │   ├── leetcodeService.js       # LeetCode GraphQL fetcher (recent AC + submissionCalendar)
│   │   ├── codechefService.js       # CodeChef profile scraper & recent activity parser
│   │   └── syncService.js           # Multi-platform sync, bulkWrite upsert, and streak engine
│   ├── routes/
│   │   └── api.js                   # REST API routes
│   ├── utils/
│   │   └── dateUtils.js             # IST timezone (Asia/Kolkata) date helpers & streak logic
│   ├── cron/
│   │   └── syncCron.js              # Background sync scheduler
│   └── server.js                    # Express entry point
│
├── api/
│   └── index.js                     # Vercel serverless function entry
├── vercel.json                      # Vercel deployment configuration
├── .env                             # Environment variables
└── .env.example                     # Environment template
```

---

## ⚙️ Environment Variables

The project uses a root `.env` file. A template is provided in `.env.example`.

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `MONGODB_URI` | **Yes** | — | MongoDB Atlas connection URI (`mongodb+srv://...`) |
| `PORT` | No | `5000` | Port for Express API server |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed frontend origin for CORS |
| `SYNC_CRON_SCHEDULE` | No | `0 */6 * * *` | Cron schedule for automatic background sync (every 6 hours) |
| `VITE_API_URL` | No | `/api` | Base URL for API requests from the frontend |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **MongoDB Atlas** account (free tier cluster works great)

### 2. Configure `.env`
Open the `.env` file in the root directory and update your `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster>.mongodb.net/myanalyzer?retryWrites=true&w=majority
```

### 3. Run Development Servers
From the project root:

```bash
# Run both Backend (port 5000) and Frontend (port 5173) concurrently:
npm run dev
```

Alternatively, run them in separate terminals:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. In your Vercel dashboard, click **"Add New Project"** and import the repository.
3. Under **Settings → Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `NODE_ENV`: `production`
4. Deploy! Vercel will automatically build the static frontend into `dist` and route `/api/*` to the serverless function in `api/index.js`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck returning DB connection state and IST time |
| `POST` | `/api/users` | Register a new user and trigger initial sync |
| `GET` | `/api/users` | List all registered users with summary stats |
| `GET` | `/api/users/:id` | Get user details and handles |
| `PUT` | `/api/users/:id` | Update user handles or username |
| `DELETE` | `/api/users/:id` | Delete user and their associated problem records |
| `POST` | `/api/users/:id/sync` | Trigger live sync for user (`?force=true` bypasses 5m cooldown) |
| `GET` | `/api/users/:id/heatmap`| 365-day unified activity heatmap array with problem metadata |
| `GET` | `/api/users/:id/problems`| Paginated list of solved problems with platform & search filters |
| `GET` | `/api/leaderboard` | Leaderboard ranked by total solved, current streak, or longest streak |

---

## 🛡️ License
MIT License. Built for competitive programmers and coding enthusiasts.
