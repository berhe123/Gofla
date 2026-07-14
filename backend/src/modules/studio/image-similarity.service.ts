import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

type HashCacheEntry = { hash: bigint; mtimeMs: number };

/** Perceptual dHash — compares uploaded photos against catalog product images. */
@Injectable()
export class ImageSimilarityService {
  private readonly logger = new Logger(ImageSimilarityService.name);
  private readonly hashCache = new Map<string, HashCacheEntry>();
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  /** 64-bit difference hash (9×8 grayscale). 1.0 = identical, 0.0 = opposite. */
  async compareBuffers(upload: Buffer, catalog: Buffer): Promise<number> {
    const [a, b] = await Promise.all([this.computeDHash(upload), this.computeDHash(catalog)]);
    return this.hashSimilarity(a, b);
  }

  async scoreCatalogImage(upload: Buffer, imageUrl: string): Promise<number | null> {
    const filePath = this.resolveFilePath(imageUrl);
    if (!filePath) return null;

    try {
      const catalogBuffer = await fs.promises.readFile(filePath);
      const md5Upload = createHash('md5').update(upload).digest('hex');
      const md5Catalog = createHash('md5').update(catalogBuffer).digest('hex');
      if (md5Upload === md5Catalog) return 1;

      const catalogHash = await this.getFileHash(filePath, catalogBuffer);
      const uploadHash = await this.computeDHash(upload);
      return this.hashSimilarity(uploadHash, catalogHash);
    } catch (err) {
      this.logger.warn(`Could not hash ${imageUrl}: ${(err as Error).message}`);
      return null;
    }
  }

  private resolveFilePath(imageUrl: string): string | null {
    const normalized = imageUrl.replace(/\\/g, '/');
    const marker = '/uploads/';
    const idx = normalized.indexOf(marker);
    if (idx === -1) return null;

    const relative = normalized.slice(idx + marker.length);
    const filePath = path.join(this.uploadRoot, relative);
    return fs.existsSync(filePath) ? filePath : null;
  }

  private async getFileHash(filePath: string, buffer?: Buffer): Promise<bigint> {
    const stat = fs.statSync(filePath);
    const cached = this.hashCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.hash;

    const fileBuffer = buffer ?? (await fs.promises.readFile(filePath));
    const hash = await this.computeDHash(fileBuffer);
    this.hashCache.set(filePath, { hash, mtimeMs: stat.mtimeMs });
    return hash;
  }

  private async computeDHash(buffer: Buffer): Promise<bigint> {
    const { data } = await sharp(buffer)
      .rotate()
      .resize(9, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let hash = 0n;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const left = data[y * 9 + x] ?? 0;
        const right = data[y * 9 + x + 1] ?? 0;
        const bit = BigInt(y * 8 + x);
        if (left > right) hash |= 1n << bit;
      }
    }
    return hash;
  }

  private hashSimilarity(a: bigint, b: bigint): number {
    let xor = a ^ b;
    let diff = 0;
    while (xor > 0n) {
      diff += Number(xor & 1n);
      xor >>= 1n;
    }
    return Number((1 - diff / 64).toFixed(4));
  }
}
