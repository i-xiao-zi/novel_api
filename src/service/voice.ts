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

@Injectable()
export default class VoiceService {
  constructor(private readonly spiderService: SpiderService, private readonly chapterModelService: ChapterModelService, private readonly edgeService: EdgeService) {}
  async voices(option: VoicesManagerFind | true = {Locale: 'zh-CN'}): Promise<VoicesManagerVoice[]> {
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
    if (typeof id === 'string') {
      let chapter = await this.spiderService.chapter(id);
      title = chapter?.title || '';
      content = chapter?.content || '';
    } else {
      let chapter = await this.chapterModelService.find(id);
      title = chapter?.title || '';
      content = chapter?.content || '';
    }
    if (!content) {
      return null;
    }
    content = cheerio.load(`${title}\n${content}`).text();
    const tts = new EdgeTTS(`${title}\n${content}`, voice);
    const res = await tts.synthesize();
    return {
      subtitle: res.subtitle,
      audio: Buffer.from(await res.audio.arrayBuffer()).toString('base64')
    };
  }
}
