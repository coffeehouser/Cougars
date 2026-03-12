const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['spotify', 'youtube', 'soundcloud', 'amazon-music'],
    required: true
  },
  embedUrl: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: {
    type: String,
    trim: true,
    maxlength: [200, 'Artist name cannot exceed 200 characters']
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const PlaylistSchema = new mongoose.Schema({
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true // One playlist per character
  },
  title: {
    type: String,
    default: 'My Playlist',
    trim: true,
    maxlength: [100, 'Playlist title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  songs: [SongSchema],
  autoPlay: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
PlaylistSchema.index({ character: 1 });

module.exports = mongoose.model('Playlist', PlaylistSchema);
