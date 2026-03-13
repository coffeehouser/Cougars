import api from './api';

const memberService = {
  getAllMembers: () =>
    api.get('/members').then(r => r.data),

  getMemberById: (id) =>
    api.get(`/members/${id}`).then(r => r.data),

  getMemberBySlug: (slug) =>
    api.get(`/members/slug/${slug}`).then(r => r.data),

  getMyProfile: () =>
    api.get('/members/my/profile').then(r => r.data),

  createMember: (data) =>
    api.post('/members', data).then(r => r.data),

  updateMember: (id, data) =>
    api.put(`/members/${id}`, data).then(r => r.data),

  deleteMember: (id) =>
    api.delete(`/members/${id}`).then(r => r.data),
};

export default memberService;
