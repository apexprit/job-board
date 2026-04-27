# Deployment Guide — Job Board Platform

**Target Stack (All Free):**
- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL
- No Redis needed (in-memory fallback)

## Step 1: Push Code to GitHub

```bash
# If not already a git repo:
git init
git add .
git commit -m "Initial commit: Job Board Platform"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/job-board.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase PostgreSQL (Free)

1. Go to https://supabase.com and sign up (free with GitHub)
2. Click "New Project" → give it a name (e.g., "job-board")
3. Set a database password (save this!)
4. Choose closest region
5. Wait for project to provision (~2 min)
6. Go to **Settings → Database**
7. Scroll to **Connection string** → select **URI** format
8. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
9. **IMPORTANT**: Add `?pgbouncer=true&connection_limit=1` to the end for Supabase's connection pooler:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   This is your `DATABASE_URL` — save it for Step 3.

## Step 3: Deploy Backend to Render (Free)

1. Go to https://render.com and sign up (free with GitHub)
2. Click **New → Web Service**
3. Connect your GitHub repo: `job-board`
4. Configure:
   - **Name**: `job-board-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(paste from Step 2)* |
   | `JWT_SECRET` | *(generate a 32+ char random string)* |
   | `JWT_REFRESH_SECRET` | *(generate a different 32+ char random string)* |
   | `CORS_ORIGIN` | *(leave empty for now, update after Step 4)* |
   | `PORT` | `10000` |
   
   To generate random secrets, run in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
6. Click **Create Web Service**
7. Wait for build to complete (~3-5 min)
8. Note your backend URL: `https://job-board-api.onrender.com`
9. Test it: visit `https://job-board-api.onrender.com/api/health` (should return `{"status":"ok"}`)

**⚠️ Free tier note**: Render free instances spin down after 15 min of inactivity. First request after spin-down takes ~30 seconds to wake up.

## Step 4: Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com and sign up (free with GitHub)
2. Click **Add New → Project**
3. Import your GitHub repo: `job-board`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://job-board-api.onrender.com/api` |
6. Click **Deploy**
7. Wait for build (~1-2 min)
8. Note your frontend URL: `https://job-board.vercel.app`

## Step 5: Connect Frontend & Backend

1. Go back to **Render Dashboard → job-board-api → Environment**
2. Update `CORS_ORIGIN` to: `https://job-board.vercel.app`
3. Save changes (this triggers a redeploy)
4. Wait for backend to redeploy (~2 min)

## Step 6: Run Database Migrations & Seed

After the backend is deployed and connected to PostgreSQL:

1. Go to **Render Dashboard → job-board-api**
2. Click **Shell** (or use the manual deploy → run command)
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   
   Or if Shell is not available on free tier, add a one-time deploy script:
   - Temporarily change Start Command to: `npx prisma migrate deploy && npx prisma db seed && npm start`
   - Deploy, wait for seed to complete, then change back to `npm start`

## Step 7: Verify Production

1. Visit `https://job-board.vercel.app` — homepage should load
2. Click "Browse Jobs" — should show seeded jobs
3. Register a new account — should work
4. Login — should redirect to dashboard
5. Test all major flows

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to **Vercel Dashboard → Settings → Domains**
2. Add your custom domain (e.g., `yourjobboard.com`)
3. Add DNS records as instructed (CNAME to `cname.vercel-dns.com`)

### Render (Backend)
1. Go to **Render Dashboard → Settings → Custom Domains**
2. Add your API domain (e.g., `api.yourjobboard.com`)
3. Add DNS CNAME record pointing to `job-board-api.onrender.com`
4. Update `VITE_API_URL` in Vercel to `https://api.yourjobboard.com/api`
5. Update `CORS_ORIGIN` in Render to `https://yourjobboard.com`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend returns 503 | Free tier is sleeping — wait 30s and retry |
| CORS errors | Check `CORS_ORIGIN` matches exact Vercel URL (no trailing slash) |
| Database connection fails | Verify `DATABASE_URL` has `?pgbouncer=true&connection_limit=1` |
| Prisma migrate fails | Ensure `DATABASE_URL` points to PostgreSQL, not SQLite |
| Frontend shows blank page | Check `VITE_API_URL` is set correctly in Vercel env vars |
| 500 errors on API | Check Render logs for details |
