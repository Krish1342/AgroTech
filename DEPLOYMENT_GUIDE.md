# Deployment Guide: Render & Vercel

## Overview

This guide provides step-by-step instructions to deploy the Agrotech application:

- **Backend (FastAPI)** → Render
- **Frontend (React/Vite)** → Vercel

---

## 📦 Prerequisites

### Required Accounts

- [ ] [Render account](https://render.com/) (free tier available)
- [ ] [Vercel account](https://vercel.com/) (free tier available)
- [ ] GitHub repository with your code

### Required API Keys

- [ ] GROQ API Key
- [ ] OpenWeather API Key
- [ ] ThingSpeak API Key & Channel ID (if using IoT features)

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Prepare Backend

1. Ensure your code is pushed to GitHub
2. Verify `backend/render.yaml` exists (already created)
3. Make sure `backend/requirements.txt` is up to date

### Step 2: Create Render Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `agrotech-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

```
APP_NAME=Agrotech API
APP_VERSION=1.0.0
GROQ_API_KEY=<your-groq-api-key>
OPENWEATHER_API_KEY=<your-openweather-api-key>
THINGSPEAK_API_KEY=<your-thingspeak-api-key>
THINGSPEAK_CHANNEL_ID=<your-channel-id>
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Important**: You'll update `ALLOWED_ORIGINS` with your actual Vercel URL after frontend deployment.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for the build and deployment
3. Once deployed, copy your backend URL (e.g., `https://agrotech-backend.onrender.com`)
4. Test the API by visiting: `https://your-backend-url.onrender.com/docs`

### Step 5: Enable Health Checks (Recommended)

1. Go to **Settings** → **Health Check**
2. Set **Health Check Path**: `/health`
3. This keeps your free-tier service from sleeping

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Update Vercel Configuration

1. Open `frontend/vercel.json`
2. Update the backend URL in the `rewrites` section:

```json
"rewrites": [
  {
    "source": "/api/:path*",
    "destination": "https://your-backend-url.onrender.com/api/:path*"
  }
]
```

### Step 2: Create Environment Variables File

1. Copy `.env.example` to `.env.production`:

```bash
cd frontend
cp .env.example .env.production
```

2. Update the values in `.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_APP_ENV=production
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add all variables from your `.env.production` file
   - Make sure to set for **Production**, **Preview**, and **Development** environments

6. Click **"Deploy"**
7. Wait 2-5 minutes for deployment
8. Copy your frontend URL (e.g., `https://agrotech-frontend.vercel.app`)

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### Step 4: Update Backend CORS Settings

1. Go back to Render dashboard
2. Update the `ALLOWED_ORIGINS` environment variable:

```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

3. Your backend will automatically redeploy with the new settings

---

## ✅ Verification & Testing

### Backend Health Check

1. Visit `https://your-backend-url.onrender.com/health`
2. Should return: `{"status": "healthy"}`

### API Documentation

1. Visit `https://your-backend-url.onrender.com/docs`
2. You should see the Swagger UI with all endpoints

### Frontend Check

1. Visit your Vercel URL
2. Test these features:
   - [ ] Homepage loads correctly
   - [ ] Login/Register works
   - [ ] API calls to backend work
   - [ ] Weather data loads
   - [ ] Chat feature works

### Network Tab Debugging

1. Open browser DevTools → Network tab
2. Check that API calls go to your Render backend URL
3. Verify there are no CORS errors

---

## 🔧 Optimization Tips

### Backend Performance (Render)

- **Upgrade Plan**: Free tier has cold starts (30s+ delay). Upgrade to Starter ($7/mo) for always-on service
- **Workers**: Adjust `--workers` in the start command based on your plan
- **Region**: Choose the region closest to your users
- **Database**: Consider adding a PostgreSQL database for persistent storage

### Frontend Performance (Vercel)

- **Caching**: Vercel automatically caches static assets
- **CDN**: Vercel's global CDN ensures fast loading worldwide
- **Image Optimization**: Use Vercel's Image Optimization for photos
- **Environment Variables**: Keep sensitive data in environment variables, not code

### Cost Optimization

- **Render Free Tier**:
  - Service spins down after 15 minutes of inactivity
  - 750 hours/month free
  - Add health check to keep it alive during active hours

- **Vercel Free Tier**:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS and CDN

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors

**Problem**: Frontend can't connect to backend
**Solution**:

- Check `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Verify the URL format (no trailing slash)
- Redeploy backend after changes

### Issue 2: API Calls Failing

**Problem**: 404 or connection errors
**Solution**:

- Verify `VITE_API_BASE_URL` in Vercel environment variables
- Check that `/api` rewrites in `vercel.json` are correct
- Test backend directly: `curl https://your-backend.onrender.com/health`

### Issue 3: Backend Cold Starts (Render Free Tier)

**Problem**: First request takes 30+ seconds
**Solution**:

- Set up health check endpoint
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your API every 5 minutes
- Or upgrade to Render Starter plan ($7/mo)

### Issue 4: Environment Variables Not Working

**Problem**: API keys not loading
**Solution**:

- Vercel: Check variables are set for **Production** environment
- Render: Verify variables don't have quotes or extra spaces
- Redeploy after adding/changing variables

### Issue 5: Build Failures

**Problem**: Deployment fails during build
**Solution**:

- Check build logs in dashboard
- Verify `package.json` and `requirements.txt` are correct
- Ensure all dependencies are listed
- For Vercel: Try clearing build cache in settings

---

## 📊 Monitoring & Logs

### Render Logs

- Dashboard → Your Service → **Logs** tab
- Real-time logs of your backend
- Filter by severity (Info, Warning, Error)

### Vercel Logs

- Dashboard → Your Project → **Deployments**
- Click deployment → **View Function Logs**
- Monitor build and runtime logs

### Recommended Monitoring

- **Sentry**: Error tracking ([sentry.io](https://sentry.io/))
- **LogRocket**: Session replay ([logrocket.com](https://logrocket.com/))
- **Render Metrics**: Built-in CPU/Memory monitoring

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Render and Vercel support automatic deployments:

**Render**:

- Auto-deploys when you push to your main branch
- Configure in Settings → Build & Deploy

**Vercel**:

- Auto-deploys all branches by default
- Production: main/master branch
- Preview: all other branches

### Manual Deployments

**Render**: Click **"Manual Deploy"** → **"Deploy latest commit"**
**Vercel**: Run `vercel --prod` in your frontend directory

---

## 🎯 Production Checklist

Before going live, ensure:

### Security

- [ ] All API keys in environment variables (not in code)
- [ ] CORS properly configured (no `*` wildcards)
- [ ] HTTPS enabled (automatic on both platforms)
- [ ] `.env` files in `.gitignore`

### Performance

- [ ] Backend health check enabled
- [ ] Frontend assets optimized (images, code splitting)
- [ ] API response times < 2 seconds

### Functionality

- [ ] All features tested on production URLs
- [ ] Error handling works correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### Monitoring

- [ ] Error tracking configured
- [ ] Logging enabled
- [ ] Uptime monitoring set up

---

## 📞 Support & Resources

### Render Documentation

- [Render Docs](https://render.com/docs)
- [Python Guide](https://render.com/docs/deploy-fastapi)

### Vercel Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Vite Guide](https://vercel.com/docs/frameworks/vite)

### Agrotech Specific

- Backend API: `/docs` endpoint for Swagger UI
- Issues: Check GitHub repository issues

---

## 🎉 Success!

Your Agrotech application is now live:

- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app`

Share your URLs and start helping farmers with smart agriculture! 🌱

---

_Last updated: January 2026_
