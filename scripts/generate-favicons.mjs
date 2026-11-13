import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceLogo = 'public/assets/Logos/logo-1.png';

async function generate() {
  console.log('Generating PGK Gifts browser tab favicons and app icons...');
  
  if (!fs.existsSync(sourceLogo)) {
    throw new Error(`Source logo not found at ${sourceLogo}`);
  }

  // 1. Generate PNGs of various standard sizes
  const sizes = {
    'public/icon-16.png': 16,
    'public/icon-32.png': 32,
    'public/icon-48.png': 48,
    'public/icon-192.png': 192,
    'public/icon-512.png': 512,
    'public/icon.png': 192,
    'src/app/icon.png': 192,
    'public/apple-icon.png': 180,
    'src/app/apple-icon.png': 180,
  };

  for (const [targetPath, size] of Object.entries(sizes)) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await sharp(sourceLogo)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(targetPath);
    console.log(`Generated ${targetPath} (${size}x${size})`);
  }

  // 2. Generate multi-resolution .ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map(s => 
      sharp(sourceLogo)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  const headerLen = 6;
  const dirEntryLen = 16;
  let offset = headerLen + dirEntryLen * icoSizes.length;

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(icoSizes.length, 4); // count of images

  const entries = [];
  for (let i = 0; i < icoSizes.length; i++) {
    const s = icoSizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(s === 256 ? 0 : s, 0); // width
    entry.writeUInt8(s === 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...pngBuffers]);

  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('Saved public/favicon.ico');

  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  console.log('Saved src/app/favicon.ico');

  console.log('All browser tab icons and favicons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
