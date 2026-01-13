import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  EdgeTTS,
  Communicate,
  VoicesManager,
  VoicesManagerFind,
  VoicesManagerVoice
} from 'edge-tts-universal';
import SpiderService from './spider';
import EdgeService from './edge';
import ChapterModelService from './model.chapter';
import { map, Subject } from 'rxjs';
import { ItemEvent } from './spider.interface';

@Injectable()
export default class VoiceService {
  constructor(private readonly spiderService: SpiderService, private readonly chapterModelService: ChapterModelService, private readonly edgeService: EdgeService) {}
  async list(option: VoicesManagerFind | true = {Locale: 'zh-CN'}): Promise<VoicesManagerVoice[]> {
    const voicesManager = await VoicesManager.create();
    return voicesManager.find(option === true ? {} : option);
  }
  async speak(text: string, voice?: string) {
    const edgeTTS = new EdgeTTS(text, voice);
    return await edgeTTS.synthesize();
  }
  async audio(id: string|number, voice?: string) {
    let title = '';
    let content = '';
    if (!isNaN(parseFloat(id as string))) {
      let chapter = await this.chapterModelService.find(Number(id));
      title = chapter?.title || '';
      content = chapter?.content || '';
    } else {
      let chapter = await this.spiderService.chapter(id as string);
      title = chapter?.title || '';
      content = chapter?.content || '';
    }
    if (!content) {
      return null;
    }
    content = cheerio.load(`${title}\n${content}`).text();
    const tts = new EdgeTTS(content, voice);
    const res = await tts.synthesize();
    return {
      subtitle: res.subtitle,
      audio: Buffer.from(await res.audio.arrayBuffer()).toString('base64')
    };
  }

  public book(id: number, gt: number = 0, voice?: string) {
      const eventSubject = new Subject<ItemEvent>();
      console.log('book', id, voice);
      (async () => {
        const total = await this.chapterModelService.count(id, gt);
        const pages = Math.ceil(total / 100);
        for(let i = 0; i < pages; i++) {
          console.log('page', i, '/', pages);
          const chapters = await this.chapterModelService.page(id, i, 100, gt);
          await Promise.all(chapters.map(async chapter => {
            const title = chapter.title || '';
            const content = cheerio.load(chapter.content || '').text();
            if(!chapter.audio && chapter.content && content.trim()) {
              console.log(chapter.id, title)
              try {
                const tts = new EdgeTTS(`${title}\n${content}`, voice);
                const res = await tts.synthesize();
                await this.chapterModelService.client.storage.from('app_novels').upload(`${id}/${chapter.id}.mp3`, res.audio);
                await this.chapterModelService.client.storage.from('app_novels').upload(`${id}/${chapter.id}.json`, JSON.stringify(res.subtitle));
                await this.chapterModelService.update(chapter.id!, {audio: true});
                console.log('==========>', chapter.id, title)
                eventSubject.next({
                  type: 'chapter',
                  data: chapter.title,
                  timestamp: Date.now().toString(),
                });
              } catch (error) {
                console.log(chapter.id, title, error);
              }
            }
          }));
        }
      })()
      return eventSubject.asObservable();
    }
}
