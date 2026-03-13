# Quick Start Guide

Get the Cyber Cougars OSI Showcase running locally in about 10 minutes.

## Prerequisites

- Node.js 18+ installed
- MongoDB — either a free [Atlas](https://cloud.mongodb.com) cluster or MongoDB 8 installed locally

## 1. Install Dependencies

Run these from the `Cougars/` project root:

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## 2. Set Up Environment Variables

### Backend — create `server/.env`

Copy the template and fill in your values:

```bash
cp .env.example server/.env
```

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
CLIENT_URL=http://localhost:5173
```

### Frontend — `client/.env` is already correct for local dev

The file `client/.env.example` has the right default. Copy it if it doesn't exist:

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Get Your Credentials

### MongoDB Atlas (cloud option)

1. Go to <https://cloud.mongodb.com> and create a free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<password>` with your database user's password
4. Append `/cyber-cougars` before the `?retryWrites` part
5. In **Network Access**, add `0.0.0.0/0` to allow all connections

### MongoDB Local (already installed)

If you installed MongoDB 8 locally, start the service:

```bash
# Windows — as a service
net start MongoDB

# Or run directly (create C:\data\db first)
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath /c/data/db
```

Then use this as your `MONGODB_URI`:

```env
MONGODB_URI=mongodb://localhost:27017/cyber-cougars
```

### JWT Secret

Generate a secure random value:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output as your `JWT_SECRET`.

## 4. Add Profile Images

Place headshot files in `client/public/images/headshots/`. Recommended: 800×800 px, square crop.

```text
client/public/images/headshots/
  default.jpg   ← fallback when no photo is set
  darien.jpg
  josh.jpg
  jazmine.jpg
  cody.jpg
  richard.jpg
  mason.jpg
  jeremy.jpg
```

Drop event/gathering photos in `client/public/images/gallery/`, then open `client/public/images/gallery/manifest.json` and add each filename to the `photos` array. See `README.txt` in that folder for the exact format.

## 5. Run the App

```bash
# From Cougars/ root — starts both servers concurrently
npm run dev
```

- Backend: <http://localhost:5000>
- Frontend: <http://localhost:5173>

## 6. Test It

1. Open <http://localhost:5173>
2. Register an account
3. Click **Create Profile** and fill in your details
4. In the **Profile Photo Path** field enter `/images/headshots/yourname.jpg`
5. Submit — your card should appear in the team grid and OSI stack on the home page
6. Click your card to view your profile; click **Edit Profile** to make changes

## Troubleshooting

**`mongod: command not found`**

- Use the full path: `"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath /c/data/db`
- Or start it as a Windows service: `net start MongoDB`

**`concurrently is not recognized`**

- Run `npm install` from the `Cougars/` root to install the root dev dependency

**Can't connect to MongoDB?**

- Check Network Access in Atlas — your IP must be whitelisted (`0.0.0.0/0` for all)
- For local: verify `mongod` is running and `MONGODB_URI=mongodb://localhost:27017/cyber-cougars`

**Edit Profile button missing?**

- You must be logged in as the account that created the profile
- Log out and back in to refresh the JWT

**Profile photo not showing?**

- Confirm the file is in `client/public/images/headshots/`
- Path in the form must start with `/images/headshots/`

**CORS errors?**

- Ensure `CLIENT_URL=http://localhost:5173` is set exactly in `server/.env`

---

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production hosting instructions.
