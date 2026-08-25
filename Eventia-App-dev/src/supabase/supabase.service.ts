import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_KEY');
    this.bucket = this.config.get<string>('SUPABASE_BUCKET') || 'event-images';

    if (!url || !key) {
      this.logger.warn('Supabase credentials not configured — image uploads will fail.');
    }

    this.supabase = createClient(url || '', key || '');
  }

  async uploadImage(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'events',
  ): Promise<string> {
    const ext = extname(originalName).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const path = `${folder}/${filename}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error('Supabase upload failed', error);
      throw error;
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(path);

    this.logger.log(`Image uploaded to Supabase: ${path}`);
    return data.publicUrl;
  }

  async deleteImage(url: string): Promise<void> {
    if (!url || !url.includes(this.bucket)) return;

    try {
      const bucketPrefix = `/storage/v1/object/public/${this.bucket}/`;
      const idx = url.indexOf(bucketPrefix);
      if (idx === -1) return;

      const path = url.substring(idx + bucketPrefix.length);

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        this.logger.warn(`Supabase delete failed for ${path}: ${error.message}`);
      } else {
        this.logger.log(`Image deleted from Supabase: ${path}`);
      }
    } catch (err) {
      this.logger.warn('Failed to parse Supabase URL for deletion', err);
    }
  }
}
