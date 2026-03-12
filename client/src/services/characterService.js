import api from './api';

const characterService = {
  getAllCharacters: async () => {
    const response = await api.get('/characters');
    return response.data;
  },

  getCharacterById: async (id) => {
    const response = await api.get(`/characters/${id}`);
    return response.data;
  },

  getCharacterByUrl: async (url) => {
    const response = await api.get(`/characters/url/${url}`);
    return response.data;
  },

  getMyCharacters: async () => {
    const response = await api.get('/characters/my/all');
    return response.data;
  },

  createCharacter: async (characterData) => {
    const response = await api.post('/characters', characterData);
    return response.data;
  },

  updateCharacter: async (id, characterData) => {
    const response = await api.put(`/characters/${id}`, characterData);
    return response.data;
  },

  deleteCharacter: async (id) => {
    const response = await api.delete(`/characters/${id}`);
    return response.data;
  },

  uploadImage: async (id, imageFile, imageType) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('imageType', imageType); // 'profile' or 'banner'

    const response = await api.put(`/characters/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  incrementViewCount: async (id) => {
    const response = await api.post(`/characters/${id}/view`);
    return response.data;
  }
};

export default characterService;
