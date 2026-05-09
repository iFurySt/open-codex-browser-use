#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { deflateSync } from "node:zlib";

const repoRoot = path.resolve(import.meta.dirname, "..");
const iconDir = path.join(repoRoot, "apps/chrome-extension/icons");
const sizes = [16, 32, 48, 128];

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
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function parseHex(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

function setPixel(pixels, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= width) {
    return;
  }
  const offset = (y * width + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function fillRoundedRect(pixels, width, height, x, y, w, h, radius, color) {
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(width, Math.ceil(x + w));
  const bottom = Math.min(height, Math.ceil(y + h));
  for (let py = top; py < bottom; py += 1) {
    for (let px = left; px < right; px += 1) {
      const cx = px < x + radius ? x + radius : px >= x + w - radius ? x + w - radius - 1 : px;
      const cy = py < y + radius ? y + radius : py >= y + h - radius ? y + h - radius - 1 : py;
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, width, px, py, color);
      }
    }
  }
}

function fillRect(pixels, width, height, x, y, w, h, color) {
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(width, Math.ceil(x + w));
  const bottom = Math.min(height, Math.ceil(y + h));
  for (let py = top; py < bottom; py += 1) {
    for (let px = left; px < right; px += 1) {
      setPixel(pixels, width, px, py, color);
    }
  }
}

function fillCircle(pixels, width, height, cx, cy, radius, color) {
  const left = Math.max(0, Math.floor(cx - radius));
  const top = Math.max(0, Math.floor(cy - radius));
  const right = Math.min(width, Math.ceil(cx + radius));
  const bottom = Math.min(height, Math.ceil(cy + radius));
  const radiusSquared = radius * radius;
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(pixels, width, x, y, color);
      }
    }
  }
}

function fillPolygon(pixels, width, height, points, color) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map((point) => point[1]))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...points.map((point) => point[1]))));

  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      if ((current[1] <= y && next[1] > y) || (next[1] <= y && current[1] > y)) {
        const x = current[0] + ((y - current[1]) * (next[0] - current[0])) / (next[1] - current[1]);
        intersections.push(x);
      }
    }

    intersections.sort((a, b) => a - b);
    for (let index = 0; index < intersections.length; index += 2) {
      const start = Math.max(0, Math.floor(intersections[index]));
      const end = Math.min(width - 1, Math.ceil(intersections[index + 1]));
      for (let x = start; x <= end; x += 1) {
        setPixel(pixels, width, x, y, color);
      }
    }
  }
}

function drawRoundLine(pixels, width, height, x1, y1, x2, y2, radius, color) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(length / Math.max(1, radius * 0.5)));

  for (let step = 0; step <= steps; step += 1) {
    const ratio = step / steps;
    fillCircle(
      pixels,
      width,
      height,
      x1 + (x2 - x1) * ratio,
      y1 + (y2 - y1) * ratio,
      radius,
      color
    );
  }
}

function scalePoints(points, size) {
  return points.map(([x, y]) => [x * size, y * size]);
}

function drawIcon(logicalSize) {
  const scale = 4;
  const size = logicalSize * scale;
  const pixels = Buffer.alloc(size * size * 4);
  const color = (hex, alpha = 255) => [...parseHex(hex), alpha];

  fillRoundedRect(pixels, size, size, size * 0.07, size * 0.09, size * 0.86, size * 0.8, size * 0.08, color("#061b2e"));
  fillRoundedRect(pixels, size, size, size * 0.11, size * 0.25, size * 0.78, size * 0.58, size * 0.04, color("#ffffff"));
  fillRect(pixels, size, size, size * 0.11, size * 0.25, size * 0.78, size * 0.08, color("#ffffff"));

  fillCircle(pixels, size, size, size * 0.18, size * 0.18, size * 0.028, color("#ff4b3e"));
  fillCircle(pixels, size, size, size * 0.26, size * 0.18, size * 0.028, color("#ffd635"));
  fillCircle(pixels, size, size, size * 0.34, size * 0.18, size * 0.028, color("#34c96b"));

  const clickBlue = color("#1373f2");
  drawRoundLine(pixels, size, size, size * 0.46, size * 0.34, size * 0.48, size * 0.45, size * 0.016, clickBlue);
  drawRoundLine(pixels, size, size, size * 0.56, size * 0.38, size * 0.5, size * 0.47, size * 0.016, clickBlue);
  drawRoundLine(pixels, size, size, size * 0.34, size * 0.39, size * 0.43, size * 0.46, size * 0.016, clickBlue);
  drawRoundLine(pixels, size, size, size * 0.31, size * 0.52, size * 0.42, size * 0.49, size * 0.016, clickBlue);

  fillPolygon(
    pixels,
    size,
    size,
    scalePoints(
      [
        [0.47, 0.45],
        [0.73, 0.58],
        [0.61, 0.64],
        [0.56, 0.81],
        [0.51, 0.82],
        [0.43, 0.48]
      ],
      size
    ),
    color("#050505")
  );
  fillPolygon(
    pixels,
    size,
    size,
    scalePoints(
      [
        [0.48, 0.49],
        [0.68, 0.59],
        [0.58, 0.63],
        [0.54, 0.76],
        [0.52, 0.76],
        [0.46, 0.52]
      ],
      size
    ),
    color("#ffffff")
  );

  const downsampled = Buffer.alloc(logicalSize * logicalSize * 4);
  for (let y = 0; y < logicalSize; y += 1) {
    for (let x = 0; x < logicalSize; x += 1) {
      const totals = [0, 0, 0, 0];
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          const offset = ((y * scale + sy) * size + (x * scale + sx)) * 4;
          totals[0] += pixels[offset];
          totals[1] += pixels[offset + 1];
          totals[2] += pixels[offset + 2];
          totals[3] += pixels[offset + 3];
        }
      }
      const target = (y * logicalSize + x) * 4;
      downsampled[target] = Math.round(totals[0] / (scale * scale));
      downsampled[target + 1] = Math.round(totals[1] / (scale * scale));
      downsampled[target + 2] = Math.round(totals[2] / (scale * scale));
      downsampled[target + 3] = Math.round(totals[3] / (scale * scale));
    }
  }
  return encodePng(logicalSize, logicalSize, downsampled);
}

await mkdir(iconDir, { recursive: true });
for (const size of sizes) {
  await writeFile(path.join(iconDir, `icon-${size}.png`), drawIcon(size));
}
