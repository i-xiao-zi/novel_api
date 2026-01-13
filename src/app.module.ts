import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import AppController from './controller/app';
import AppService from './service/app';
import { HttpModule } from '@nestjs/axios';
import SpiderService from './service/spider';
import ModelService from "./service/model";
import SpiderController from './controller/spider';
import SpiderModelService from './service/model.spider';
import VoiceController from './controller/voice';
import ResponseInterceptor from './interceptor/response';
import HttpExceptionFilter from './filter/exception';
import BookModelService from './service/model.book';
import ChapterModelService from './service/model.chapter';
import EdgeService from './service/edge';
import VoiceService from './service/voice';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, SpiderController, VoiceController],
  providers: [AppService, EdgeService, VoiceService, SpiderService, ModelService, SpiderModelService, BookModelService, ChapterModelService, Reflector,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => new ResponseInterceptor(reflector),
      inject: [Reflector],
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }],
})
export class AppModule {}
