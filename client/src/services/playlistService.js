import api from './api';

const playlistService = {
  // Get playlist for a character
  getPlaylistByCharacter: async (characterId) => {
    try {
      const response = await api.get(`/playlists/character/${characterId}`);
      return response.data;
    } catch (error) {
      // Return null if playlist doesn't exist (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create or update playlist
  createOrUpdatePlaylist: async (playlistData) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  // Add song to playlist
  addSong: async (playlistId, songData) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, songData);
    return response.data;
  },

  // Remove song from playlist
  removeSong: async (playlistId, songId) => {
    const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
    return response.data;
  },

  // Reorder songs in playlist
  reorderSongs: async (playlistId, songIds) => {
    const response = await api.put(`/playlists/${playlistId}/reorder`, { songIds });
    return response.data;
  },

  // Update song details
  updateSong: async (playlistId, songId, updates) => {
    const response = await api.put(`/playlists/${playlistId}/songs/${songId}`, updates);
    return response.data;
  },

  // Delete playlist
  deletePlaylist: async (playlistId) => {
    const response = await api.delete(`/playlists/${playlistId}`);
    return response.data;
  }
};

export default playlistService;
