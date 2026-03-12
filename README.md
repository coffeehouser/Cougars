# Cyber Cougars — OSI Showcase

## Mid-State Technical College IT Club

A full-stack web application built to showcase the club's hands-on demonstration of all seven layers of the OSI networking model at the industry event on **March 17, 2026**.

Each team member owns one or more OSI layers and presents their work at their own station. This site serves as a central hub — displaying the team, each member's role, and what they're demonstrating.

## The Team

| Member | Role | OSI Layer(s) |
| --- | --- | --- |
| Darien | Web Developer | Layer 7 — Application |
| Jazmine | Physical Network / SSH | Layer 1 — Physical |
| Cody | VLAN / Trunking | Layer 2 — Data Link |
| Richard | Routing / High Availability | Layer 3 — Network |
| Mason | Ethical Hacking | Layers 6 & 7 |
| Josh | TBD | TBD |
| Jeremy | TBD | TBD |

Project Managers: Troy & Evan — Assistant Project Manager: Oneil

## Tech Stack

### Frontend

- React 19 + Vite
- React Router 7
- Custom CSS — Maroon & Gold theme (MSTC brand colors)
- Google Fonts: Orbitron, Inter, JetBrains Mono

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication (retained for cybersecurity demo)
- Cloudinary for profile image storage
- Multer for file uploads

## Features

- **OSI Layer Diagram** — visual 7-layer stack on the home page, mapping each member to their layer(s)
- **Member Profiles** — photo, name, major, semester, role, OSI contribution, bio, LinkedIn link
- **Team Grid** — responsive card grid on the home page
- **Auth System** — login/register retained for cybersecurity demonstrations
- **Profile Image Upload** — drag-and-drop upload stored on Cloudinary
- **Responsive Design** — works on desktop, tablet, and mobile

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for full setup instructions.

```bash
# Install all dependencies (from project root)
npm install
cd client && npm install && cd ..

# Copy and fill in environment files
cp .env.example .env
# Edit .env with your MongoDB, Cloudinary, and JWT credentials

# Run both servers concurrently
npm run dev
```

Open <http://localhost:5173>

## Environment Variables

### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key_at_least_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```text
Cougars/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── auth/          # Login, Register
│       │   ├── common/        # Home, LoadingSpinner
│       │   ├── home/          # OSIStack diagram
│       │   ├── layout/        # Navbar
│       │   └── member/        # MemberProfile, MemberForm, MemberGrid
│       ├── context/           # AuthContext (JWT state)
│       ├── pages/             # MyProfile, CreateProfile, EditProfile
│       ├── services/          # memberService, authService, api
│       └── styles/            # theme.css (Maroon/Gold), App.css
├── server/                    # Express backend
│   ├── config/                # MongoDB, Cloudinary, file upload config
│   ├── controllers/           # memberController, authController
│   ├── middleware/            # JWT auth middleware, error handler
│   ├── models/                # Member.js, User.js
│   └── routes/                # members.js, auth.js
└── package.json               # Root scripts (runs both servers)
```

## API Endpoints

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/members` | Public | Get all member profiles |
| GET | `/api/members/:id` | Public | Get member by ID |
| GET | `/api/members/slug/:slug` | Public | Get member by slug |
| GET | `/api/members/my/profile` | Required | Get own profile |
| POST | `/api/members` | Required | Create profile (one per user) |
| PUT | `/api/members/:id` | Required | Update profile |
| DELETE | `/api/members/:id` | Required | Delete profile |
| PUT | `/api/members/:id/image` | Required | Upload profile photo |
| POST | `/api/auth/register` | Public | Register account |
| POST | `/api/auth/login` | Public | Login |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start both frontend (5173) and backend (5000) |
| `npm run server` | Backend only |
| `npm run client` | Frontend only |
| `cd client && npm run build` | Build frontend for production |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

Recommended stack:

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas (free tier)
- **Images:** Cloudinary (free tier)

## Testing Checklist (by March 14)

- [ ] `npm run dev` starts without errors
- [ ] Home page loads — OSI stack + team grid visible
- [ ] Register → account created
- [ ] Login → session works, navbar updates
- [ ] Create Profile → form submits, photo uploads to Cloudinary
- [ ] View Profile at `/member/:id` → all fields display correctly
- [ ] Edit Profile → changes save correctly
- [ ] Delete Profile → removed from DB and Cloudinary
- [ ] Protected routes redirect to login when unauthenticated
- [ ] No purple/DnD colors visible — maroon/gold throughout
- [ ] All 7 OSI layers render in the stack
- [ ] Mobile responsive — grid stacks to 1 column on small screens

## Troubleshooting

**Can't connect to MongoDB?**

- Whitelist your IP in MongoDB Atlas Network Access (`0.0.0.0/0` allows all)
- Verify the connection string format in `.env`

**Images not uploading?**

- Verify Cloudinary credentials in `.env`
- Check browser console for errors
- File size limit: 5MB for profile photos

**CORS errors?**

- Ensure `CLIENT_URL` in backend `.env` exactly matches your frontend URL

**JWT errors?**

- Clear localStorage in browser devtools and log back in

---

Built by the Cyber Cougars IT Club — Mid-State Technical College
