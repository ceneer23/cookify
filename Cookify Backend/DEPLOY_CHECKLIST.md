# Render Deployment Checklist

## ✅ Pre-Deployment Setup Complete

### Backend Configuration
- [x] Port configured for Render (process.env.PORT || 5001)
- [x] CORS updated to allow production frontend URLs
- [x] MongoDB Atlas connection string configured
- [x] Environment variables prepared (.env.production)
- [x] Package.json has correct start script
- [x] Health check endpoint available at /health
- [x] render.yaml configuration file created

### Files Ready for Deployment
- [x] server.js - Main server file
- [x] package.json - Dependencies and scripts
- [x] .env.production - Production environment variables
- [x] render.yaml - Render service configuration
- [x] All controller and model files
- [x] Middleware and route files

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### 2. Create Render Service
1. Go to [render.com](https://render.com)
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select your backend repository

### 3. Configure Service
- **Name**: cookify-backend
- **Environment**: Node
- **Build Command**: npm install
- **Start Command**: npm start
- **Plan**: Free (or preferred plan)

### 4. Set Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://sena:sena@cluster0.gyks1.mongodb.net/cookify?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-domain.com
```

### 5. Deploy
Click "Create Web Service" and wait for deployment

## 📋 Post-Deployment

### Test Your Deployment
1. Visit: `https://cookify-backend.onrender.com/health`
2. Should return: `{"status":"OK","timestamp":"..."}`
3. Test API endpoints with your frontend

### Update Frontend
1. Update `.env.production` with your Render URL:
   ```
   VITE_API_URL=https://cookify-backend.onrender.com/api
   ```
2. Deploy your frontend with the new API URL

### MongoDB Atlas Security
Ensure your MongoDB Atlas cluster allows connections from:
- IP Address: 0.0.0.0/0 (Allow from anywhere)
- Or specifically add Render's IP ranges

## 🔧 Troubleshooting

### Common Issues
1. **Build fails**: Check package.json dependencies
2. **App won't start**: Verify start command is correct
3. **Database connection fails**: Check MongoDB Atlas IP whitelist
4. **CORS errors**: Add your frontend domain to CORS allowlist

### Your Deployment URL
After deployment, your backend will be available at:
`https://cookify-backend.onrender.com`

Update your frontend to use this URL instead of localhost:5001