const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Album title is required'],
    maxlength: [100, 'Album title cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  coverPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    default: null
  },
  photoCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient character album queries
AlbumSchema.index({ character: 1, createdAt: -1 });

module.exports = mongoose.model('Album', AlbumSchema);
