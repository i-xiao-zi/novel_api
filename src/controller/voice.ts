import { Controller, Get, Query } from '@nestjs/common';
import VoiceService from 'src/service/voice';
import { VoicesManagerFind } from 'edge-tts-universal';

@Controller('voice')
export default class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}
  
  @Get('voices')
  async voices(@Query('option') option: VoicesManagerFind | true = {Locale: 'zh-CN'}) {
    return this.voiceService.voices(option);
  }
  @Get('speak')
  async speak(@Query('text') text: string, @Query('voice') voice?: string) {
    return this.voiceService.speak(text, voice);
  }
  @Get('audio')
  async audio(@Query('id') id: string|number = 'https://www.biquge2345.com/zhangjie/613115/26583799.html', @Query('voice') voice?: string) {
    return this.voiceService.audio(id, voice);
  }

}
