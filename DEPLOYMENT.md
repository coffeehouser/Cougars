# DnD Space - Deployment Guide

This guide will help you get your D&D social network up and running on a production server.

## Prerequisites

Before you begin, make sure you have:
- A MongoDB Atlas account (free tier works fine) or a MongoDB server
- Node.js 18+ and npm installed
- A hosting service (recommended: Railway, Render, Heroku, or DigitalOcean)
- A Cloudinary account for image hosting (free tier available)

---

## Part 1: Environment Setup

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and new cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your database user password
6. Add `/dndspace` at the end of the connection string (or your preferred database name)

### 2. Cloudinary Setup (for image uploads)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Create Environment Files

#### Backend (.env file in `/server`)

Create a file called `.env` in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/dndspace?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS (your frontend URL)
CLIENT_URL=http://localhost:5173
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For JWT_SECRET, use a long random string (at least 32 characters)
- You can generate a random JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### Frontend (.env file in `/client`)

Create a file called `.env` in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Part 2: Local Development Testing

Before deploying, test everything locally:

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Run the Application Locally

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser. You should see the app running!

---

## Part 3: Deployment Options

### Option A: Railway (Recommended - Easiest)

Railway offers free hosting for small projects with a great developer experience.

#### Backend Deployment

1. Go to [Railway.app](https://railway.app/) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select your repository
4. Railway will auto-detect it's a Node.js app
5. Go to "Variables" tab and add all your environment variables from server/.env:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLIENT_URL=https://your-frontend-url.railway.app
   ```
6. Go to "Settings" → "Root Directory" and set it to `server`
7. Railway will automatically deploy your backend
8. Copy your backend URL (something like `https://your-app.railway.app`)

#### Frontend Deployment

1. Click "New" → "Project" again for the frontend
2. Select the same GitHub repository
3. Go to "Settings" → "Root Directory" and set it to `client`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
5. Go to "Settings" → "Build Command" and set to: `npm run build`
6. Go to "Settings" → "Start Command" and set to: `npm run preview`
7. Railway will deploy your frontend
8. Access your app at the provided URL!

#### Update CORS

Go back to your backend Railway project and update the `CLIENT_URL` environment variable to your actual frontend URL.

---

### Option B: Render

Render offers free hosting with automatic deploys from GitHub.

#### Backend Deployment

1. Go to [Render.com](https://render.com/) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: dndspace-backend
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   MONGODB_URI=your-connection-string
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLIENT_URL=https://your-frontend.onrender.com
   ```
6. Click "Create Web Service"
7. Copy your service URL

#### Frontend Deployment

1. Click "New +" → "Static Site"
2. Select your repository
3. Configure:
   - **Name**: dndspace-frontend
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Click "Create Static Site"

#### Important for Render Free Tier

Free tier services spin down after 15 minutes of inactivity. The first request after inactivity may take 30-60 seconds to wake up the server.

---

### Option C: Heroku

#### Backend Deployment

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create dndspace-backend`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your-connection-string
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
   heroku config:set CLOUDINARY_API_KEY=your-api-key
   heroku config:set CLOUDINARY_API_SECRET=your-api-secret
   heroku config:set CLIENT_URL=https://your-frontend-url.herokuapp.com
   heroku config:set NODE_ENV=production
   ```
5. Create `Procfile` in server directory:
   ```
   web: npm start
   ```
6. Deploy:
   ```bash
   cd server
   git subtree push --prefix server heroku main
   ```

#### Frontend Deployment

For frontend, use Railway or Render (Heroku doesn't support static sites on free tier anymore).

---

## Part 4: Post-Deployment Checklist

### 1. Test Core Functionality

- [ ] User registration
- [ ] User login
- [ ] Create a character
- [ ] Upload profile/banner images
- [ ] Add wall comments
- [ ] Upload photos to album
- [ ] Add songs to playlist
- [ ] Dice roller works
- [ ] Roll history persists

### 2. Update CORS

Make sure your backend `CLIENT_URL` environment variable is set to your actual frontend URL (not localhost).

### 3. Database Indexes

Your MongoDB should automatically create indexes, but verify by checking MongoDB Atlas:
- Go to your cluster → Browse Collections
- Check that indexes exist on User.email, Character.owner, etc.

### 4. Test on Mobile

Visit your deployed site on a mobile device to ensure responsive design works correctly.

---

## Part 5: Domain Setup (Optional)

### Using a Custom Domain

If you have a custom domain (e.g., `dndspace.com`):

1. **For Railway/Render:**
   - Go to your project settings
   - Click "Add Custom Domain"
   - Follow instructions to add CNAME record to your DNS

2. **Update Environment Variables:**
   - Update `CLIENT_URL` in backend to your custom domain
   - Update `VITE_API_URL` in frontend to your custom backend domain

3. **SSL Certificate:**
   - Railway and Render automatically provide SSL certificates

---

## Part 6: Monitoring & Maintenance

### View Logs

**Railway:**
- Click on your service → "Deployments" → Click on latest deployment

**Render:**
- Click on your service → "Logs" tab

### Database Backups

**MongoDB Atlas:**
- Offers automatic backups on paid plans
- Free tier: Export data manually from Collections tab

### Updates & Redeployment

Both Railway and Render automatically redeploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your changes will automatically deploy within a few minutes!

---

## Common Issues & Troubleshooting

### Issue: "CORS Error" in browser console

**Solution:**
- Make sure `CLIENT_URL` in backend matches your actual frontend URL
- Restart your backend service after updating environment variables

### Issue: Images not uploading

**Solution:**
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for error logs
- Ensure upload preset is set to "unsigned" or configure signed uploads

### Issue: "JWT malformed" error

**Solution:**
- Clear browser localStorage
- Logout and login again
- Verify JWT_SECRET is set in backend

### Issue: Database connection timeout

**Solution:**
- Check MongoDB Atlas → Network Access
- Add `0.0.0.0/0` to IP whitelist (allow from anywhere)
- Verify connection string is correct

### Issue: Backend takes forever to respond

**Solution:**
- Free tier services sleep after inactivity
- First request may take 30-60 seconds
- Consider upgrading to paid tier for always-on service

---

## Scaling Considerations

As your campaign grows, consider:

1. **Upgrade MongoDB**: Free tier has 512MB storage limit
2. **Upgrade Hosting**: Free tiers have usage limits
3. **Add CDN**: Use Cloudflare for faster image loading
4. **Add Monitoring**: Use services like LogRocket or Sentry
5. **Backup Strategy**: Regular database backups

---

## Support & Resources

- **MongoDB**: https://docs.mongodb.com/
- **Railway**: https://docs.railway.app/
- **Render**: https://render.com/docs
- **Cloudinary**: https://cloudinary.com/documentation

---

## Next Steps

Once deployed, share the URL with your D&D group and start building your campaign's social network!

Remember to:
- Set up regular database backups
- Monitor your hosting usage
- Keep dependencies updated
- Have fun! 🎲⚔️🐉
