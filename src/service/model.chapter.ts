import { Injectable } from '@nestjs/common';
import { type PostgrestQueryBuilder } from '@supabase/postgrest-js';
import ModelService from './model';

export interface ChapterModel {
  id: number;
  name: string;
  author: string;
  image: boolean;
  description: string;
  category: string;
  status: string;
  origin: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

@Injectable()
export default class ChapterModelService extends ModelService {
  readonly table_name = 'novel_chapters';
  table(): PostgrestQueryBuilder<any, any, any, string> {
    return this.client.from(this.table_name);
  }
  async all(): Promise<ChapterModel[]> {
    const result = await this.table().select('*').neq('deleted_at', null);
    return result.data || [];
  }
  async find(args: number|Partial<ChapterModel>): Promise<ChapterModel | null> {
    let query = this.table().select('*');
    if (typeof args === 'number') {
      query = query.eq('id', args);
    } else {
      query = query.match(args);
    }
    const result = await query;
    return result.data?.[0] || null;
  }
  async create(chapter: Partial<ChapterModel>): Promise<ChapterModel | null> {
    const result = await this.table().insert(chapter);
    return result.data?.[0] || null;
  }
  async update(id: number|Partial<ChapterModel>&{id: number}, chapter?: Partial<ChapterModel>): Promise<ChapterModel | null> {
    let query = this.table().update(typeof id === 'number' ? id : chapter);
    if (typeof id === 'number') {
      query = query.eq('id', id);
    }
    const result = await query;
    return result.data?.[0] || null;
  }
  async delete(id: number): Promise<ChapterModel | null> {
    const result = await this.update(id, { deleted_at: new Date().toISOString() });
    return result;
  }
}
