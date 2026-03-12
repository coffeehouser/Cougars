const Member = require('../models/Member');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all members
// @route   GET /api/members
// @access  Public
exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.find()
      .populate('owner', 'username')
      .sort({ createdAt: -1 });

    res.json({ members });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Public
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('owner', 'username email');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member by slug
// @route   GET /api/members/slug/:slug
// @access  Public
exports.getMemberBySlug = async (req, res, next) => {
  try {
    const member = await Member.findOne({ profileSlug: req.params.slug })
      .populate('owner', 'username email');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the authenticated user's own member profile
// @route   GET /api/members/my/profile
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const member = await Member.findOne({ owner: req.user._id });
    res.json({ member: member || null });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new member profile
// @route   POST /api/members
// @access  Private
exports.createMember = async (req, res, next) => {
  try {
    // Only allow one profile per user
    const existing = await Member.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a profile. Edit it instead.' });
    }

    const memberData = {
      ...req.body,
      owner: req.user._id
    };

    // Ensure osiLayers is an array of numbers
    if (memberData.osiLayers && !Array.isArray(memberData.osiLayers)) {
      memberData.osiLayers = [Number(memberData.osiLayers)];
    } else if (memberData.osiLayers) {
      memberData.osiLayers = memberData.osiLayers.map(Number);
    }

    const member = await Member.create(memberData);

    res.status(201).json({
      message: 'Profile created successfully',
      member
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member profile
// @route   PUT /api/members/:id
// @access  Private (owner only)
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const allowedUpdates = [
      'name', 'major', 'semester', 'role',
      'osiLayers', 'osiDescription', 'bio', 'linkedinUrl'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        member[field] = req.body[field];
      }
    });

    // Ensure osiLayers is an array of numbers
    if (member.osiLayers) {
      member.osiLayers = member.osiLayers.map(Number);
    }

    await member.save();

    res.json({
      message: 'Profile updated successfully',
      member
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member profile
// @route   DELETE /api/members/:id
// @access  Private (owner only)
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this profile' });
    }

    // Delete profile image from Cloudinary if it exists
    if (member.profileImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(member.profileImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete profile image from Cloudinary: ${member.profileImageCloudinaryId}`, error);
      }
    }

    await member.deleteOne();

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting member profile:', error);
    next(error);
  }
};

// @desc    Upload profile image
// @route   PUT /api/members/:id/image
// @access  Private (owner only)
exports.uploadImage = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Delete old profile image from Cloudinary if it exists
    if (member.profileImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(member.profileImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete old profile image from Cloudinary: ${member.profileImageCloudinaryId}`, error);
      }
    }

    const uploadOptions = {
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    };
    const result = await uploadToCloudinary(req.file.buffer, 'cyber-cougars/members', uploadOptions);

    member.profileImage = result.secure_url;
    member.profileImageCloudinaryId = result.public_id;

    await member.save();

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    next(error);
  }
};
