import { Controller, Get } from '@nestjs/common';
import AppService from '../service/app';
import { ResponseInterceptor } from '../decorator/response';

@Controller()
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ResponseInterceptor(false)
  getIndex(): string {
    return this.appService.getIndex();
  }
}
