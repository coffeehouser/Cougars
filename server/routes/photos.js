const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const { uploadPhoto } = require('../config/cloudinary');
const {
  uploadPhotos,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
  toggleLike,
  getPhotoLikes,
  addComment,
  deleteComment,
  updateCaption,
  removeTag
} = require('../controllers/photoController');

// @desc    Upload photos to an album (supports multiple files)
// @route   POST /api/photos/upload
// @access  Private
router.post(
  '/upload',
  protect,
  uploadPhoto.array('photos', 20), // Allow up to 20 photos at once
  uploadPhotos
);

// @desc    Update a photo (caption, tags)
// @route   PUT /api/photos/:id
// @access  Private (owner only)
router.put(
  '/:id',
  protect,
  [
    body('caption')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Caption cannot exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  updatePhoto
);

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private (owner only)
router.delete('/:id', protect, deletePhoto);

// @desc    Reorder photos in an album
// @route   PUT /api/photos/reorder
// @access  Private (owner only)
router.put('/reorder', protect, reorderPhotos);

// @desc    Like/unlike a photo
// @route   POST /api/photos/:id/like
// @access  Private
router.post('/:id/like', protect, toggleLike);

// @desc    Get photo likes with character details
// @route   GET /api/photos/:id/likes
// @access  Public
router.get('/:id/likes', getPhotoLikes);

// @desc    Add comment to a photo
// @route   POST /api/photos/:id/comments
// @access  Private
router.post(
  '/:id/comments',
  protect,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
  ],
  addComment
);

// @desc    Delete comment from a photo
// @route   DELETE /api/photos/:id/comments/:commentId
// @access  Private (comment author or photo owner)
router.delete('/:id/comments/:commentId', protect, deleteComment);

// @desc    Update photo caption
// @route   PUT /api/photos/:id/caption
// @access  Private (owner only)
router.put(
  '/:id/caption',
  protect,
  [
    body('caption')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Caption cannot exceed 500 characters')
  ],
  updateCaption
);

// @desc    Remove character tag from photo
// @route   DELETE /api/photos/:id/tags/:characterId
// @access  Private (owner only)
router.delete('/:id/tags/:characterId', protect, removeTag);

module.exports = router;
