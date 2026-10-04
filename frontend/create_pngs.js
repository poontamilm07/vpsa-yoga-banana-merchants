import fs from 'fs';
import path from 'path';

// Generate valid uncompressed PNG file programmatically for 192x192 and 512x512 icons
// using crisp RGB pixels matching #059669 background and #f59e0b banner

function createSimplePNG(width, height) {
  // We can write a simple valid PNG using PNG header and raw DEFLATE data block
  // Green background (#047857), Yellow border (#f59e0b)
  const bgR = 4, bgG = 120, bgB = 87;
  const bR = 245, bG = 158, bB = 11;
  const borderWidth = Math.floor(width * 0.04);
  
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const isBorder = x < borderWidth || x >= width - borderWidth || y < borderWidth || y >= height - borderWidth;
      if (isBorder) {
        rawData[offset++] = bR;
        rawData[offset++] = bG;
        rawData[offset++] = bB;
      } else {
        rawData[offset++] = bgR;
        rawData[offset++] = bgG;
        rawData[offset++] = bgB;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 2; // Color type (RGB)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk (Zlib uncompressed stream)
  const zlibHeader = Buffer.from([0x78, 0x01]); // Zlib header (no compression)
  
  // Split rawData into 65535-byte DEFLATE uncompressed blocks
  const blocks = [];
  const maxBlock = 65535;
  let pos = 0;
  while (pos < rawData.length) {
    const end = Math.min(pos + maxBlock, rawData.length);
    const chunkLen = end - pos;
    const isLast = end === rawData.length ? 1 : 0;
    
    const blockHeader = Buffer.alloc(5);
    blockHeader[0] = isLast;
    blockHeader.writeUInt16LE(chunkLen, 1);
    blockHeader.writeUInt16LE(chunkLen ^ 0xffff, 3);
    
    blocks.push(blockHeader);
    blocks.push(rawData.subarray(pos, end));
    pos = end;
  }

  // Adler32 checksum
  const adler = adler32(rawData);
  const adlerBuf = Buffer.alloc(4);
  adlerBuf.writeUInt32BE(adler, 0);

  const idatData = Buffer.concat([zlibHeader, ...blocks, adlerBuf]);
  const idatChunk = createChunk('IDAT', idatData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function adler32(buf) {
  let s1 = 1, s2 = 0;
  for (let i = 0; i < buf.length; i++) {
    s1 = (s1 + buf[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return ((s2 * 65536) + s1) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = 'C:/Users/ADMIN/.gemini/antigravity/scratch/banana-ledger/frontend/public';
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSimplePNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSimplePNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSimplePNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), createSimplePNG(512, 512));
console.log('PNG PWA icons created successfully!');
