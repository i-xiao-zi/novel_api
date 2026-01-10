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
import { Subject } from 'rxjs';
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
    console.log(title, content);
    const tts = new EdgeTTS(content, voice);
    const res = await tts.synthesize();
    return {
      subtitle: res.subtitle,
      audio: Buffer.from(await res.audio.arrayBuffer()).toString('base64')
    };
  }

  public book(id: number, voice?: string) {
      const eventSubject = new Subject<ItemEvent>();
      this.chapterModelService.book(id).then((chapters) => {
        chapters.map((chapter) => {
          const title = chapter.title || '';
          const content = cheerio.load(chapter.content || '').text();
          if(!content.trim()) {
            return;
          }
          const tts = new EdgeTTS(`${title}\n${content}`, voice);
          tts.synthesize().then((res) => {
            res.audio.arrayBuffer().then(audio => {
              this.chapterModelService.update(chapter.id!, {
                subtitle: res.subtitle,
                audio: Buffer.from(audio),
              });
              eventSubject.next({
                type: 'chapter',
                data: chapter.title,
                timestamp: Date.now().toString(),
              });
            })
          });
        });
      }).finally(() => {
        eventSubject.next({
          type: 'complete',
          data: undefined,
          timestamp: Date.now().toString(),
        });
      })
      return eventSubject.asObservable();
    }
}
