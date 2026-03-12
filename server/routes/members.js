const express = require('express');
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');
const { uploadCharacterImage } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', memberController.getAllMembers);
router.get('/slug/:slug', memberController.getMemberBySlug);

// Protected specific routes MUST come before /:id to avoid param collision
router.get('/my/profile', auth, memberController.getMyProfile);

// Public param route
router.get('/:id', memberController.getMemberById);

// Protected routes
router.post('/', auth, memberController.createMember);
router.put('/:id', auth, memberController.updateMember);
router.delete('/:id', auth, memberController.deleteMember);
router.put(
  '/:id/image',
  auth,
  uploadCharacterImage.single('image'),
  memberController.uploadImage
);

module.exports = router;
