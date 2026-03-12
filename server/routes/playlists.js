const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const protect = require('../middleware/auth');
const {
  getPlaylistByCharacter,
  createOrUpdatePlaylist,
  addSong,
  removeSong,
  reorderSongs,
  updateSong,
  deletePlaylist
} = require('../controllers/playlistController');

// @desc    Get playlist for a character
// @route   GET /api/playlists/character/:characterId
// @access  Public
router.get('/character/:characterId', getPlaylistByCharacter);

// @desc    Create or update playlist
// @route   POST /api/playlists
// @access  Private (owner only)
router.post(
  '/',
  protect,
  [
    body('characterId')
      .notEmpty()
      .withMessage('Character ID is required'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ],
  createOrUpdatePlaylist
);

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private (owner only)
router.post(
  '/:id/songs',
  protect,
  [
    body('platform')
      .notEmpty()
      .withMessage('Platform is required')
      .isIn(['spotify', 'youtube', 'soundcloud', 'amazon-music'])
      .withMessage('Invalid platform'),
    body('url')
      .notEmpty()
      .withMessage('URL is required')
      .isURL()
      .withMessage('Invalid URL format'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('artist')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Artist name cannot exceed 200 characters')
  ],
  addSong
);

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private (owner only)
router.delete('/:id/songs/:songId', protect, removeSong);

// @desc    Reorder songs in playlist
// @route   PUT /api/playlists/:id/reorder
// @access  Private (owner only)
router.put('/:id/reorder', protect, reorderSongs);

// @desc    Update song details
// @route   PUT /api/playlists/:id/songs/:songId
// @access  Private (owner only)
router.put(
  '/:id/songs/:songId',
  protect,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('artist')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Artist name cannot exceed 200 characters')
  ],
  updateSong
);

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private (owner only)
router.delete('/:id', protect, deletePlaylist);

module.exports = router;
