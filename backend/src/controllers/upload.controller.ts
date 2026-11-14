import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '../services/cloudinary.service';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError } from '../utils/apiError';

type MultiFieldFiles = {
  file?: Express.Multer.File[];
  media?: Express.Multer.File[];
};

/**
 * HTTP handlers for media uploads via Multer + Cloudinary.
 */
export class UploadController {
  static async uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const multiFiles = req.files as MultiFieldFiles | undefined;
      const uploadedFile =
        req.file || multiFiles?.file?.[0] || multiFiles?.media?.[0];

      if (!uploadedFile) {
        throw new BadRequestError(
          'No media file uploaded. Attach an image or video under form-data field "file" or "media".'
        );
      }

      const result = await CloudinaryService.uploadMediaBuffer(uploadedFile);

      ApiResponse.created(
        res,
        result,
        `${result.resourceType === 'video' ? 'Video reel' : 'Image'} uploaded successfully to Cloudinary.`
      );
    } catch (error) {
      next(error);
    }
  }
}

