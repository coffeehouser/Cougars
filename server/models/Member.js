const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters']
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    enum: [
      'IT - Networking',
      'IT - Cybersecurity',
      'IT - Software Development',
      'IT - General',
      'Other'
    ]
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: [
      '1st Semester',
      '2nd Semester',
      '3rd Semester',
      '4th Semester',
      'Graduate'
    ]
  },
  role: {
    type: String,
    required: [true, 'Project role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  osiLayers: {
    type: [Number],
    validate: {
      validator: (arr) => arr.every(n => n >= 1 && n <= 7),
      message: 'OSI layers must be numbers between 1 and 7'
    },
    default: []
  },
  osiDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'OSI description cannot exceed 500 characters'],
    default: ''
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },
  linkedinUrl: {
    type: String,
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: '/images/headshots/default.jpg'
  },
  profileSlug: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

// Auto-generate profileSlug before saving
MemberSchema.pre('save', function () {
  if (!this.profileSlug) {
    const cleanName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    this.profileSlug = `${cleanName}-${randomSuffix}`;
  }
});

MemberSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Member', MemberSchema);
