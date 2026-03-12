const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true,
    index: true
  },
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: [500, 'Caption cannot exceed 500 characters'],
    trim: true
  },
  taggedCharacters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient album photo queries
PhotoSchema.index({ album: 1, order: 1 });
PhotoSchema.index({ character: 1, createdAt: -1 });

module.exports = mongoose.model('Photo', PhotoSchema);
