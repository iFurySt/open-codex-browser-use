#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const repoRoot = path.resolve(import.meta.dirname, "..");
const iconDir = path.join(repoRoot, "apps/chrome-extension/icons");
const sourceIconPath = path.join(iconDir, "logo-source.png");
const sizes = [16, 32, 48, 128];

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width, height, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const target = y * (1 + width * 4);
    scanlines[target] = 0;
    pixels.copy(scanlines, target + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    pngSignature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
    return left;
  }
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function decodePng(buffer) {
  if (!buffer.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${sourceIconPath} is not a PNG file`);
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlaceMethod = 0;
  let palette = null;
  let transparency = null;
  const idatChunks = [];

  let offset = pngSignature.length;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlaceMethod = data[12];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "PLTE") {
      palette = data;
    } else if (type === "tRNS") {
      transparency = data;
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || interlaceMethod !== 0 || ![2, 3, 6].includes(colorType)) {
    throw new Error(`${sourceIconPath} must be an 8-bit non-interlaced indexed, RGB, or RGBA PNG`);
  }
  if (colorType === 3 && palette == null) {
    throw new Error(`${sourceIconPath} is an indexed PNG without a palette`);
  }

  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rows = Buffer.alloc(height * stride);

  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const rowStart = y * stride;
    const previousRowStart = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[sourceOffset + x];
      const left = x >= bytesPerPixel ? rows[rowStart + x - bytesPerPixel] : 0;
      const above = y > 0 ? rows[previousRowStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? rows[previousRowStart + x - bytesPerPixel] : 0;

      if (filter === 0) {
        rows[rowStart + x] = raw;
      } else if (filter === 1) {
        rows[rowStart + x] = (raw + left) & 0xff;
      } else if (filter === 2) {
        rows[rowStart + x] = (raw + above) & 0xff;
      } else if (filter === 3) {
        rows[rowStart + x] = (raw + Math.floor((left + above) / 2)) & 0xff;
      } else if (filter === 4) {
        rows[rowStart + x] = (raw + paethPredictor(left, above, upperLeft)) & 0xff;
      } else {
        throw new Error(`Unsupported PNG filter ${filter} in ${sourceIconPath}`);
      }
    }
    sourceOffset += stride;
  }

  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = y * stride + x * bytesPerPixel;
      const target = (y * width + x) * 4;
      if (colorType === 3) {
        const paletteIndex = rows[source];
        const paletteOffset = paletteIndex * 3;
        pixels[target] = palette[paletteOffset] ?? 0;
        pixels[target + 1] = palette[paletteOffset + 1] ?? 0;
        pixels[target + 2] = palette[paletteOffset + 2] ?? 0;
        pixels[target + 3] = transparency?.[paletteIndex] ?? 255;
      } else {
        pixels[target] = rows[source];
        pixels[target + 1] = rows[source + 1];
        pixels[target + 2] = rows[source + 2];
        pixels[target + 3] = colorType === 6 ? rows[source + 3] : 255;
      }
    }
  }

  return { width, height, pixels };
}

function sampleBilinear(image, x, y, channel) {
  const x0 = Math.max(0, Math.min(image.width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(image.height - 1, Math.floor(y)));
  const x1 = Math.max(0, Math.min(image.width - 1, x0 + 1));
  const y1 = Math.max(0, Math.min(image.height - 1, y0 + 1));
  const xRatio = x - x0;
  const yRatio = y - y0;

  const topLeft = image.pixels[(y0 * image.width + x0) * 4 + channel];
  const topRight = image.pixels[(y0 * image.width + x1) * 4 + channel];
  const bottomLeft = image.pixels[(y1 * image.width + x0) * 4 + channel];
  const bottomRight = image.pixels[(y1 * image.width + x1) * 4 + channel];

  return Math.round(
    topLeft * (1 - xRatio) * (1 - yRatio) +
      topRight * xRatio * (1 - yRatio) +
      bottomLeft * (1 - xRatio) * yRatio +
      bottomRight * xRatio * yRatio
  );
}

function resizeImage(image, size) {
  const pixels = Buffer.alloc(size * size * 4);
  const xScale = image.width / size;
  const yScale = image.height / size;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sourceX = (x + 0.5) * xScale - 0.5;
      const sourceY = (y + 0.5) * yScale - 0.5;
      const target = (y * size + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        pixels[target + channel] = sampleBilinear(image, sourceX, sourceY, channel);
      }
    }
  }

  return encodePng(size, size, pixels);
}

await mkdir(iconDir, { recursive: true });
const sourceImage = decodePng(await readFile(sourceIconPath));
for (const size of sizes) {
  await writeFile(path.join(iconDir, `icon-${size}.png`), resizeImage(sourceImage, size));
}
