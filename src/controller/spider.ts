import { Controller, Get, Query, Sse } from '@nestjs/common';
import SpiderService from '../service/spider';
import { map } from 'rxjs/operators';
import { ResponseInterceptor } from '../decorator/response';

@Controller('spider')
export default class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  @ResponseInterceptor(false)
  @Sse('book')
  async book(@Query('url') url: string = 'https://www.biquge2345.com/xiaoshuo/036310/') {
    return this.spiderService.book(url).pipe(map((event,index) => ({
        id: index,
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      }))
    );
  }
  @ResponseInterceptor(false)
  @Sse('single')
  async single(@Query('url') url: string = 'https://www.biquge2345.com/zhangjie/613115/26583799.html') {
    return this.spiderService.single(url).pipe(map((event,index) => ({
        id: index,
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      }))
    );
  }
  @Get('search')
   search(@Query('keywords') keywords: string = '万古神帝') {
    return this.spiderService.search(keywords);
  }

  @Get('cover')
  cover(@Query('url') url: string = 'https://www.biquge2345.com/xiaoshuo/036310/') {
    return this.spiderService.cover(url);
  }

  @Get('catalog')
  catalog(@Query('url') url: string = 'https://www.biquge2345.com/xiaoshuo/036310/') {
    return this.spiderService.catalog(url);
  }

  @Get('chapter')
  chapter(@Query('url') url: string = 'https://www.biquge2345.com/zhangjie/613115/26583799.html') {
    return this.spiderService.chapter(url);
  }
}
