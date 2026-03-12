# Quick Start Guide

Get your D&D social network running in 10 minutes!

## 1. Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free)
- Cloudinary account (free)

## 2. Clone and Install

```bash
# Clone the repo
git clone <your-repo-url>
cd DnD-space

# Install all dependencies
npm install
cd client && npm install && cd ..
```

## 3. Setup Environment Variables

### Backend (.env in root)

Create `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (client/.env)

Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## 4. Get Your Credentials

### MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create cluster → Connect → Get connection string
3. Replace `<password>` with your database password
4. Add `/dnd-social` to the end

### Cloudinary
1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Copy Cloud Name, API Key, and API Secret from dashboard

### JWT Secret
Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 5. Run the App

```bash
# From root directory
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

## 6. Test It!

1. Open http://localhost:5173
2. Register a new account
3. Create your first character
4. Upload a profile picture

---

## Deploy to Production

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

**Recommended:** Vercel (frontend) + Railway (backend)

### Quick Deploy

1. **Backend to Railway:**
   - Go to railway.app
   - Deploy from GitHub
   - Add environment variables

2. **Frontend to Vercel:**
   - Go to vercel.com
   - Import GitHub repo
   - Set root directory to `client`
   - Add `VITE_API_URL` environment variable

Done! 🎉

---

## Troubleshooting

**Can't connect to MongoDB?**
- Check your connection string
- Whitelist your IP in Atlas Network Access

**Images not uploading?**
- Verify Cloudinary credentials
- Check browser console for errors

**CORS errors?**
- Make sure `CLIENT_URL` matches your frontend URL

---

## Need Help?

See the full [SETUP.md](./SETUP.md) guide for:
- Detailed deployment instructions
- GitHub Actions CI/CD setup
- Custom domain configuration
- Troubleshooting guide
