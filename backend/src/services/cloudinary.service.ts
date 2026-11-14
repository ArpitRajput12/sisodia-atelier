import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export interface UploadedMediaResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl: string;
}

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_cloud_name',
  'your_api_key',
  'your_api_secret',
  'changeme',
]);

/**
 * Service wrapping Cloudinary v2 streaming uploads for atelier photos & documentary reels.
 */
export class CloudinaryService {
  private static configured = false;

  static isConfigured(): boolean {
    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim() || '';
    const apiKey = env.CLOUDINARY_API_KEY?.trim() || '';
    const apiSecret = env.CLOUDINARY_API_SECRET?.trim() || '';

    return (
      !PLACEHOLDER_VALUES.has(cloudName) &&
      !PLACEHOLDER_VALUES.has(apiKey) &&
      !PLACEHOLDER_VALUES.has(apiSecret)
    );
  }

  private static ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new ApiError(
        503,
        'Cloudinary media credentials are not configured in server environment (.env). Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
      );
    }

    if (!this.configured) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME!.trim(),
        api_key: env.CLOUDINARY_API_KEY!.trim(),
        api_secret: env.CLOUDINARY_API_SECRET!.trim(),
        secure: true,
      });
      this.configured = true;
    }
  }

  /**
   * Convert a Cloudinary video URL (.mp4/.mov/.webm) to an auto-generated .jpg thumbnail URL.
   */
  static deriveVideoThumbnail(videoUrl: string): string {
    if (!videoUrl) return '';
    if (/\.(mp4|mov|webm|mkv)(\?.*)?$/i.test(videoUrl)) {
      return videoUrl.replace(/\.(mp4|mov|webm|mkv)(\?.*)?$/i, '.jpg$2');
    }
    return videoUrl;
  }

  /**
   * Stream an in-memory Multer file buffer directly into Cloudinary folder `sisodia-atelier/`.
   */
  static async uploadMediaBuffer(file: Express.Multer.File): Promise<UploadedMediaResult> {
    this.ensureConfigured();

    const isVideo = file.mimetype.startsWith('video/');
    const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'sisodia-atelier',
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error('Cloudinary stream upload failed:', error);
            reject(
              new ApiError(
                502,
                error?.message || 'Cloudinary media upload failed while streaming buffer.'
              )
            );
            return;
          }
          resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });

    const secureUrl = uploadResult.secure_url || uploadResult.url;
    const thumbnailUrl = isVideo ? this.deriveVideoThumbnail(secureUrl) : secureUrl;

    logger.info(
      `Uploaded ${resourceType} to Cloudinary [${uploadResult.public_id}] (${uploadResult.bytes} bytes)`
    );

    return {
      url: secureUrl,
      secureUrl,
      publicId: uploadResult.public_id,
      resourceType,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: typeof uploadResult.duration === 'number' ? uploadResult.duration : undefined,
      ...(isVideo ? { videoUrl: secureUrl, thumbnailUrl } : { imageUrl: secureUrl, thumbnailUrl }),
    };
  }
}

