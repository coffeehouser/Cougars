# Deployment Guide

How to deploy the Cyber Cougars OSI Showcase to production.

## Prerequisites

- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- GitHub repository with the project pushed

---

## Part 1: External Services

### MongoDB Atlas

1. Go to <https://cloud.mongodb.com> and create a free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<password>` with your DB user's password
4. Append `/cyber-cougars` before the `?retryWrites` in the string
5. In **Network Access**, add `0.0.0.0/0` to allow connections from your host

### Cloudinary

1. Go to <https://cloudinary.com/console>
2. Copy **Cloud Name**, **API Key**, and **API Secret**

### JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Part 2: Deploy the Backend (Railway — Recommended)

1. Go to <https://railway.app> and sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo** → select this repo
3. Under **Settings** → **Root Directory**, set to `server`
4. Under **Variables**, add all backend environment variables:

   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-atlas-connection-string
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

5. Railway auto-deploys. Copy the backend URL (e.g. `https://xyz.railway.app`)

---

## Part 3: Deploy the Frontend (Vercel — Recommended)

1. Go to <https://vercel.com> and sign up with GitHub
2. Click **Add New Project** → import this repo
3. Under **Root Directory**, set to `client`
4. Under **Environment Variables**, add:

   ```env
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. Click **Deploy**. Copy your Vercel URL (e.g. `https://xyz.vercel.app`)
6. Go back to Railway and update `CLIENT_URL` to your actual Vercel URL

---

## Part 4: Alternative — Render

### Backend on Render

1. Go to <https://render.com> → **New Web Service**
2. Connect your GitHub repo
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
4. Add the same environment variables as listed in Part 2

### Frontend on Render

1. Go to <https://render.com> → **New Static Site**
2. Connect your GitHub repo
3. Configure:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add `VITE_API_URL` pointing to your Render backend URL

> Free tier Render services spin down after 15 minutes of inactivity. The first request after sleep can take 30–60 seconds.

---

## Part 5: Post-Deployment Checklist

- [ ] Backend health check responds at `GET /health`
- [ ] User registration works on the deployed site
- [ ] User login works
- [ ] Create Profile — photo uploads to Cloudinary
- [ ] View Profile — all fields display correctly
- [ ] Home page OSI stack shows member assignments
- [ ] `CLIENT_URL` in backend matches the deployed frontend URL exactly (no trailing slash)
- [ ] Test on a mobile device

---

## Common Issues

### CORS errors

`CLIENT_URL` in backend environment variables must exactly match your frontend URL including `https://` and with no trailing slash.

### Images not uploading

Verify all three Cloudinary variables are set correctly. Check the backend logs for the specific Cloudinary error message.

### JWT errors after deploying

Clear browser localStorage and log in again. If it persists, verify `JWT_SECRET` is set in the backend environment.

### Database connection timeout

Ensure `0.0.0.0/0` is in MongoDB Atlas **Network Access**. Hosted services use dynamic IPs that narrow whitelist rules won't cover.

---

## Monitoring

### View Logs

- **Railway:** Project → Deployments → latest → Logs tab
- **Render:** Service → Logs tab
- **Vercel:** Project → Functions → Logs

### Redeployment

Railway and Render auto-redeploy on every push to the main branch:

```bash
git add .
git commit -m "your change"
git push origin main
```

---

## Resources

- MongoDB Atlas: <https://www.mongodb.com/docs/atlas/>
- Railway: <https://docs.railway.app/>
- Render: <https://render.com/docs>
- Vercel: <https://vercel.com/docs>
- Cloudinary: <https://cloudinary.com/documentation>
