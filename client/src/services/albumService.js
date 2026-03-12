import api from './api';

const albumService = {
  // Get all albums for a character
  getCharacterAlbums: async (characterId) => {
    const response = await api.get(`/albums/character/${characterId}`);
    return response.data;
  },

  // Get a single album with its photos
  getAlbum: async (albumId) => {
    const response = await api.get(`/albums/${albumId}`);
    return response.data;
  },

  // Create a new album
  createAlbum: async (albumData) => {
    const response = await api.post('/albums', albumData);
    return response.data;
  },

  // Update an album
  updateAlbum: async (albumId, albumData) => {
    const response = await api.put(`/albums/${albumId}`, albumData);
    return response.data;
  },

  // Delete an album
  deleteAlbum: async (albumId) => {
    const response = await api.delete(`/albums/${albumId}`);
    return response.data;
  }
};

export default albumService;
