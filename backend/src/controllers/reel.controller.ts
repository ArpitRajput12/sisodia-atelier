import { Request, Response, NextFunction } from 'express';
import { ReelService } from '../services/reel.service';
import { ApiResponse } from '../utils/apiResponse';
import { CreateReelInput } from '../validators/reel.validator';

/**
 * HTTP handlers for atelier documentary reels.
 */
export class ReelController {
  static async getReels(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reels = await ReelService.getAllReels();
      ApiResponse.success(res, reels, 'Atelier documentary reels retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async createReel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateReelInput;
      const reel = await ReelService.createReel(payload);
      ApiResponse.created(res, reel, 'Documentary reel published to SISODIA ATELIER ✧ archive.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteReel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await ReelService.deleteReel(id);
      ApiResponse.success(res, deleted, 'Documentary reel removed from archive.');
    } catch (error) {
      next(error);
    }
  }
}

