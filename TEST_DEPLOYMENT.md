# Deployment Testing Guide

## Step 1: Fix CORS (Render)
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Edit `ALLOWED_ORIGINS` to remove trailing slash:
   ```
   https://agro-tech-roan.vercel.app,http://localhost:5173
   ```
5. Save → Service will auto-redeploy

## Step 2: Configure Frontend (Vercel)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production** environment:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_APP_ENV=production
VITE_ENABLE_WEATHER=true
VITE_ENABLE_AI_CHAT=true
```

5. Click **Save**
6. Go to **Deployments** → Click latest → **Redeploy**

## Step 3: Test Backend API

### Test 1: Health Check
Open in browser:
```
https://your-backend.onrender.com/health
```
Expected: `{"status":"healthy",...}`

### Test 2: ThingSpeak Data
Open in browser:
```
https://your-backend.onrender.com/api/thingspeak/sensor-data
```
Expected: JSON with N, P, K, moisture, pH, temperature data

## Step 4: Verify Everything Works

### Checklist:
- [ ] Backend health endpoint returns 200
- [ ] ThingSpeak endpoint returns sensor data
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] Sensor data displays on dashboard

## Common Issues & Solutions

### Issue: "CORS policy" error in console
**Solution:** 
- Fix ALLOWED_ORIGINS in Render (remove trailing slash)
- Make sure it matches your Vercel URL exactly

### Issue: API calls return 404
**Solution:**
- Verify VITE_API_BASE_URL in Vercel environment variables
- Redeploy frontend after adding variables

### Issue: No sensor data showing
**Solution:**
- Test ThingSpeak endpoint directly in browser
- Check THINGSPEAK_CHANNEL_ID and THINGSPEAK_READ_API_KEY in Render

## Environment Variables Summary

### Render (Backend)
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
APP_NAME=Agrotech API
APP_VERSION=1.0.0
GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
THINGSPEAK_CHANNEL_ID=your_channel_id
THINGSPEAK_READ_API_KEY=your_read_api_key
THINGSPEAK_WRITE_API_KEY=your_write_api_key
THINGSPEAK_MODEL_FIELDS=1,2,3,4,5,6
```

### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GROQ_API_KEY=your_groq_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_APP_ENV=production
VITE_ENABLE_WEATHER=true
VITE_ENABLE_AI_CHAT=true
```

---

## Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
