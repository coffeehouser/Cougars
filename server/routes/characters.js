const express = require('express');
const characterController = require('../controllers/characterController');
const auth = require('../middleware/auth');
const { uploadCharacterImage } = require('../config/cloudinary');

const router = express.Router();

// Public routes
router.get('/', characterController.getAllCharacters);
router.get('/url/:url', characterController.getCharacterByUrl);
router.get('/:id', characterController.getCharacterById);
router.post('/:id/view', characterController.incrementViewCount);

// Protected routes
router.get('/my/all', auth, characterController.getMyCharacters);
router.post('/', auth, characterController.createCharacter);
router.put('/:id', auth, characterController.updateCharacter);
router.delete('/:id', auth, characterController.deleteCharacter);
router.put(
  '/:id/image',
  auth,
  uploadCharacterImage.single('image'),
  characterController.uploadImage
);

module.exports = router;
