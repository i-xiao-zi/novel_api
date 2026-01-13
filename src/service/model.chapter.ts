import { Injectable } from '@nestjs/common';
import { type PostgrestQueryBuilder } from '@supabase/postgrest-js';
import ModelService from './model';
import { interval, Observable } from 'rxjs';

export interface ChapterModel {
  id: number;
  book_id: number;
  title: string;
  content: string;
  description: string;
  audio: boolean;
  read: boolean;
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
  async count(id: number, gt: number = 0): Promise<number> {
    const result = await this.table().select('id', { count: 'exact' }).eq('book_id', id).gt('id', gt).order('id');
    return result.count || 0;
  }
  async page(id: number, page: number = 0, limit: number = 10, gt: number = 0): Promise<ChapterModel[]> {
    const result = await this.table().select('*').eq('book_id', id).order('id').gt('id', gt).range(page * limit, (page + 1) * limit - 1);
    return result.data || [];
  }
  book(id: number, page: number = 0, limit: number = 10): Observable<ChapterModel[]> {
    return new Observable<ChapterModel[]>(subscriber => {
      console.log('start');
      (async () => {
        const total = await this.count(id);
        const totalPages = Math.ceil(total / limit);
        console.log('total', total, 'totalPages', totalPages);
        for (let i = 0; i < totalPages; i++) {
          const result = await this.table().select('*').eq('book_id', id).order('id').range(i * limit, (i + 1) * limit - 1);
          console.log('take', i, result.data?.length || 0);
          subscriber.next(result.data || []);
          if (i === totalPages - 1) {
            console.log('所有数据获取完成');
            subscriber.complete();
          }
        }
      })();
      console.log('end');
      return () => {
        console.log('Observable 被取消订阅');
      };
    });
  }
  async find(args: number|Partial<ChapterModel>): Promise<ChapterModel | null> {
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
  async create(chapter: Partial<ChapterModel>| Partial<ChapterModel>[]): Promise<ChapterModel | null> {
    const result = await this.table().insert(chapter);
    return result.data?.[0] || null;
  }
  async update(id: number, chapter?: Partial<ChapterModel>): Promise<ChapterModel | null> {
    const result = await this.table().update(chapter).eq('id', id);
    return result.data?.[0] || null;
  }
  async delete(id: number): Promise<ChapterModel | null> {
    const result = await this.update(id, { deleted_at: new Date().toISOString() });
    return result;
  }
}
