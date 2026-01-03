import { Injectable } from '@nestjs/common';
import { type PostgrestQueryBuilder } from '@supabase/postgrest-js';
import ModelService from './model';

export interface BookModel {
  id: number;
  name: string;
  author: string;
  image: string;
  description: string;
  category: string;
  status: string;
  origin: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

@Injectable()
export default class BookModelService extends ModelService {
  readonly table_name = 'novel_books';
  table(): PostgrestQueryBuilder<any, any, any, string> {
    return this.client.from(this.table_name);
  }
  async all(): Promise<BookModel[]> {
    const result = await this.table().select('*').neq('deleted_at', null);
    return result.data || [];
  }
  async find(args: number|Partial<BookModel>): Promise<BookModel | null> {
    let query = this.table().select('*');
    if (typeof args === 'number') {
      query = query.eq('id', args);
    } else {
      for (const key in args) {
        query = query.eq(key, args[key]);
      }
    }
    const result = await query;
    return result.data?.[0] || null;
  }
  async create(book: Partial<BookModel>): Promise<BookModel | null> {
    const result = await this.table().insert(book);
    return result.data?.[0] || null;
  }
  async update(id: number, book?: Partial<BookModel>): Promise<BookModel | null> {
    const result = await this.table().update(book).eq('id', id);
    return result.data?.[0] || null;
  }
  async delete(id: number): Promise<BookModel | null> {
    const result = await this.update(id, { deleted_at: new Date().toISOString() });
    return result;
  }
}
