# Quick Start Guide

Get the Cyber Cougars OSI Showcase running locally in about 10 minutes.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier at <https://cloud.mongodb.com>)
- Cloudinary account (free tier at <https://cloudinary.com>)

## 1. Install Dependencies

```bash
# From the Cougars/ project root
npm install
cd client && npm install && cd ..
```

## 2. Set Up Environment Variables

### Backend — create `server/.env`

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

### Frontend — create `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Get Your Credentials

### MongoDB Atlas

1. Go to <https://cloud.mongodb.com> and create a free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<password>` with your database user's password
4. Append `/cyber-cougars` (or any DB name) before the `?` in the string
5. In **Network Access**, add `0.0.0.0/0` to allow connections from anywhere

### Cloudinary

1. Go to <https://cloudinary.com/console>
2. Copy **Cloud Name**, **API Key**, and **API Secret** from the dashboard

### JWT Secret

Generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 4. Run the App

```bash
# From Cougars/ root — starts both servers concurrently
npm run dev
```

- Backend: <http://localhost:5000>
- Frontend: <http://localhost:5173>

## 5. Test It

1. Open <http://localhost:5173>
2. Register an account
3. Go to **Create Profile** and fill in your details
4. Upload a profile photo
5. Go home — your card should appear in the team grid and OSI stack

## Troubleshooting

**Can't connect to MongoDB?**

- Check Network Access in Atlas — your IP must be whitelisted
- Verify the connection string is correct (no stray spaces)

**Images not uploading?**

- Double-check Cloudinary credentials in `.env`
- Check the browser console for error details

**CORS errors?**

- Make sure `CLIENT_URL=http://localhost:5173` is set in `server/.env`

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production hosting instructions.
