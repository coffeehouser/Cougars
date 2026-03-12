const { validationResult } = require('express-validator');
const Photo = require('../models/Photo');
const Album = require('../models/Album');
const Character = require('../models/Character');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload photos to an album
// @route   POST /api/photos/upload
// @access  Private
exports.uploadPhotos = async (req, res, next) => {
  try {
    const { albumId, captions, taggedCharacters } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Verify the album exists and user owns the character
    const album = await Album.findById(albumId).populate('character');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload to this album' });
    }

    // Get the highest order number in the album
    const lastPhoto = await Photo.findOne({ album: albumId }).sort({ order: -1 });
    let nextOrder = lastPhoto ? lastPhoto.order + 1 : 0;

    // Create photo documents for all uploaded files
    const photos = [];
    const captionsArray = captions ? JSON.parse(captions) : [];
    const taggedCharactersArray = taggedCharacters ? JSON.parse(taggedCharacters) : [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Upload to Cloudinary from memory buffer
      const result = await uploadToCloudinary(file.buffer, 'dnd-space/photos');

      const photo = await Photo.create({
        album: albumId,
        character: album.character._id,
        imageUrl: result.secure_url, // Cloudinary URL
        cloudinaryId: result.public_id, // Cloudinary public_id for deletion
        caption: captionsArray[i] || '',
        taggedCharacters: taggedCharactersArray[i] || [],
        order: nextOrder++
      });
      photos.push(photo);
    }

    // Update album photo count
    album.photoCount += photos.length;

    // Set first uploaded photo as cover if album doesn't have one
    if (!album.coverPhoto && photos.length > 0) {
      album.coverPhoto = photos[0]._id;
    }

    await album.save();

    res.status(201).json({
      message: `${photos.length} photo(s) uploaded successfully`,
      photos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a photo (caption, tags)
// @route   PUT /api/photos/:id
// @access  Private (owner only)
exports.updatePhoto = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const photo = await Photo.findById(req.params.id).populate({
      path: 'character',
      select: 'owner'
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user owns the character
    if (photo.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this photo' });
    }

    const { caption, taggedCharacters } = req.body;

    if (caption !== undefined) photo.caption = caption;
    if (taggedCharacters !== undefined) photo.taggedCharacters = taggedCharacters;

    await photo.save();

    res.json({
      message: 'Photo updated successfully',
      photo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private (owner only)
exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id).populate({
      path: 'character',
      select: 'owner'
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user owns the character
    if (photo.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this photo' });
    }

    // Delete from Cloudinary
    const { cloudinary } = require('../config/cloudinary');
    try {
      await cloudinary.uploader.destroy(photo.cloudinaryId);
    } catch (error) {
      console.error(`Failed to delete image from Cloudinary: ${photo.cloudinaryId}`, error);
    }

    // Update album photo count and cover photo if needed
    const album = await Album.findById(photo.album);
    if (album) {
      album.photoCount = Math.max(0, album.photoCount - 1);

      // If this was the cover photo, remove it
      if (album.coverPhoto && album.coverPhoto.toString() === photo._id.toString()) {
        // Find another photo to use as cover
        const newCover = await Photo.findOne({
          album: album._id,
          _id: { $ne: photo._id }
        }).sort({ order: 1 });
        album.coverPhoto = newCover ? newCover._id : null;
      }

      await album.save();
    }

    await photo.deleteOne();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder photos in an album
// @route   PUT /api/photos/reorder
// @access  Private (owner only)
exports.reorderPhotos = async (req, res, next) => {
  try {
    const { albumId, photoIds } = req.body;

    if (!Array.isArray(photoIds)) {
      return res.status(400).json({ message: 'photoIds must be an array' });
    }

    // Verify album ownership
    const album = await Album.findById(albumId).populate('character');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reorder photos in this album' });
    }

    // Update order for each photo
    const updatePromises = photoIds.map((photoId, index) =>
      Photo.findByIdAndUpdate(photoId, { order: index })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Photos reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a photo
// @route   POST /api/photos/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const { characterId } = req.body;

    if (!characterId) {
      return res.status(400).json({ message: 'Character ID is required' });
    }

    // Verify the user owns this character
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to like as this character' });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if character already liked this photo
    const likeIndex = photo.likes.findIndex(
      id => id.toString() === characterId
    );

    let liked = false;
    if (likeIndex > -1) {
      // Unlike: remove from likes array
      photo.likes.splice(likeIndex, 1);
      photo.likeCount = Math.max(0, photo.likeCount - 1);
    } else {
      // Like: add to likes array
      photo.likes.push(characterId);
      photo.likeCount += 1;
      liked = true;
    }

    await photo.save();

    res.json({
      message: liked ? 'Photo liked' : 'Photo unliked',
      liked,
      likeCount: photo.likeCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get photo likes with character details
// @route   GET /api/photos/:id/likes
// @access  Public
exports.getPhotoLikes = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id)
      .populate('likes', 'name profileImage myspaceUrl');

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.json({
      likes: photo.likes,
      likeCount: photo.likeCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a photo
// @route   POST /api/photos/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { characterId, content } = req.body;

    if (!characterId || !content) {
      return res.status(400).json({ message: 'Character ID and content are required' });
    }

    // Verify the user owns this character
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to comment as this character' });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Add comment to photo
    photo.comments.push({
      author: characterId,
      content: content.trim()
    });

    await photo.save();

    // Populate the newly added comment
    await photo.populate({
      path: 'comments.author',
      select: 'name profileImage myspaceUrl'
    });

    // Get the last comment (the one we just added)
    const newComment = photo.comments[photo.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment from a photo
// @route   DELETE /api/photos/:id/comments/:commentId
// @access  Private (comment author or photo owner)
exports.deleteComment = async (req, res, next) => {
  try {
    const { id: photoId, commentId } = req.params;

    const photo = await Photo.findById(photoId).populate({
      path: 'character',
      select: 'owner'
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Find the comment
    const comment = photo.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the commenting character or the photo's character
    const commentAuthor = await Character.findById(comment.author);
    const isCommentAuthor = commentAuthor && commentAuthor.owner.toString() === req.user._id.toString();
    const isPhotoOwner = photo.character.owner.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPhotoOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    comment.deleteOne();
    await photo.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update photo caption
// @route   PUT /api/photos/:id/caption
// @access  Private (owner only)
exports.updateCaption = async (req, res, next) => {
  try {
    const { caption } = req.body;

    const photo = await Photo.findById(req.params.id).populate({
      path: 'character',
      select: 'owner'
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user owns the character
    if (photo.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this photo' });
    }

    photo.caption = caption || '';
    await photo.save();

    res.json({
      message: 'Caption updated successfully',
      caption: photo.caption
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove character tag from photo
// @route   DELETE /api/photos/:id/tags/:characterId
// @access  Private (owner only)
exports.removeTag = async (req, res, next) => {
  try {
    const { id: photoId, characterId } = req.params;

    const photo = await Photo.findById(photoId).populate({
      path: 'character',
      select: 'owner'
    });

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Check if user owns the character
    if (photo.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this photo' });
    }

    // Remove the tag
    photo.taggedCharacters = photo.taggedCharacters.filter(
      id => id.toString() !== characterId
    );

    await photo.save();

    res.json({
      message: 'Tag removed successfully',
      taggedCharacters: photo.taggedCharacters
    });
  } catch (error) {
    next(error);
  }
};
