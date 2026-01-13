import { Injectable } from '@nestjs/common';
import { createClient, PostgrestResponse, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import SpiderModelService, { SpiderModel } from "./model.spider";
import {HttpService} from "@nestjs/axios";
import axios, { AxiosResponse } from 'axios';
import { CatalogItem, CoverItem, ItemEvent, SearchItem, ChapterItem } from './spider.interface';
import * as cheerio from 'cheerio';
import { Subject } from 'rxjs';
import { URL } from 'node:url';
import BookModelService from './model.book';
import ChapterModelService, { ChapterModel } from './model.chapter';

@Injectable()
export default class SpiderService {
  constructor(private readonly httpService: HttpService, private readonly spiderModelService: SpiderModelService, private readonly bookService: BookModelService, private readonly chapterService: ChapterModelService) {}
  public async search(keywords: string): Promise<SearchItem[]> {
    return await this._search_sipder(keywords);
  }
  public book(url: string) {
    const eventSubject = new Subject<ItemEvent>();
    this._book_sipder(url, eventSubject);
    return eventSubject.asObservable();
  }
  public single(url: string) {
    const eventSubject = new Subject<ItemEvent>();
    this._chapter_sipder(url, eventSubject);
    return eventSubject.asObservable();
  }
  public async cover(url: string) {
    return await this._cover_sipder(url);
  }
  public async catalog(url: string) {
    return await this._catalog_sipder(url);
  }
  public async chapter(url: string) {
    return await this._chapter_sipder(url);
  }
  private async _book_sipder(url: string, eventSubject: Subject<ItemEvent>) {
    const spiders: SpiderModel[] = await this.spiderModelService.all();
    if (spiders.length == 0) {
      eventSubject.next({ type: 'error', data: undefined, timestamp: new Date().toISOString() });
    } else {
      await this._cover_sipder(url, eventSubject);
      eventSubject.next({ type: 'complete', data: undefined, timestamp: new Date().toISOString() });
    }
  }
  private async _search_sipder(keywords: string) {
    const search_items: SearchItem[] = [];
    const spiders: SpiderModel[] = await this.spiderModelService.all();
    for (const spider of spiders) {
        if (spider.search_method) {
          const data = spider.search_data.replace('{{data}}', `${keywords}`);
          const response = await axios.post(spider.search_url, data, {headers: {...JSON.parse(spider.headers || '{}'), ...JSON.parse(spider.search_content_type || '{}')}});
            search_items.push(...(await this._search_parse(response)));
        } else {
          const response = await axios.get(spider.search_url, {headers: JSON.parse(spider.headers || '{}')});
          search_items.push(...(await this._search_parse(response)));
        }
      }
    return search_items;
  }
  private async _cover_sipder(url: string, eventSubject?: Subject<ItemEvent>) {
    const response = await axios.get(url);
    return await this._cover_parse(response, eventSubject);
  }
  private async _catalog_sipder(url: string, eventSubject?: Subject<ItemEvent>){
    const response = await axios.get(url);
    return await this._catalog_parse(response, eventSubject);
  }
  private async _chapter_sipder(url: string, eventSubject?: Subject<ItemEvent>) {
    const response = await axios.get(url);
    return await this._chapter_parse(response, eventSubject);
  }
  private async _search_parse(response: AxiosResponse) {
    const spider = await this.spiderModelService.find({ origin: (new URL(response.config.url as string)).origin });
    if (!spider) {
      return [];
    }
    const $ = cheerio.load(response.data);
    const search_items: SearchItem[] = [];
    (eval(spider.search_cover_parent) as cheerio.Cheerio<any>).each((_, element) => {
      let url = eval(spider.search_cover_url) as string;
      url = (new URL(url, response.config.url)).toString();
      let title = eval(spider.search_cover_title) as string;
      if(spider.search_cover_title_regular) {
        title = title.replace(new RegExp(spider.search_cover_title_regular), '');
      }
      let category = eval(spider.search_cover_category) as string;
      if(spider.search_cover_category_regular) {
        category = category.replace(new RegExp(spider.search_cover_category_regular), '');
      }
      let author = eval(spider.search_cover_author) as string;
      if(spider.search_cover_author_regular) {
        author = author.replace(new RegExp(spider.search_cover_author_regular), '');
      }
      search_items.push({ url, title, category, author })
    })
    return search_items;
  }
  private async _cover_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    const spider = await this.spiderModelService.find({ origin: (new URL(response.config.url as string)).origin });
    if (!spider) {
      return;
    }
    const $ = cheerio.load(response.data);
    let title = eval(spider.cover_title) as string;
    if(spider.cover_title_regular) {
      title = title.replace(new RegExp(spider.cover_title_regular), '');
    }
    let author = eval(spider.cover_author) as string;
    if(spider.cover_author_regular) {
      author = author.replace(new RegExp(spider.cover_author_regular), '');
    }
    let category = eval(spider.cover_category) as string;
    if(spider.cover_category_regular) {
      category = category.replace(new RegExp(spider.cover_category_regular), '');
    }
    let image = eval(spider.cover_image) as string;
    if(spider.cover_image_regular) {
      image = image.replace(new RegExp(spider.cover_image_regular), '');
    }
    let description = eval(spider.cover_description) as string;
    if(spider.cover_description_regular) {
      description = description.replace(new RegExp(spider.cover_description_regular), '');
    }
    let latest = eval(spider.cover_latest) as string;
    if(spider.cover_latest_regular) {
      latest = latest.replace(new RegExp(spider.cover_latest_regular), '');
    }
    let latest_title = eval(spider.cover_latest_title) as string;
    if(spider.cover_latest_title_regular) {
      latest_title = latest_title.replace(new RegExp(spider.cover_latest_title_regular), '');
    }
    let latest_url = eval(spider.cover_latest_url) as string;
    latest_url = (new URL(latest_url, response.config.url)).toString();
    let status = eval(spider.cover_status) as string;
    if(spider.cover_status_regular) {
      status = status.replace(new RegExp(spider.cover_status_regular), '');
    }

    const cover_item: CoverItem = {title, author, image, description, category, latest, latest_title, latest_url, status,}
    if (eventSubject) {
      eventSubject.next({ type: 'book', data: cover_item, timestamp: new Date().toISOString() });
      const exists = await this.bookService.find({origin: response.config.url})
      if(!exists) {
        await this.bookService.create({
          name: cover_item.title,
          author: cover_item.author,
          image: cover_item.image,
          description: cover_item.description,
          category: cover_item.category,
          status: cover_item.status,
          origin: response.config.url,
        });
      }
      return await this._catalog_sipder(response.config.url as string, eventSubject);
    } else {
      return cover_item;
    }
  }
  private async _catalog_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    const spider = await this.spiderModelService.find({ origin: (new URL(response.config.url as string)).origin });
    if (!spider) {
      return [];
    }

    const $ = cheerio.load(response.data);
    const catalog_items: CatalogItem[] = [];
    $('div.border_chapter>ul.fen_4>li').map(async (_, element) => {
      let url = new URL(eval(spider.catalog_url) as string, response.config.url).toString();
      let title = eval(spider.catalog_title) as string;
      if (spider.catalog_title_regular) {
        title = title.replace(new RegExp(spider.catalog_title_regular), '');
      }
      catalog_items.push({ url, title })
    })
    if (eventSubject) {
      const book = await this.bookService.find({ origin: response.config.url });
      const count = await this.chapterService.count(book!.id);
      if (count == 0) {
        await this.chapterService.create(catalog_items.map((item) => ({
          book_id: book?.id,
          title: item.title,
          origin: item.url,
        })));
        for (const item of catalog_items) {
          await this._chapter_sipder(item.url!, eventSubject);
        }
      } else {
        const items = await this.chapterService.table().select('origin').eq('content', '');
        for (const item of (items.data || [] as ChapterModel[])) {
          await this._chapter_sipder(item.origin, eventSubject);
        }
      }
      // todo 下一页
    } else {
      return catalog_items;
    }
  }
  private async _chapter_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    const spider = await this.spiderModelService.find({ origin: (new URL(response.config.url as string)).origin });
    if (!spider) {
      return;
    }
    const $ = cheerio.load(response.data);
    let title = eval(spider.chapter_title) as string;
    if (spider.chapter_title_regular) {
      title = title.replace(new RegExp(spider.chapter_title_regular), '');
    }
    let content = '';
    (eval(spider.chapter_content) as cheerio.Cheerio<any>).contents().each((index, element) => {
      if ((element.type === 'text' || (element.type === 'tag' && element.name !== 'a')) && $(element).text().trim() !== '') {
        let item = $(element).text().trim()
        if(spider.chapter_content_regular) {
          item = item.replace(new RegExp(spider.chapter_content_regular), '');
        }
        if(item !== '') {
          content += `<p style="text-indent: 2em; line-height: 2em;">${item}</p>\n`
        }
      }
    });
    const chapter_item: ChapterItem = { title, content };
    if (eventSubject) {
      const chapter = await this.chapterService.find({ origin: response.config.url });
      await this.chapterService.update(chapter?.id!, {content: chapter_item.content});
      eventSubject.next({ type: 'chapter', data: {title: chapter_item.title}, timestamp: new Date().toISOString() });
    } else {
      return chapter_item;
    }
  }

  private _url(root: string, uri: string) {
    return (new URL(uri, root)).toString();
  }
}
