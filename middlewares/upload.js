const multer = require('multer');
const path = require('path');

// Image storage
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImage = /jpeg|jpg|png|gif|webp/;
    const allowedModel = /glb|gltf/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (allowedImage.test(ext) || allowedModel.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, png, gif, webp) and 3D models (glb, gltf) are allowed.'), false);
    }
};

const upload = multer({
    storage: imageStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: fileFilter
});

module.exports = upload;
