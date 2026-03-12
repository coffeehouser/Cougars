import api from './api';

const photoService = {
  // Upload photos to an album (supports multiple files)
  uploadPhotos: async (albumId, files, captions = [], taggedCharacters = []) => {
    const formData = new FormData();
    formData.append('albumId', albumId);
    formData.append('captions', JSON.stringify(captions));
    formData.append('taggedCharacters', JSON.stringify(taggedCharacters));

    // Append all files
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  // Update a photo
  updatePhoto: async (photoId, photoData) => {
    const response = await api.put(`/photos/${photoId}`, photoData);
    return response.data;
  },

  // Delete a photo
  deletePhoto: async (photoId) => {
    const response = await api.delete(`/photos/${photoId}`);
    return response.data;
  },

  // Reorder photos in an album
  reorderPhotos: async (albumId, photoIds) => {
    const response = await api.put('/photos/reorder', { albumId, photoIds });
    return response.data;
  },

  // Like/unlike a photo
  toggleLike: async (photoId, characterId) => {
    const response = await api.post(`/photos/${photoId}/like`, { characterId });
    return response.data;
  },

  // Get photo likes
  getPhotoLikes: async (photoId) => {
    const response = await api.get(`/photos/${photoId}/likes`);
    return response.data;
  },

  // Add comment to a photo
  addComment: async (photoId, characterId, content) => {
    const response = await api.post(`/photos/${photoId}/comments`, {
      characterId,
      content
    });
    return response.data;
  },

  // Delete comment from a photo
  deleteComment: async (photoId, commentId) => {
    const response = await api.delete(`/photos/${photoId}/comments/${commentId}`);
    return response.data;
  },

  // Update photo caption
  updateCaption: async (photoId, caption) => {
    const response = await api.put(`/photos/${photoId}/caption`, { caption });
    return response.data;
  },

  // Remove character tag from photo
  removeTag: async (photoId, characterId) => {
    const response = await api.delete(`/photos/${photoId}/tags/${characterId}`);
    return response.data;
  }
};

export default photoService;
