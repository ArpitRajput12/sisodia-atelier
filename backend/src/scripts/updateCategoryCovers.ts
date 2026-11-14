import path from 'path';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';

// Load backend .env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../config/prisma';

interface CategoryTarget {
  id: string;
  filename: string;
  url: string;
  cloudinaryId: string;
  siteAssetKey: string;
}

const CATEGORIES: CategoryTarget[] = [
  {
    id: 'solid-wooden-tiles',
    filename: 'solid-wooden-tiles.jpg',
    // Warm brown geometric solid wood parquet pattern tile texture from Wikimedia
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Wood_pattern_parquet_floor_tiles.jpg',
    cloudinaryId: 'solid-wooden-tiles',
    siteAssetKey: 'category_solid_wooden_tiles',
  },
  {
    id: 'urns-planters',
    filename: 'urns-planters.jpg',
    // Turned solid wood monolithic urn/vase
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Segmented_vase_318.jpg?width=1000',
    cloudinaryId: 'urns-planters',
    siteAssetKey: 'category_urns_planters',
  },
  {
    id: 'bowls-vessels',
    filename: 'bowls-vessels.jpg',
    // Hand-turned solid wood bowl
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bowl_made_of_Ambrosia_Maple,_turned_on_wood_lathe.jpg?width=1000',
    cloudinaryId: 'bowls-vessels',
    siteAssetKey: 'category_bowls_vessels',
  },
  {
    id: 'haveli-consoles',
    filename: 'haveli-consoles.jpg',
    // Authentic 17th-century solid teak and ebony architectural carved Indian console cabinet (warm dark brown heartwood, zero gold/white paint)
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Cabinet%2C_Goa%2C_Portuguese_India%2C_17th_century_AD%2C_ebony%2C_teak%2C_other_woods_-_Museo_Nacional_de_Artes_Decorativas_-_Madrid%2C_Spain_-_DSC07916.JPG/1280px-Cabinet%2C_Goa%2C_Portuguese_India%2C_17th_century_AD%2C_ebony%2C_teak%2C_other_woods_-_Museo_Nacional_de_Artes_Decorativas_-_Madrid%2C_Spain_-_DSC07916.JPG',
    cloudinaryId: 'haveli-consoles',
    siteAssetKey: 'category_haveli_consoles',
  },
  {
    id: 'carved-trays-boards',
    filename: 'carved-trays-boards.jpg',
    // Solid hardwood boards/trays
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wooden_cutting_boards_-_oak.jpg?width=1000',
    cloudinaryId: 'carved-trays-boards',
    siteAssetKey: 'category_carved_trays_boards',
  },
  {
    id: 'hospitality-accents',
    filename: 'hospitality-accents.jpg',
    // Handcrafted solid teak wood bench, furniture suite & architectural crafts
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carved_wooden_bench_furniture_and_crafts_at_Heuan_Chan_heritage_house_in_Luang_Prabang_Laos.jpg?width=1000',
    cloudinaryId: 'hospitality-accents',
    siteAssetKey: 'category_hospitality_accents',
  },
];

function downloadFile(fileUrl: string, destPath: string, maxRedirects = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error('Too many redirects for ' + fileUrl));
    }

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    };

    https.get(fileUrl, options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(fileUrl);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        res.resume();
        return resolve(downloadFile(redirectUrl, destPath, maxRedirects - 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Download failed with status ${res.statusCode} for ${fileUrl}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve());
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('✧ [SISODIA ATELIER] Overwriting category cover images & uploading to Cloudinary...');

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
  const targetDir = path.resolve(rootDir, 'frontend/public/images/categories');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const results: Record<string, { size: number; cloudinaryUrl: string }> = {};

  for (const cat of CATEGORIES) {
    const localFilePath = path.resolve(targetDir, cat.filename);
    console.log(`\n- Downloading: ${cat.filename} from ${cat.url}`);
    await downloadFile(cat.url, localFilePath);

    const stats = fs.statSync(localFilePath);
    console.log(`  ✓ Saved ${cat.filename} (${stats.size} bytes / ${(stats.size / 1024).toFixed(1)} KB)`);

    if (stats.size < 30000) {
      throw new Error(`File ${cat.filename} is under 30 KB (${stats.size} bytes)!`);
    }

    console.log(`- Uploading to Cloudinary (sisodia-atelier/categories/${cat.cloudinaryId})...`);
    const uploadRes = await cloudinary.uploader.upload(localFilePath, {
      folder: 'sisodia-atelier/categories',
      public_id: cat.cloudinaryId,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });
    console.log(`  ✓ Cloudinary URL: ${uploadRes.secure_url}`);

    results[cat.id] = {
      size: stats.size,
      cloudinaryUrl: uploadRes.secure_url,
    };

    // Upsert into Neon DB SiteAsset
    await prisma.siteAsset.upsert({
      where: { key: cat.siteAssetKey },
      update: {
        url: uploadRes.secure_url,
        resourceType: 'image',
      },
      create: {
        key: cat.siteAssetKey,
        url: uploadRes.secure_url,
        resourceType: 'image',
      },
    });
  }

  console.log('\n================ SUMMARY OF CATEGORY COVERS ================');
  for (const [id, data] of Object.entries(results)) {
    console.log(`• ${id}: ${(data.size / 1024).toFixed(2)} KB -> ${data.cloudinaryUrl}`);
  }

  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error('✗ Category cover update failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
