# Quick Deployment Commands

## Backend (Render)

```bash
# Push to GitHub
git add backend/
git commit -m "Deploy backend to Render"
git push origin main

# Render will auto-deploy from GitHub
# Monitor: https://dashboard.render.com
```

## Frontend (Vercel)

```bash
# Option 1: Push to GitHub (auto-deploy)
git add frontend/
git commit -m "Deploy frontend to Vercel"
git push origin main

# Option 2: Manual deploy via CLI
cd frontend
vercel --prod
```

## Environment Variables

### Render (Backend)

Set in dashboard under Environment:

```
GROQ_API_KEY=your_key
OPENWEATHER_API_KEY=your_key
THINGSPEAK_API_KEY=your_key
THINGSPEAK_CHANNEL_ID=your_id
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Vercel (Frontend)

Set in dashboard under Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GROQ_API_KEY=your_key
VITE_OPENWEATHER_API_KEY=your_key
VITE_APP_ENV=production
```

## Test URLs

- Backend health: https://your-backend.onrender.com/health
- Backend docs: https://your-backend.onrender.com/docs
- Frontend: https://your-app.vercel.app

## Troubleshooting

1. CORS errors → Update ALLOWED_ORIGINS in Render
2. API not responding → Check Render logs
3. Frontend 404 → Verify VITE_API_BASE_URL in Vercel
4. Cold starts → Add health check or upgrade Render plan
