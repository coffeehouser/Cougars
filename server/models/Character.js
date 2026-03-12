const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  race: {
    type: String,
    required: [true, 'Race is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [1, 'Level must be at least 1'],
    max: [20, 'Level cannot exceed 20'],
    default: 1
  },
  stats: {
    strength: {
      type: Number,
      required: [true, 'Strength is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    },
    dexterity: {
      type: Number,
      required: [true, 'Dexterity is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    },
    constitution: {
      type: Number,
      required: [true, 'Constitution is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    },
    intelligence: {
      type: Number,
      required: [true, 'Intelligence is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    },
    wisdom: {
      type: Number,
      required: [true, 'Wisdom is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    },
    charisma: {
      type: Number,
      required: [true, 'Charisma is required'],
      min: [1, 'Stats must be between 1 and 30'],
      max: [30, 'Stats must be between 1 and 30']
    }
  },
  background: {
    type: String,
    trim: true,
    default: ''
  },
  alignment: {
    type: String,
    enum: [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ],
    default: 'True Neutral'
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    default: ''
  },
  profileImage: {
    type: String,
    default: '/default-character.png'
  },
  profileImageCloudinaryId: {
    type: String
  },
  bannerImage: {
    type: String,
    default: '/default-banner.png'
  },
  bannerImageCloudinaryId: {
    type: String
  },
  topFriends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }],
  profileViews: {
    type: Number,
    default: 0
  },
  myspaceUrl: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate MySpace-style URL before saving
CharacterSchema.pre('save', function() {
  if (!this.myspaceUrl) {
    const cleanName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substr(2, 6);
    this.myspaceUrl = `${cleanName}-${randomSuffix}`;
  }
});

// Index for efficient queries
CharacterSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Character', CharacterSchema);
