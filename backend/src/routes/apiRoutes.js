import { Router } from 'express';
import multer from 'multer';
import {
  handleHealthCheck,
  handleGetNecklaces,
  handleRecommend,
} from '../controllers/recommendationController.js';

const router = Router();

// Configure Multer for in-memory image upload handling with size limits (10 MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

// API Routes
router.get('/health', handleHealthCheck);
router.get('/necklaces', handleGetNecklaces);
router.post('/recommend', upload.single('file'), handleRecommend);

export default router;
