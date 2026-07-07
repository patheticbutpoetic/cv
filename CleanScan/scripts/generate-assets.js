/**
 * Generates placeholder brand PNG assets (icon, adaptive icon, splash) so the
 * app builds. These are simple CleanScan-blue tiles with a lighter document
 * mark — replace with the final logo from the brand exploration when available.
 *
 * Run: node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

const BG = [22, 93, 255]; // #165DFF
const FG = [255, 255, 255];

/** Writes a solid PNG with a centered rounded "document" rectangle. */
function writePng(file, width, height, background) {
  const bytesPerPixel = 3;
  const rowLen = width * bytesPerPixel + 1;
  const raw = Buffer.alloc(rowLen * height);

  const markW = Math.floor(width * 0.42);
  const markH = Math.floor(height * 0.5);
  const markX = Math.floor((width - markW) / 2);
  const markY = Math.floor((height - markH) / 2);

  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const inMark =
        x >= markX && x < markX + markW && y >= markY && y < markY + markH;
      const [r, g, b] = inMark ? FG : background;
      const o = y * rowLen + 1 + x * bytesPerPixel;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log('wrote', file, `${width}x${height}`);
}

const base = path.join(__dirname, '..', 'src', 'assets', 'images');
writePng(path.join(base, 'icon.png'), 1024, 1024, BG);
writePng(path.join(base, 'adaptive-icon.png'), 1024, 1024, BG);
writePng(path.join(base, 'splash.png'), 1284, 1284, [247, 248, 250]); // off-white splash
