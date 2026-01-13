import { Injectable } from '@nestjs/common';
import { type PostgrestQueryBuilder } from '@supabase/postgrest-js';
import ModelService from './model';

export interface SpiderModel {
  id: number;
  name: string;
  origin: string;
  headers: string;
  search_url: string;
  search_method: boolean;
  search_data: string;
  search_content_type: string;
  search_cover_parent: string;
  search_cover_url: string;
  search_cover_title: string;
  search_cover_title_regular: string;
  search_cover_category: string;
  search_cover_category_regular: string;
  search_cover_author: string;
  search_cover_author_regular: string;
  search_cover_image: string;
  search_cover_description: string;
  search_cover_description_regular: string;
  search_cover_latest: string;
  search_cover_latest_regular: string;
  search_cover_latest_title: string;
  search_cover_latest_title_regular: string;
  search_cover_latest_url: string;
  search_cover_status: string;
  search_cover_status_regular: string;
  cover_title: string;
  cover_title_regular: string;
  cover_author: string;
  cover_author_regular: string;
  cover_image: string;
  cover_image_regular: string;
  cover_description: string;
  cover_description_regular: string;
  cover_category: string;
  cover_category_regular: string;
  cover_latest: string;
  cover_latest_regular: string;
  cover_latest_title: string;
  cover_latest_title_regular: string;
  cover_latest_url: string;
  cover_status: string;
  cover_status_regular: string;
  catalog_parent: string;
  catalog_url: string;
  catalog_title: string;
  catalog_title_regular: string;
  catalog_next_url: string;
  chapter_title: string;
  chapter_title_regular: string;
  chapter_content: string;
  chapter_content_regular: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

@Injectable()
export default class SpiderModelService extends ModelService {
  readonly table_name = 'novel_spiders';
  table(): PostgrestQueryBuilder<any, any, any, string> {
    return this.client.from(this.table_name);
  }
  async all(): Promise<SpiderModel[]> {
    const result = await this.table().select('*');
    return result.data || [];
  }
  async find(args: number|Partial<SpiderModel>): Promise<SpiderModel | null> {
    let query = this.table().select('*');
    if (typeof args === 'number') {
      query = query.eq('id', args);
    } else {
      for (const key in args) {
        query = query.eq(key, args[key]);
      }
    }
    const result = await query.single();
    return result.data || null;
  }
  async create(spider: Partial<SpiderModel>): Promise<SpiderModel | null> {
    const result = await this.table().insert(spider);
    return result.data || null;
  }
  async update(id: number, spider?: Partial<SpiderModel>): Promise<SpiderModel | null> {
    const result = await this.table().update(spider).eq('id', id);
    return result.data?.[0] || null;
  }
  async delete(id: number): Promise<SpiderModel | null> {
    const result = await this.update(id, { deleted_at: new Date().toISOString() });
    return result;
  }
}
