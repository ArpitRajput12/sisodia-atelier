import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏛️  Initializing SISODIA ATELIER ✧ database...');

  // Ensure Owner User exists
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Heirloom@Sisodia2026', salt);

  await prisma.user.upsert({
    where: { email: 'Sisodiaatelier09@gmail.com' },
    update: {},
    create: {
      email: 'Sisodiaatelier09@gmail.com',
      passwordHash,
      firstName: 'Yash',
      lastName: 'Sisodia',
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Ensure Permanent Media SiteAssets
  await prisma.siteAsset.upsert({
    where: { key: 'brand_logo' },
    update: {
      url: 'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794658373/sisodia-atelier/permanent/brand_logo.jpg',
    },
    create: {
      key: 'brand_logo',
      url: 'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794658373/sisodia-atelier/permanent/brand_logo.jpg',
      resourceType: 'image',
    },
  });

  await prisma.siteAsset.upsert({
    where: { key: 'atelier_floor_video' },
    update: {
      url: 'https://res.cloudinary.com/gxhyfmfv/video/upload/v1794658376/sisodia-atelier/permanent/atelier_floor_video.mp4',
    },
    create: {
      key: 'atelier_floor_video',
      url: 'https://res.cloudinary.com/gxhyfmfv/video/upload/v1794658376/sisodia-atelier/permanent/atelier_floor_video.mp4',
      resourceType: 'video',
    },
  });

  console.log('✅ SISODIA ATELIER ✧ database initialized cleanly with 0 dummy products.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
