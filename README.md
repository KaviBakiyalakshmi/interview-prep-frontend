# InterviewPrep Frontend (React + Vite)

Works with the Spring Boot backend (`interview-prep-backend`). Features: landing page with a public
"question of the day", signup/login, dashboard (streak, accuracy, weak topics), quiz setup and play,
results with English/Tanglish explanations, study mode, saved questions, history, leaderboard,
admin page for adding questions, and installable PWA (add to phone home screen).

## 1. Run everything locally
Terminal 1 (backend, in the backend folder):
    mvn spring-boot:run          (or run InterviewPrepApplication in IntelliJ)

Terminal 2 (frontend, in this folder):
    npm install
    npm run dev

Open http://localhost:5173
The frontend calls http://localhost:8080 by default. To change it, copy `.env.example` to `.env`.
The backend already allows http://localhost:5173 in CORS.

## 2. Manual test checklist
1. Home page shows the question of the day. Click an option: you see correct/wrong plus explanation.
2. Sign up, you land on the dashboard.
3. Quiz > pick a topic > answer > Submit. Result page shows score, review, Share button.
4. Dashboard now shows streak 1, accuracy, topic bars. Take a few quizzes and the "Practice these next"
   box appears for weak topics (needs 3+ answers in a topic with under 70 percent accuracy).
5. Study mode: filters, Show answer, Save. Saved page lists saved questions.
6. History: open an old result. Leaderboard shows you.
7. Admin: register with the email you set in `app.admin-email` in the backend. An Admin link appears.

## 3. Project structure
    src/api.js            all backend calls and token handling
    src/auth.jsx          login state (token kept in localStorage)
    src/hooks.js          bookmarks hook, date helper
    src/components.jsx    shared UI: badges, explanation tabs, study card, protected route
    src/ResultView.jsx    score, review and share
    src/pages/*           one file per screen
    src/config.js         app name and tagline: change these to rename the app
    public/               manifest, service worker, icons (PWA)

## 4. Put the code on GitHub
Use two repositories (or two folders in one repo): `interview-prep-backend` and `interview-prep-frontend`.
    git init
    git add .
    git commit -m "Initial version"
    git branch -M main
    git remote add origin https://github.com/YOUR_NAME/REPO.git
    git push -u origin main
Before pushing the backend: do not leave real passwords in application.properties. Use environment
variables (the file already reads DB_PASSWORD, JWT_SECRET, ADMIN_EMAIL).

## 5. Deploy (free tiers are enough to start; check each provider's current limits and terms)
You need three things online: a PostgreSQL database, the backend, and the frontend.

Step A: Database. Create a free hosted PostgreSQL (for example Neon or Supabase). Copy the host, database
name, user and password. Your DB_URL looks like:
    jdbc:postgresql://HOST/DBNAME?sslmode=require

Step B: Backend. Push the backend project (including its root `Dockerfile`) to GitHub, then create
a Web Service on a host that builds Dockerfiles (for example Render). Set the environment variables
listed in the backend's `deploy/backend.env.example`. After it starts, open
https://YOUR-BACKEND-URL/swagger-ui.html to confirm it works. Free backend instances usually go to sleep
when idle, so the first request after a break can take around a minute.

Step C: Frontend. Import the frontend repo into Vercel or Netlify. Build command `npm run build`, output
folder `dist`. Add the environment variable VITE_API_URL = your backend URL (no trailing slash).
`vercel.json` and `public/_redirects` already handle page refreshes on /dashboard and other routes.

Step D: CORS. In the backend host set APP_CORS_ALLOWED_ORIGINS = your frontend URL (for example
https://yourapp.vercel.app). Redeploy the backend. If the browser console shows a CORS error, this is
the setting to check.

Step E: Admin. Register on the live site with the email you put in ADMIN_EMAIL to get the Admin link.

Step F: Install on phone. Open the site in Chrome on Android, menu > Install app / Add to Home screen.

## 6. Launch plan (first 4 weeks)
Week 1: Deploy. Add 30+ more scenario questions through the Admin page (aim for 100 total).
Week 2: Post one LinkedIn / Instagram Reel per day: "Today's question: [scenario]". End with the link.
        Use the real question of the day from your own app, so followers can answer it without signing up.
Week 3: Ask 10 developer friends to try it and send feedback. Fix what confuses them. Ask them to share
        their score with the Share button.
Week 4: Post "I built this in public" with real numbers: users, quizzes taken, most missed question.
Track: signups, quizzes per user, how many come back the next day.

## 7. Money later (only after people use it)
Free: daily question, 10-question quizzes. Paid ideas: unlimited quizzes, company-wise question packs,
mock interviews with a timer, resume review. Add Razorpay when you have repeat users.

## 8. Good next features
Timer mode, explanation voting, "report a wrong question", email reminder to keep the streak,
coding questions, Python and DevOps topics, more languages for explanations.
