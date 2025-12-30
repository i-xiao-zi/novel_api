import { Controller, Get, Sse } from '@nestjs/common';
import AppService from '../service/app';
import SpiderService from '../service/spider';

@Controller('voice')
export default class VoiceController {
  constructor(private readonly appService: AppService, private readonly spiderService: SpiderService) {}
  
  // @Sse('cover')
  // async cover(): Promise<Observable<ItemEvent>> {
  //   return this.spiderService.cover('https://www.biquge2345.com/xiaoshuo/036310/').pipe(map((event,index) => ({
  //       id: index,
  //       type: event.type,
  //       data: event.data,
  //       timestamp: event.timestamp,
  //     }))
  //   );
  // }

  // @Get('book')
  // async book(): Promise<{code: number, msg: string, data: SpiderModel[]}> {
  //   const {data, error} = await this.supabaseService.from('spider').select('*');
  //   if (error) {
  //     return {
  //       code: 1,
  //       msg: error.message,
  //       data: [],
  //     };
  //   }
  //   return {
  //     code: 0,
  //     msg: 'success',
  //     data: data,
  //   };
  // }
  // @Get('/chapter')
  // async chapter(): Promise<{code: number, msg: string, data: SpiderModel[]}> {
  //   const {data, error} = await this.supabaseService.from('spider').select('*');
  //   if (error) {
  //     return {
  //       code: 1,
  //       msg: error.message,
  //       data: [],
  //     };
  //   }
  //   return {
  //     code: 0,
  //     msg: 'success',
  //     data: data,
  //   };
  // }
}
