const { validationResult } = require('express-validator');
const Playlist = require('../models/Playlist');
const Character = require('../models/Character');

// Helper function to validate and convert embed URLs
const validateEmbedUrl = (platform, url) => {
  let embedUrl = url.trim();

  switch (platform) {
    case 'spotify':
      // Spotify: Convert track/album/playlist URLs to embed format
      // https://open.spotify.com/track/ID -> https://open.spotify.com/embed/track/ID
      const spotifyMatch = embedUrl.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
      if (spotifyMatch) {
        embedUrl = `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
      } else if (!embedUrl.includes('/embed/')) {
        throw new Error('Invalid Spotify URL format');
      }
      break;

    case 'youtube':
      // YouTube: Convert watch URLs to embed format
      // https://www.youtube.com/watch?v=ID -> https://www.youtube.com/embed/ID
      // https://youtu.be/ID -> https://www.youtube.com/embed/ID
      let youtubeId = null;
      if (embedUrl.includes('youtube.com/watch')) {
        const urlParams = new URL(embedUrl).searchParams;
        youtubeId = urlParams.get('v');
      } else if (embedUrl.includes('youtu.be/')) {
        youtubeId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (embedUrl.includes('youtube.com/embed/')) {
        youtubeId = embedUrl.split('/embed/')[1]?.split('?')[0];
      }

      if (youtubeId) {
        embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
      } else {
        throw new Error('Invalid YouTube URL format');
      }
      break;

    case 'soundcloud':
      // SoundCloud: Must use their embed format
      // Users should get the embed code from SoundCloud's share button
      if (!embedUrl.includes('soundcloud.com') || !embedUrl.includes('/tracks/')) {
        throw new Error('Invalid SoundCloud URL. Please use the embed URL from SoundCloud\'s share button');
      }
      break;

    case 'amazon-music':
      // Amazon Music: Use their embed format
      if (!embedUrl.includes('music.amazon.com/embed/')) {
        throw new Error('Invalid Amazon Music URL. Please use the embed URL from Amazon Music\'s share button');
      }
      break;

    default:
      throw new Error('Unsupported platform');
  }

  return embedUrl;
};

// @desc    Get playlist for a character
// @route   GET /api/playlists/character/:characterId
// @access  Public
exports.getPlaylistByCharacter = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({ character: req.params.characterId })
      .populate('character', 'name myspaceUrl');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({ playlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update playlist
// @route   POST /api/playlists
// @access  Private (owner only)
exports.createOrUpdatePlaylist = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { characterId, title, description, autoPlay, isPublic } = req.body;

    // Verify user owns the character
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    if (character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create playlist for this character' });
    }

    // Check if playlist already exists
    let playlist = await Playlist.findOne({ character: characterId });

    if (playlist) {
      // Update existing playlist
      playlist.title = title || playlist.title;
      playlist.description = description !== undefined ? description : playlist.description;
      playlist.autoPlay = autoPlay !== undefined ? autoPlay : playlist.autoPlay;
      playlist.isPublic = isPublic !== undefined ? isPublic : playlist.isPublic;
      await playlist.save();
    } else {
      // Create new playlist
      playlist = await Playlist.create({
        character: characterId,
        title: title || `${character.name}'s Playlist`,
        description,
        autoPlay: autoPlay || false,
        isPublic: isPublic !== undefined ? isPublic : true,
        songs: []
      });
    }

    await playlist.populate('character', 'name myspaceUrl');

    res.status(playlist.isNew ? 201 : 200).json({
      message: playlist.isNew ? 'Playlist created successfully' : 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private (owner only)
exports.addSong = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { platform, url, title, artist } = req.body;

    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'character',
      select: 'owner name'
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add songs to this playlist' });
    }

    // Validate and convert embed URL
    let embedUrl;
    try {
      embedUrl = validateEmbedUrl(platform, url);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Get the highest order number
    const maxOrder = playlist.songs.length > 0
      ? Math.max(...playlist.songs.map(s => s.order))
      : -1;

    // Add song to playlist
    playlist.songs.push({
      platform,
      embedUrl,
      title,
      artist,
      order: maxOrder + 1
    });

    await playlist.save();

    res.status(201).json({
      message: 'Song added to playlist',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private (owner only)
exports.removeSong = async (req, res, next) => {
  try {
    const { id: playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId).populate({
      path: 'character',
      select: 'owner'
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove songs from this playlist' });
    }

    // Find and remove the song
    const song = playlist.songs.id(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found in playlist' });
    }

    song.deleteOne();
    await playlist.save();

    res.json({
      message: 'Song removed from playlist',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder songs in playlist
// @route   PUT /api/playlists/:id/reorder
// @access  Private (owner only)
exports.reorderSongs = async (req, res, next) => {
  try {
    const { songIds } = req.body;

    if (!Array.isArray(songIds)) {
      return res.status(400).json({ message: 'songIds must be an array' });
    }

    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'character',
      select: 'owner'
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reorder songs in this playlist' });
    }

    // Update order for each song
    songIds.forEach((songId, index) => {
      const song = playlist.songs.id(songId);
      if (song) {
        song.order = index;
      }
    });

    // Sort songs by order
    playlist.songs.sort((a, b) => a.order - b.order);

    await playlist.save();

    res.json({
      message: 'Songs reordered successfully',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update song details
// @route   PUT /api/playlists/:id/songs/:songId
// @access  Private (owner only)
exports.updateSong = async (req, res, next) => {
  try {
    const { id: playlistId, songId } = req.params;
    const { title, artist } = req.body;

    const playlist = await Playlist.findById(playlistId).populate({
      path: 'character',
      select: 'owner'
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update songs in this playlist' });
    }

    // Find and update the song
    const song = playlist.songs.id(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found in playlist' });
    }

    if (title !== undefined) song.title = title;
    if (artist !== undefined) song.artist = artist;

    await playlist.save();

    res.json({
      message: 'Song updated successfully',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private (owner only)
exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'character',
      select: 'owner'
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.character.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await playlist.deleteOne();

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
