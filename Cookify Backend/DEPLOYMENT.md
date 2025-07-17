# Cookify Backend Deployment Guide

## Deploy to Render

### Method 1: Using Render Dashboard (Recommended)

1. **Create a Render Account**: Go to [render.com](https://render.com) and sign up

2. **Connect Your Repository**:
   - Push your backend code to GitHub
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend folder/repository

3. **Configure the Service**:
   - **Name**: `cookify-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose your preferred plan)

4. **Set Environment Variables**:
   Go to Environment tab and add:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://sena:sena@cluster0.gyks1.mongodb.net/cookify?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-frontend-domain.com
   ```

5. **Deploy**: Click "Create Web Service"

### Method 2: Using render.yaml

1. Push the `render.yaml` file to your repository
2. In Render dashboard, create a new service using the YAML file

### After Deployment

1. **Get your backend URL**: `https://cookify-backend.onrender.com`
2. **Update your frontend**: Change the API URL in your frontend to point to the deployed backend
3. **Test the deployment**: Visit `https://cookify-backend.onrender.com/health`

## Important Notes

- **Free Tier**: Render free tier spins down after 15 minutes of inactivity
- **Cold Starts**: First request after inactivity may take 30-60 seconds
- **Environment Variables**: Never commit sensitive data to your repository
- **CORS**: The backend is configured to accept requests from common frontend deployment platforms

## Health Check

Your backend includes a health check endpoint at `/health` that returns:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Troubleshooting

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **App Won't Start**: Verify the start command is `npm start`
3. **Database Connection**: Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
4. **CORS Issues**: Add your frontend domain to the CORS allowlist in `server.js`