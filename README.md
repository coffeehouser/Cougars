# D&D Character Social Network

A full-stack social media platform for Dungeons & Dragons characters, built with the MERN stack and featuring a dark medieval theme.

![D&D Social Platform](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- 🎭 **Character Profiles** - Create detailed D&D characters with stats, abilities, and backstories
- 🖼️ **Photo Albums** - Upload and organize character artwork with drag-and-drop
- 🎵 **Music Playlists** - Add character theme songs from YouTube, Spotify, or SoundCloud
- 💬 **Character Walls** - Comment and interact with other characters
- 🎨 **Customization** - Profile pictures, banners with drag-to-reposition
- 🎲 **Dice Roller** - Built-in D20 dice roller
- 🌙 **Dark Theme** - Medieval-inspired UI with purple and gold accents
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router
- Context API for state management
- Axios for API calls
- React Toastify for notifications

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image storage
- Multer for file uploads

## Quick Start

Want to get running fast? See the [QUICK_START.md](./QUICK_START.md) guide!

```bash
# Clone and install
git clone <your-repo-url>
cd DnD-space
npm install
cd client && npm install && cd ..

# Setup .env files (see .env.example)
cp .env.example .env
cp client/.env.example client/.env

# Edit .env files with your credentials

# Run development servers
npm run dev
```

Open http://localhost:5173 and start adventuring!

## Documentation

- 📘 [Quick Start Guide](./QUICK_START.md) - Get up and running in 10 minutes
- 📗 [Setup Guide](./SETUP.md) - Detailed setup and deployment instructions
- 📙 [Deployment Guide](./DEPLOYMENT.md) - Production deployment strategies

## Deployment

**Recommended Setup:**
- **Frontend:** Vercel (free, fast, auto-deploys from GitHub)
- **Backend:** Railway (free tier, auto-deploys from GitHub)
- **Database:** MongoDB Atlas (free tier)
- **Storage:** Cloudinary (free tier)

See [SETUP.md](./SETUP.md) for step-by-step deployment instructions for:
- Vercel + Railway (recommended)
- GitHub Pages + Railway
- Render (full-stack)
- Heroku

## Project Structure

```
DnD-space/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Auth context
│   │   ├── services/   # API services
│   │   └── styles/     # Global styles
│   └── vercel.json     # Vercel config
├── server/             # Express backend
│   ├── config/         # Configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth middleware
│   ├── models/         # MongoDB models
│   └── routes/         # API routes
├── .env.example        # Backend env template
├── client/.env.example # Frontend env template
└── server.js           # Main server file
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

See `.env.example` files for details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `cd client && npm run build` | Build for production |

## Features in Detail

### Character Creation
- Full D&D 5e stat blocks (STR, DEX, CON, INT, WIS, CHA)
- Class, race, alignment, and level tracking
- Backstory and personality traits
- Skills and abilities

### Photo Albums
- Drag-and-drop image upload
- Multiple albums per character
- Cloudinary integration for fast loading
- Image optimization

### Music Playlists
- Support for YouTube, Spotify, SoundCloud, Amazon Music
- Compact now-playing widget
- Drag-to-reorder songs
- Auto-play option

### Social Features
- Character walls for posts/comments
- Reply to comments
- Like/react system ready
- Friend system foundation

## Troubleshooting

**Can't connect to MongoDB?**
- Whitelist your IP in MongoDB Atlas
- Check connection string format

**Images not uploading?**
- Verify Cloudinary credentials
- Check file size limits (10MB per file)

**CORS errors?**
- Ensure `CLIENT_URL` matches your frontend URL

See [SETUP.md](./SETUP.md) for more troubleshooting help.

## Contributing

This is a personal project, but feel free to fork and customize for your own campaigns!

## License

MIT License - feel free to use this for your D&D group!

---

**Roll for initiative! 🎲⚔️🐉**

Built with ❤️ for the D&D community
