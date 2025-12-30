import { Injectable } from '@nestjs/common';
import { createClient, PostgrestResponse, PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';
import SpiderModelService, { SpiderModel } from "./model.spider";
import {HttpService} from "@nestjs/axios";
import axios, { AxiosResponse } from 'axios';
import { CatalogItem, CoverItem, ItemEvent, SearchItem, ChapterItem } from './spider.interface';
import * as cheerio from 'cheerio';
import { Observable, Subject } from 'rxjs';
import qs from 'qs';
import { URL } from 'node:url';

@Injectable()
export default class SpiderService {
  constructor(private readonly httpService: HttpService, private readonly spiderModelService: SpiderModelService) {}
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
      eventSubject.next({ type: 'error', data: null, timestamp: new Date().toISOString() });
    } else {
      this._cover_sipder(url, eventSubject);
    }
  }
  private async _search_sipder(keywords: string) {
    const search_items: SearchItem[] = [];
    const spiders: SpiderModel[] = await this.spiderModelService.all();
    for (const spider of spiders) {
        if (spider.search_method) {
          const data = spider.search_data.replace('{{data}}', `"${keywords}"`);
          const response = await axios.post(spider.search_url, qs.stringify(JSON.parse(data)), {headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            }});
            search_items.push(...this._search_parse(response));
        } else {
          const response = await axios.get(spider.search_url);
          search_items.push(...this._search_parse(response));
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
  private _search_parse(response: AxiosResponse) {
    const $ = cheerio.load(response.data);
    const search_items: SearchItem[] = [];
    // console.log(response.config.url)
    $('div.lastupdate>ul>li').each((_, element) => {
      search_items.push({
        url: (new URL($(element).find('span.name>a').attr('href') as string, response.config.url)).toString(),
        // url: $(element).find('span.name>a').attr('href'),
        title: $(element).find('span.name>a').text().trim(),
        category: $(element).find('span.lei>a').text().trim(),
        author: $(element).find('span.zuo>a').text().trim(),
      })
    })
    return search_items;
  }
  private async _cover_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    const $ = cheerio.load(response.data);
    const cover_item: CoverItem = {
      title: eval(`$('meta[property="og:novel:book_name"]').attr('content')`),
      author: $('meta[property="og:novel:author"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      category: $('meta[property="og:novel:category"]').attr('content'),
      latest: $('meta[property="og:novel:update_time"]').attr('content'),
      latest_title: $('meta[property="og:novel:latest_chapter_name"]').attr('content'),
      latest_url: $('meta[property="og:novel:latest_chapter_url"]').attr('content'),
      status: $('meta[property="og:novel:status"]').attr('content'),
    }
    if (eventSubject) {
      eventSubject.next({ type: 'cover', data: cover_item, timestamp: new Date().toISOString() });
      this._catalog_sipder(response.config.url as string, eventSubject);
    } else {
      return cover_item;
    }
  }
  private async _catalog_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    // const spider: SpiderModel = await this.spiderModelService.find(1);
    const $ = cheerio.load(response.data);
    const catalog_items: CatalogItem[] = [];
    $('div.border_chapter>ul.fen_4>li').each((_, element) => {
      const url = new URL($(element).find('a').attr('href') as string, response.config.url).toString();
      const title = $(element).find('a').text().trim();
      catalog_items.push({ url, title })
      if (eventSubject) {
        this._chapter_sipder(url, eventSubject);
      }
    })
    if (eventSubject) {
      eventSubject.next({ type: 'catalog', data: catalog_items, timestamp: new Date().toISOString() });
      // todo 下一页
    } else {
      return catalog_items;
    }
  }
  private async _chapter_parse(response: AxiosResponse, eventSubject?: Subject<ItemEvent>) {
    // const spider: SpiderModel = await this.spiderModelService.find(1);
    const $ = cheerio.load(response.data);
    console.log($('div#txt').contents().length)
    $('div#txt').contents().each((_, element) => {
      console.log(typeof element, $(element).html())
    })
    // console.log($('div#txt')[1])
    // console.log($('div#txt')[2])
    const search_item: ChapterItem = {
      title: $('h1').text().trim(),
      content: $('div#txt').text().trim(),
    };
    if (eventSubject) {
      eventSubject.next({ type: 'chapter', data: search_item, timestamp: new Date().toISOString() });
    } else {
      return search_item;
    }
  }

  private _url(root: string, uri: string) {
    return (new URL(uri, root)).toString();
  }
}
