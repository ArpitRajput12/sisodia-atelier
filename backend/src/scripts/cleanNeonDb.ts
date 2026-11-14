import path from 'path';
import dotenv from 'dotenv';

// Load backend .env (NEVER modified or deleted)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { prisma } from '../config/prisma';

// Exact known dummy seed titles - never wipe real owner-created products
const KNOWN_DUMMY_SEED_PATTERNS = [
  'The Mewar Reclaimed Teak Jharokha',
  'The Sacred Vijaysar',
  'The Barmer Monolithic Fluted Urn',
  'The Nagina Sheesh Mahal',
  'Scalloped Sheesham Charcuterie',
];

async function cleanNeonDb() {
  console.log('✧ [SISODIA ATELIER] Safely cleaning known dummy records in Neon PostgreSQL...');

  // 1. Delete ONLY known dummy seed products (CRITICAL: never wipe real products)
  let deletedDummyCount = 0;
  for (const pattern of KNOWN_DUMMY_SEED_PATTERNS) {
    const res = await prisma.product.deleteMany({
      where: {
        name: {
          contains: pattern,
          mode: 'insensitive',
        },
      },
    });
    deletedDummyCount += res.count;
  }
  console.log(`✓ Cleaned ${deletedDummyCount} specific dummy seed products. All real owner products preserved.`);

  // 2. Check and ensure Super Admin Yash Sisodia exists
  const superAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'Sisodiaatelier09@gmail.com' },
        { email: 'yash@sisodiaatelier.com' },
      ],
    },
  });

  if (!superAdmin) {
    const createdAdmin = await prisma.user.create({
      data: {
        email: 'Sisodiaatelier09@gmail.com',
        firstName: 'Yash',
        lastName: 'Sisodia',
        role: 'SUPER_ADMIN',
        passwordHash: '$2b$12$K1Hk8sFkZ3F6hJqVj.oMRe7e1fBv9m7U3g7I8y7f8c9b0a1d2e3f4',
      },
    });
    console.log(`✓ Created Super Admin Yash Sisodia: ${createdAdmin.email}`);
  } else {
    console.log(`✓ Super Admin User exists: ${superAdmin.email}`);
  }

  // 3. Report SiteAssets
  const assets = await prisma.siteAsset.findMany();
  console.log(`✓ Preserved ${assets.length} permanent site assets in Neon DB:`);
  assets.forEach((a) => console.log(`   - [${a.key}]: ${a.url}`));

  const remainingProducts = await prisma.product.count();
  console.log(`✧ [SISODIA ATELIER] Clean-up complete. Current real products in Neon DB: ${remainingProducts}`);
}

cleanNeonDb()
  .catch((err) => {
    console.error('Error cleaning Neon DB:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
