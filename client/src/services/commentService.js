import api from './api';

const commentService = {
  // Get all comments for a character's wall (with nested replies)
  getCharacterComments: async (characterId) => {
    const response = await api.get(`/comments/character/${characterId}`);
    return response.data;
  },

  // Create a new comment or reply
  createComment: async (commentData) => {
    const formData = new FormData();
    formData.append('characterId', commentData.characterId);
    formData.append('authorCharacterId', commentData.authorCharacterId);

    if (commentData.content) {
      formData.append('content', commentData.content);
    }

    if (commentData.parentCommentId) {
      formData.append('parentCommentId', commentData.parentCommentId);
    }

    if (commentData.photo) {
      formData.append('photo', commentData.photo);
    }

    const response = await api.post('/comments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Get replies to a specific comment
  getCommentReplies: async (commentId) => {
    const response = await api.get(`/comments/${commentId}/replies`);
    return response.data;
  }
};

export default commentService;
