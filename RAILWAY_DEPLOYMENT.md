# Railway Deployment Guide

This guide will help you deploy the CommissionFlow system to Railway.

## ⚠️ Common Deployment Error

If you see this error:
```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Solution:** You forgot to set the `MONGO_URI` environment variable in Railway's dashboard. See step 2 below.

## Prerequisites

- A [Railway](https://railway.app/) account
- A MongoDB database (you can use Railway's MongoDB plugin or MongoDB Atlas)
- Your GitHub repository connected to Railway

## Deployment Steps

### 1. Create a New Project on Railway

1. Log in to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose this repository

### 2. Configure Environment Variables

**CRITICAL: You MUST set these in Railway's dashboard, not in a .env file**

Go to your Railway project → Variables tab and add:

#### Required Variables:

```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret_key
```

#### Optional Variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://your-app.railway.app
```

**Important Notes:**
- `MONGO_URI`: **MUST be set in Railway dashboard** - Use Railway's MongoDB plugin or MongoDB Atlas connection string
- `JWT_SECRET`: Generate a secure random string (at least 32 characters). Example: `openssl rand -base64 32`
- `PORT`: Railway automatically sets this - **DO NOT set manually**
- `.env` files are **NOT** deployed to Railway - all variables must be in the Railway dashboard

**How to add variables in Railway:**
1. Go to your project in Railway dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Click "New Variable"
5. Add each variable name and value
6. Click "Add" for each one

### 3. Add MongoDB Database

#### Option A: Using Railway's MongoDB Plugin (Recommended)

1. In your Railway project, click "New"
2. Select "Database" → "Add MongoDB"
3. Once created, Railway will automatically set the `MONGO_URI` variable
4. You can also manually copy the connection string from the MongoDB service

#### Option B: Using MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist all IP addresses (0.0.0.0/0) in Network Access
3. Create a database user
4. Copy the connection string and add it as `MONGO_URI` in Railway

### 4. Deploy

Railway will automatically deploy when you push to your repository. The deployment process:

1. Installs dependencies for both client and server
2. Builds the React frontend
3. Starts the Express server (which serves the built React app)

### 5. Access Your Application

Once deployed, Railway will provide you with a public URL like:
```
https://your-app.up.railway.app
```

## Project Structure

```
.
├── package.json           # Root package.json with build scripts
├── railway.json          # Railway configuration
├── nixpacks.toml         # Nixpacks build configuration
├── src/
│   ├── client/          # React frontend (Vite)
│   │   ├── package.json
│   │   └── dist/        # Built files (created during deployment)
│   └── server/          # Express backend
│       ├── package.json
│       └── index.js
```

## How It Works

1. **Build Process**: Railway runs `npm run install:all` to install dependencies, then `npm run build` to build the React app
2. **Start Process**: Railway runs `npm start` which starts the Express server
3. **Static Files**: In production, Express serves the built React app from `src/client/dist`
4. **API Routes**: All `/api/*` routes are handled by Express
5. **Client Routes**: All other routes serve the React app (for client-side routing)

## Troubleshooting

### Build Fails

- Check the build logs in Railway dashboard
- Ensure all dependencies are listed in package.json files
- Verify Node.js version compatibility (requires Node >= 18)

### Database Connection Issues

- Verify `MONGO_URI` is set correctly
- For MongoDB Atlas, ensure IP whitelist includes 0.0.0.0/0
- Check database user permissions

### Application Not Loading

- Check server logs in Railway dashboard
- Verify `NODE_ENV=production` is set
- Ensure the build process completed successfully

### API Requests Failing

- Check CORS configuration in `src/server/index.js`
- Verify environment variables are set correctly
- Check Railway logs for server errors

## Local Testing of Production Build

To test the production build locally:

```bash
# Install dependencies
npm run install:all

# Build the client
npm run build

# Set environment to production and start
NODE_ENV=production npm start
```

Then visit `http://localhost:5000`

## Updating the Deployment

Railway automatically redeploys when you:
- Push to your connected GitHub branch
- Manually trigger a redeploy in the Railway dashboard

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| NODE_ENV | Environment mode | Yes | production |
| PORT | Server port | No* | 5000 |
| MONGO_URI | MongoDB connection string | Yes | mongodb+srv://user:pass@cluster.mongodb.net/dbname |
| JWT_SECRET | Secret key for JWT tokens | Yes | your_secret_key_here |
| GEMINI_API_KEY | Google Gemini API key | No | your_gemini_api_key |
| FRONTEND_URL | Frontend URL for CORS | No | https://your-app.railway.app |

*Railway automatically assigns PORT, but the app has a fallback

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
