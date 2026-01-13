import { Injectable } from '@nestjs/common';
import {
  EdgeTTS,
  Communicate,
  VoicesManager,
  VoicesManagerFind,
  VoicesManagerVoice
} from 'edge-tts-universal';
@Injectable()
export default class EdgeService {
  async voices(option: VoicesManagerFind | true = {Locale: 'zh-CN'}): Promise<VoicesManagerVoice[]> {
    const voicesManager = await VoicesManager.create();
    return voicesManager.find(option === true ? {} : option);
  }
  async speak(text: string, voice?: string) {
    const edgeTTS = new EdgeTTS(text, voice);
    return await edgeTTS.synthesize();
  }
}
