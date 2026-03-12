const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const { uploadPhoto } = require('../config/fileUpload');
const {
  getCharacterComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies
} = require('../controllers/commentController');

// @desc    Get wall comments for a character with nested replies
// @route   GET /api/comments/character/:characterId
// @access  Public
router.get('/character/:characterId', getCharacterComments);

// @desc    Get replies to a comment
// @route   GET /api/comments/:id/replies
// @access  Public
router.get('/:id/replies', getCommentReplies);

// @desc    Post a comment or reply
// @route   POST /api/comments
// @access  Private
router.post(
  '/',
  protect,
  uploadPhoto.single('photo'),
  [
    body('characterId').notEmpty().withMessage('Character ID is required'),
    body('authorCharacterId').notEmpty().withMessage('Author character ID is required'),
    body('content')
      .trim()
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
  ],
  createComment
);

// @desc    Edit a comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
router.put(
  '/:id',
  protect,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
  ],
  updateComment
);

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author or profile owner)
router.delete('/:id', protect, deleteComment);

module.exports = router;
