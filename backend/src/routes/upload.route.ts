import express from 'express';
import { upload } from '../config/cloudinary';
import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Multer-storage-cloudinary attaches the path to req.file.path
    res.status(200).json({ 
      success: true, 
      imageUrl: req.file.path 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
