const Character = require('../models/Character');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all characters (campaign directory)
// @route   GET /api/characters
// @access  Public
exports.getAllCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find()
      .populate('owner', 'username')
      .sort({ createdAt: -1 });

    res.json({ characters });
  } catch (error) {
    next(error);
  }
};

// @desc    Get character by ID
// @route   GET /api/characters/:id
// @access  Public
exports.getCharacterById = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('topFriends', 'name profileImage myspaceUrl');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ character });
  } catch (error) {
    next(error);
  }
};

// @desc    Get character by MySpace URL
// @route   GET /api/characters/url/:url
// @access  Public
exports.getCharacterByUrl = async (req, res, next) => {
  try {
    const character = await Character.findOne({ myspaceUrl: req.params.url })
      .populate('owner', 'username email')
      .populate('topFriends', 'name profileImage myspaceUrl');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ character });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new character
// @route   POST /api/characters
// @access  Private
exports.createCharacter = async (req, res, next) => {
  try {
    const characterData = {
      ...req.body,
      owner: req.user._id
    };

    const character = await Character.create(characterData);

    // Auto-create a photo album for this character
    const Album = require('../models/Album');
    await Album.create({
      character: character._id,
      title: `${character.name}'s Photos`,
      description: 'Character photo album'
    });

    res.status(201).json({
      message: 'Character created successfully',
      character
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update character
// @route   PUT /api/characters/:id
// @access  Private (owner only)
exports.updateCharacter = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check ownership
    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'race', 'class', 'level', 'stats', 'background',
      'alignment', 'bio', 'topFriends'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        character[field] = req.body[field];
      }
    });

    await character.save();

    res.json({
      message: 'Character updated successfully',
      character
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete character
// @route   DELETE /api/characters/:id
// @access  Private (owner only)
exports.deleteCharacter = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check ownership
    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this character' });
    }

    // Delete character images from Cloudinary if they exist
    if (character.profileImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(character.profileImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete profile image from Cloudinary: ${character.profileImageCloudinaryId}`, error);
      }
    }
    if (character.bannerImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(character.bannerImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete banner image from Cloudinary: ${character.bannerImageCloudinaryId}`, error);
      }
    }

    // Delete all albums and photos associated with this character
    const Album = require('../models/Album');
    const Photo = require('../models/Photo');
    const albums = await Album.find({ character: character._id });

    for (const album of albums) {
      // Delete all photos in the album
      const photos = await Photo.find({ album: album._id });
      for (const photo of photos) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryId);
        } catch (error) {
          console.error(`Failed to delete photo from Cloudinary: ${photo.cloudinaryId}`, error);
        }
      }
      await Photo.deleteMany({ album: album._id });
      await album.deleteOne();
    }

    // Delete all comments by this character
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ author: character._id });

    // Delete all comments on this character's wall
    await Comment.deleteMany({ character: character._id });

    // Finally, delete the character
    await character.deleteOne();

    res.json({ message: 'Character and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    next(error);
  }
};

// @desc    Increment profile view counter
// @route   POST /api/characters/:id/view
// @access  Public
exports.incrementViewCount = async (req, res, next) => {
  try {
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      { $inc: { profileViews: 1 } },
      { new: true }
    );

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ views: character.profileViews });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile or banner image
// @route   PUT /api/characters/:id/image
// @access  Private (owner only)
exports.uploadImage = async (req, res, next) => {
  try {
    console.log('Upload image request:', {
      characterId: req.params.id,
      imageType: req.body.imageType,
      hasFile: !!req.file,
      filename: req.file?.filename
    });

    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check ownership
    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageType = req.body.imageType || 'profile'; // 'profile' or 'banner'

    // Delete old image from Cloudinary if exists
    if (imageType === 'profile' && character.profileImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(character.profileImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete old profile image from Cloudinary: ${character.profileImageCloudinaryId}`, error);
      }
    } else if (imageType === 'banner' && character.bannerImageCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(character.bannerImageCloudinaryId);
      } catch (error) {
        console.error(`Failed to delete old banner image from Cloudinary: ${character.bannerImageCloudinaryId}`, error);
      }
    }

    // Upload to Cloudinary from memory buffer
    const uploadOptions = imageType === 'profile'
      ? { transformation: [{ width: 800, height: 800, crop: 'limit' }] }
      : {};
    const result = await uploadToCloudinary(req.file.buffer, 'dnd-space/characters', uploadOptions);

    if (imageType === 'profile') {
      character.profileImage = result.secure_url;
      character.profileImageCloudinaryId = result.public_id;
    } else {
      character.bannerImage = result.secure_url;
      character.bannerImageCloudinaryId = result.public_id;
    }

    await character.save();

    console.log('Image uploaded successfully:', result.secure_url);

    res.json({
      message: `${imageType} image uploaded successfully`,
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    next(error);
  }
};

// @desc    Get user's characters
// @route   GET /api/characters/my/all
// @access  Private
exports.getMyCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ characters });
  } catch (error) {
    next(error);
  }
};
