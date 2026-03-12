/** @format */

const multer = require("multer");

// Use memory storage instead of disk storage for Cloudinary
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	if (allowedTypes.test(file.mimetype)) {
		return cb(null, true);
	}
	cb(new Error("Only image files are allowed!"));
};

const uploadCharacterImage = multer({ storage, fileFilter: imageFilter });
const uploadPhoto = multer({ storage, fileFilter: imageFilter });

module.exports = { uploadCharacterImage, uploadPhoto };
