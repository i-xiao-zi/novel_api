import { Controller, Get } from '@nestjs/common';
import AppService from '../service/app';
import { ResponseInterceptor } from '../decorator/response';
import {EdgeTTS} from '../tts';

@Controller()
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getIndex() {
    return this.appService.getIndex();
  }
}
