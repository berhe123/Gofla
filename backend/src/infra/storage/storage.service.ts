import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Storage abstraction. Defaults to a local-disk driver that writes to
 * `uploads/` and serves through the API's static handler at `/uploads`.
 * Swap STORAGE_DRIVER=s3 in production with an S3 implementation.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root = path.resolve(__dirname, '..', '..', '..', 'uploads');

  constructor(private readonly config: ConfigService) {}

  async upload(buffer: Buffer, originalName: string, folder = 'misc'): Promise<string> {
    const ext = path.extname(originalName) || '.bin';
    const fileName = `${randomUUID()}${ext}`;
    const dir = path.join(this.root, folder);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(path.join(dir, fileName), buffer);
    const apiUrl = (this.config.get<string>('apiUrl') || '').replace(/\/$/, '');
    const url = `/uploads/${folder}/${fileName}`;
    this.logger.log(`Stored file ${url}`);
    return url;
  }

  async delete(url: string): Promise<void> {
    try {
      const apiUrl = this.config.get<string>('apiUrl') || '';
      const relative = url.replace(`${apiUrl}/uploads/`, '');
      await fs.promises.unlink(path.join(this.root, relative));
    } catch (err) {
      this.logger.warn(`Could not delete ${url}: ${(err as Error).message}`);
    }
  }
}
