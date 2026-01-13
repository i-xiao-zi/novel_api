import { Controller, Get, Query, Sse } from '@nestjs/common';
import VoiceService from 'src/service/voice';
import { VoicesManagerFind } from 'edge-tts-universal';
import { ResponseInterceptor } from 'src/decorator/response';
import { map } from 'rxjs';

@Controller('voice')
export default class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}
  
  @Get('list')
  async voices(@Query('option') option: VoicesManagerFind | true = {Locale: 'zh-CN'}) {
    return this.voiceService.list(option);
  }
  @Get('speak')
  async speak(@Query('text') text: string, @Query('voice') voice?: string) {
    return this.voiceService.speak(text, voice);
  }
  @Get('audio')
  async audio(@Query('id') id: string|number = 'https://www.biquge2345.com/zhangjie/613115/26583799.html', @Query('voice') voice?: string) {
    return this.voiceService.audio(id, voice);
  }

  @ResponseInterceptor(false)
  @Sse('book')
  async book(@Query('id') id: number, @Query('gt') gt: number = 0, @Query('voice') voice?: string) {
    return this.voiceService.book(id, gt, voice).pipe(map((event,index) => ({
        id: index,
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      }))
    );
  }
}
