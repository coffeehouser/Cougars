# Cyber Cougars — OSI Showcase

## Mid-State Technical College IT Club

A full-stack web application built to showcase the club's hands-on demonstration of all seven layers of the OSI networking model at the industry event on **March 17, 2026**.

Each team member owns one or more OSI layers and contributed to a hands-on build the club assembled together. This app runs on two computers the club built, and serves as the interactive showcase — visitors browse through member profiles to see how each person's work maps to a layer of the OSI model.

---

## The Team

| Member | Role | OSI Layer(s) |
| --- | --- | --- |
| Darien | Web Developer | Layer 7 — Application |
| Jazmine | Physical Network / SSH | Layer 1 — Physical |
| Cody | VLAN / Trunking | Layer 2 — Data Link |
| Richard | Routing / High Availability | Layer 3 — Network |
| Mason | Ethical Hacking | Layers 6 & 7 |
| Jeremy | TBD | TBD |

Project Managers: Troy & Evan — Assistant PM: Oneil

---

## Tech Stack

### Frontend

- React 19 + Vite
- React Router 7
- Custom CSS — official MSTC brand colors (`#82142D` maroon, `#fcb618` gold, `#005589` blue)
- Google Fonts: Orbitron (headings), Inter (body), JetBrains Mono (code)

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication (retained for cybersecurity demo)

> No external image service. Profile photos are static files served directly from `client/public/images/`.

---

## Features

- **OSI Layer Diagram** — visual 7-layer stack on the home page, mapping each member to their layer(s)
- **Member Profiles** — photo, name, major, semester, role, OSI contribution, bio, LinkedIn link
- **Team Grid** — responsive card grid on the home page
- **Auth System** — login / register retained for the cybersecurity hacking demonstration
- **Profile Photos** — static files in `client/public/images/headshots/`; no cloud upload required
- **Responsive Design** — works on desktop, tablet, and mobile

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for full setup instructions.

```bash
# Install all dependencies (run from Cougars/ root)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Create environment files
cp .env.example server/.env
# Edit server/.env — fill in MONGODB_URI, JWT_SECRET, CLIENT_URL

# (client/.env already has the right default for local dev)

# Run both servers
npm run dev
```

Open <http://localhost:5173>

---

## Environment Variables

### Backend — `server/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Profile Images

Place headshot files in `client/public/images/headshots/`:

```text
client/public/images/headshots/
  default.jpg      ← shown when no photo is set
  darien.jpg
  josh.jpg
  jazmine.jpg
  cody.jpg
  richard.jpg
  mason.jpg
  jeremy.jpg
```

Recommended: **800×800 px**, square crop, JPG or WebP.

In the profile form, enter the path in the **Profile Photo Path** field:
`/images/headshots/darien.jpg`

Event / gathering photos go in `client/public/images/gallery/`. After dropping files there, open `client/public/images/gallery/manifest.json` and add each filename to the `photos` array — the gallery on the home page updates automatically with no code changes needed. See `gallery/README.txt` for the exact format.

---

## Project Structure

```text
Cougars/
├── client/                    # React + Vite frontend
│   ├── public/
│   │   └── images/
│   │       ├── headshots/     # Member profile photos (static)
│   │       └── gallery/       # Event and gathering photos
│   └── src/
│       ├── components/
│       │   ├── auth/          # Login, Register
│       │   ├── common/        # Home, LoadingSpinner
│       │   ├── home/          # OSIStack diagram component
│       │   ├── layout/        # Navbar
│       │   └── member/        # MemberProfile, MemberForm, MemberGrid
│       ├── context/           # AuthContext (JWT state)
│       ├── pages/             # MyProfile, CreateProfile, EditProfile
│       ├── services/          # memberService, authService, api (axios)
│       └── styles/            # theme.css (Maroon/Gold variables), App.css
├── server/                    # Express backend
│   ├── config/                # db.js (MongoDB connection)
│   ├── controllers/           # memberController, authController
│   ├── middleware/            # JWT auth middleware, error handler
│   ├── models/                # Member.js, User.js
│   └── routes/                # members.js, auth.js
├── .env.example               # Backend env variable template
└── package.json               # Root — runs both servers via concurrently
```

---

## API Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/members` | Public | Get all member profiles |
| GET | `/api/members/:id` | Public | Get member by MongoDB ID |
| GET | `/api/members/slug/:slug` | Public | Get member by slug |
| GET | `/api/members/my/profile` | Required | Get the authenticated user's own profile |
| POST | `/api/members` | Required | Create profile (one per user account) |
| PUT | `/api/members/:id` | Required | Update profile (owner only) |
| DELETE | `/api/members/:id` | Required | Delete profile (owner only) |
| POST | `/api/auth/register` | Public | Register a new account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Required | Get current user info |
| GET | `/health` | Public | Server health check |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start both frontend (5173) and backend (5000) concurrently |
| `npm run server` | Backend only |
| `npm run client` | Frontend only |
| `cd client && npm run build` | Build frontend for production |

---

## Testing Checklist (by March 14)

- [ ] `npm run dev` starts without errors
- [ ] Home page loads — OSI stack and team grid visible
- [ ] Register → account created, token stored in localStorage
- [ ] Login → session works, navbar updates
- [ ] Create Profile → form submits, profile appears in team grid and OSI stack
- [ ] Profile photo displays (drop image in `headshots/`, enter path in form)
- [ ] View Profile at `/member/:id` → all fields display correctly
- [ ] **Edit Profile** button visible when logged in as the profile owner
- [ ] Edit Profile → changes save correctly, redirects back to profile view
- [ ] Delete Profile → removed from DB, redirected to home
- [ ] Protected routes (`/my-profile`, `/profile/create`, `/profile/edit`) redirect to login when unauthenticated
- [ ] All 7 OSI layers render in the stack
- [ ] Mobile responsive — grid stacks to 1 column on small screens

---

## Troubleshooting

**Can't connect to MongoDB?**

- For MongoDB Atlas: whitelist your IP in Network Access (`0.0.0.0/0` allows all IPs)
- For local MongoDB: start the service with `net start MongoDB` or `mongod --dbpath /c/data/db`
- Verify `MONGODB_URI` in `server/.env`

**Edit Profile button not showing on the profile page?**

- You must be logged in as the account that created that profile
- Log out and log back in to refresh the session

**Profile photo not showing?**

- Confirm the file exists at `client/public/images/headshots/yourname.jpg`
- The path in the form must start with `/images/headshots/`

**CORS errors?**

- `CLIENT_URL` in `server/.env` must exactly match the frontend URL — no trailing slash

**JWT errors / logged out unexpectedly?**

- Clear `localStorage` in browser devtools (`Application → Local Storage → delete token`) and log in again

---

Built by the Cyber Cougars IT Club — Mid-State Technical College
