import { Injectable } from '@nestjs/common';
import EdgeService from './edge';
import * as fs from 'fs/promises';

@Injectable()
export default class AppService {
  constructor(private readonly edgeService: EdgeService) {
  }
  async getIndex() {
    // const voices = await this.edgeService.voices();
    // console.log(voices);
    // Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)
    let tts = await this.edgeService.speak('现在就开始你的Python Edge TTS之旅吧！无论是开发语音助手、制作有声内容，还是实现实时语音交互，这个强大的工具都能为你提供稳定可靠的支持。🌟', 'Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)')
    console.log(tts.subtitle);
    const audioBuffer = Buffer.from(await tts.audio.arrayBuffer());
    await fs.writeFile('output.mp3', audioBuffer);
    return tts;
  }
}
