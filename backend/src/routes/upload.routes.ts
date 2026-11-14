import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticateOwner } from '../middlewares/authenticate';
import { BadRequestError } from '../utils/apiError';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB ceiling for 4K documentary reels & high-res stills
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      cb(null, true);
      return;
    }
    cb(
      new BadRequestError(
        `Unsupported media format "${file.mimetype}". Allowed formats: jpg, jpeg, png, webp, mp4, mov, webm.`
      )
    );
  },
});

const router = Router();

const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'media', maxCount: 1 },
]);

// Owner-protected Cloudinary media upload endpoint (supports /upload and /upload/media)
router.post('/', authenticateOwner, uploadFields, UploadController.uploadMedia);
router.post('/media', authenticateOwner, uploadFields, UploadController.uploadMedia);

export default router;

