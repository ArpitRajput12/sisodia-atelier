import { Reel } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { CreateReelInput } from '../validators/reel.validator';
import { CloudinaryService } from './cloudinary.service';

/**
 * Service managing Nagina Atelier documentary & craft storytelling reels.
 */
export class ReelService {
  static async getAllReels(): Promise<Reel[]> {
    return prisma.reel.findMany({
      take: 100,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  static async createReel(input: CreateReelInput): Promise<Reel> {
    const resolvedThumbnail =
      input.thumbnailUrl && input.thumbnailUrl.trim().length > 0
        ? input.thumbnailUrl.trim()
        : CloudinaryService.deriveVideoThumbnail(input.videoUrl);

    const reel = await prisma.reel.create({
      data: {
        episodeNumber: input.episodeNumber.trim(),
        title: input.title.trim(),
        duration: input.duration.trim(),
        description: input.description.trim(),
        videoUrl: input.videoUrl.trim(),
        thumbnailUrl: resolvedThumbnail,
      },
    });

    logger.info(`Published documentary reel [${reel.episodeNumber}] "${reel.title}" (${reel.id})`);
    return reel;
  }

  static async deleteReel(id: string): Promise<Reel> {
    const existing = await prisma.reel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Documentary reel "${id}" was not found.`);
    }

    const deleted = await prisma.reel.delete({ where: { id } });
    logger.info(`Deleted documentary reel [${deleted.episodeNumber}] (${deleted.id})`);
    return deleted;
  }
}

