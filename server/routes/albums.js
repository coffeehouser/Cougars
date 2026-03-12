const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const {
  getCharacterAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum
} = require('../controllers/albumController');

// @desc    Get all albums for a character
// @route   GET /api/albums/character/:characterId
// @access  Public
router.get('/character/:characterId', getCharacterAlbums);

// @desc    Get a single album with its photos
// @route   GET /api/albums/:id
// @access  Public
router.get('/:id', getAlbum);

// @desc    Create a new album
// @route   POST /api/albums
// @access  Private
router.post(
  '/',
  protect,
  [
    body('characterId').notEmpty().withMessage('Character ID is required'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Album title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  createAlbum
);

// @desc    Update an album
// @route   PUT /api/albums/:id
// @access  Private (owner only)
router.put(
  '/:id',
  protect,
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  updateAlbum
);

// @desc    Delete an album and all its photos
// @route   DELETE /api/albums/:id
// @access  Private (owner only)
router.delete('/:id', protect, deleteAlbum);

module.exports = router;
