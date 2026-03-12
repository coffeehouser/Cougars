require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow any Vercel preview deployments and the main client URL
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://dnd-space-client.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    // Also allow Vercel preview URLs
    if (origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(null, true); // Allow all origins for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting for login/register only (not for /me route)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs for development
  message: 'Too many requests, please try again later'
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/playlists', require('./routes/playlists'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DnD Space API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
