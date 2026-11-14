import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const assets = await prisma.siteAsset.findMany();
    const map: Record<string, string> = {};
    for (const a of assets) {
      map[a.key] = a.url;
    }

    res.json({
      success: true,
      data: {
        brand_logo:
          map['brand_logo'] ||
          'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794658373/sisodia-atelier/permanent/brand_logo.jpg',
        atelier_floor_video:
          map['atelier_floor_video'] ||
          'https://res.cloudinary.com/gxhyfmfv/video/upload/v1794658376/sisodia-atelier/permanent/atelier_floor_video.mp4',
        assets,
      },
    });
  } catch (err: any) {
    res.json({
      success: true,
      data: {
        brand_logo:
          'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794658373/sisodia-atelier/permanent/brand_logo.jpg',
        atelier_floor_video:
          'https://res.cloudinary.com/gxhyfmfv/video/upload/v1794658376/sisodia-atelier/permanent/atelier_floor_video.mp4',
        assets: [],
      },
    });
  }
});

export default router;
