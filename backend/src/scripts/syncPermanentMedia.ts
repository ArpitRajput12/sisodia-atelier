import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load backend .env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../config/prisma';

async function syncPermanentMedia() {
  console.log('✧ [SISODIA ATELIER] Syncing permanent media to Cloudinary and Neon DB...');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing in backend/.env');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const rootDir = path.resolve(__dirname, '../../../');
  const logoPath = path.resolve(rootDir, 'frontend/public/logo.jpeg');
  const videoPath = path.resolve(rootDir, 'frontend/public/videos/atelier-lathe.mp4');

  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found at ${logoPath}`);
  }
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at ${videoPath}`);
  }

  console.log('1. Uploading brand logo to Cloudinary (sisodia-atelier/permanent/brand_logo)...');
  const logoUpload = await cloudinary.uploader.upload(logoPath, {
    folder: 'sisodia-atelier/permanent',
    public_id: 'brand_logo',
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });
  console.log('✓ Brand Logo Uploaded:', logoUpload.secure_url);

  console.log('2. Uploading atelier floor video to Cloudinary (sisodia-atelier/permanent/atelier_floor_video)...');
  const videoUpload = await cloudinary.uploader.upload(videoPath, {
    folder: 'sisodia-atelier/permanent',
    public_id: 'atelier_floor_video',
    overwrite: true,
    invalidate: true,
    resource_type: 'video',
  });
  console.log('✓ Atelier Video Uploaded:', videoUpload.secure_url);

  console.log('3. Upserting into Neon PostgreSQL SiteAsset table...');
  const logoAsset = await prisma.siteAsset.upsert({
    where: { key: 'brand_logo' },
    update: {
      url: logoUpload.secure_url,
      resourceType: 'image',
    },
    create: {
      key: 'brand_logo',
      url: logoUpload.secure_url,
      resourceType: 'image',
    },
  });

  const videoAsset = await prisma.siteAsset.upsert({
    where: { key: 'atelier_floor_video' },
    update: {
      url: videoUpload.secure_url,
      resourceType: 'video',
    },
    create: {
      key: 'atelier_floor_video',
      url: videoUpload.secure_url,
      resourceType: 'video',
    },
  });

  console.log('✧ [SUCCESS] Site Assets saved in Neon PostgreSQL:');
  console.log(`- brand_logo: ${logoAsset.url}`);
  console.log(`- atelier_floor_video: ${videoAsset.url}`);

  await prisma.$disconnect();
}

syncPermanentMedia().catch(async (err) => {
  console.error('✗ Sync failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
