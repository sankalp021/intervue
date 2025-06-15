# Deployment Guide: Vercel + Render

## 🚀 Backend Deployment (Render)

### Option 1: GitHub Integration (Recommended)
1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure deployment:
     - **Root Directory**: `server`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`
     - **Region**: Choose closest to your users

3. **Set Environment Variables in Render**
   - `NODE_ENV=production`
   - `PORT=3001` (Render will override this)

4. **After deployment, note your Render URL**
   - Format: `https://your-app-name.onrender.com`

---

## 🌐 Frontend Deployment (Vercel)

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration (Recommended)
1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure build settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set Environment Variables in Vercel:**
   - `VITE_SOCKET_URL=https://your-render-backend-url.onrender.com`

5. **Deploy automatically**

---

## 🔄 Update CORS After Deployment

Once both are deployed, update your backend CORS configuration:

**In `server/index.js`:**
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-actual-vercel-url.vercel.app',
        /\.vercel\.app$/ // Allow preview deployments
      ]
    : ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST"],
  credentials: true
};
```

**Redeploy backend after updating CORS.**

---

## 🧪 Testing Your Deployment

1. **Test Backend Health:**
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Open browser developer tools → Network tab
   - Check WebSocket connections

3. **Test Full Flow:**
   - Create a teacher session
   - Open student session in another browser/incognito
   - Create a poll and test real-time functionality

---

## 📊 Monitoring

### Backend Logs (Render)
- Go to your service dashboard on Render
- Click "Logs" tab to monitor real-time activity

### Frontend Analytics (Vercel)
- Vercel provides built-in analytics
- Monitor performance and errors in dashboard

---

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure frontend URL is added to backend CORS
   - Check that URLs match exactly (no trailing slashes)

2. **WebSocket Issues:**
   - Render supports WebSockets on paid plans
   - Free tier might have limitations

3. **Build Failures:**
   - Check Node.js versions match between local and deployment
   - Ensure all dependencies are in package.json

4. **Environment Variables:**
   - Double-check all env vars are set correctly
   - Restart services after updating env vars

---

## 💰 Cost Estimation

### Render (Backend)
- **Free Tier**: $0/month (with limitations)
- **Starter**: $7/month (recommended)

### Vercel (Frontend)
- **Hobby**: Free (perfect for this project)
- **Pro**: $20/month (for commercial use)

**Total Monthly Cost: $0-7 for hobby use, $27+ for production**

---

## 🚀 Quick Commands

```bash
# Local development
npm run dev                    # Start frontend
cd server && npm start         # Start backend

# Build and test locally
npm run build                  # Build frontend
npm run preview               # Preview production build

# Deploy
vercel --prod                 # Deploy frontend
git push origin main          # Deploy backend (auto-deploy)
```

Your Live Polling System will be production-ready with global CDN (Vercel) for frontend and scalable backend (Render)! 🎯
