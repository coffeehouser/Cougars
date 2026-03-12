const { validationResult } = require('express-validator');
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const Character = require('../models/Character');

// @desc    Get all albums for a character
// @route   GET /api/albums/character/:characterId
// @access  Public
exports.getCharacterAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find({ character: req.params.characterId })
      .populate('coverPhoto')
      .sort({ createdAt: -1 });

    // Get photos for each album with tagged characters populated
    for (let album of albums) {
      const photos = await Photo.find({ album: album._id })
        .populate('taggedCharacters', 'name profileImage myspaceUrl')
        .sort({ order: 1, createdAt: 1 });
      album._doc.photos = photos;
    }

    res.json({ albums });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single album with its photos
// @route   GET /api/albums/:id
// @access  Public
exports.getAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('character', 'name profileImage owner');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Get all photos in the album with tagged characters populated
    const photos = await Photo.find({ album: req.params.id })
      .populate('taggedCharacters', 'name profileImage myspaceUrl')
      .sort({ order: 1, createdAt: 1 });

    res.json({ album, photos });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new album
// @route   POST /api/albums
// @access  Private
exports.createAlbum = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { characterId, title, description } = req.body;

    // Verify the character exists and user owns it
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create album for this character' });
    }

    const album = await Album.create({
      character: characterId,
      title,
      description
    });

    res.status(201).json({
      message: 'Album created successfully',
      album
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an album
// @route   PUT /api/albums/:id
// @access  Private (owner only)
exports.updateAlbum = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const album = await Album.findById(req.params.id).populate('character');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Check if user owns the character
    if (album.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this album' });
    }

    const { title, description, coverPhotoId } = req.body;

    if (title) album.title = title;
    if (description !== undefined) album.description = description;
    if (coverPhotoId !== undefined) album.coverPhoto = coverPhotoId || null;

    await album.save();

    res.json({
      message: 'Album updated successfully',
      album
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an album and all its photos
// @route   DELETE /api/albums/:id
// @access  Private (owner only)
exports.deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id).populate('character');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Check if user owns the character
    if (album.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this album' });
    }

    // Delete all photos in the album (including local file cleanup)
    const photos = await Photo.find({ album: album._id });
    const fs = require('fs');
    const path = require('path');

    for (const photo of photos) {
      try {
        const filePath = path.join(__dirname, '../../uploads/photos', photo.cloudinaryId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Failed to delete image file: ${photo.cloudinaryId}`, error);
      }
    }

    await Photo.deleteMany({ album: album._id });
    await album.deleteOne();

    res.json({ message: 'Album and all photos deleted successfully' });
  } catch (error) {
    next(error);
  }
};
