import multer from 'multer';
import CustomError from '../utils/customError.js';

// 1. Save image temporarily in memory buffer (stored in req.files)
const multerStorage = multer.memoryStorage();

// 2. File filter - only accept images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new CustomError('Please upload only images', 400), false);
  }
};

// 3. Multer upload instance
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export default upload;
