import { Injectable } from '@nestjs/common';
import EdgeService from './edge';
import * as fs from 'fs/promises';
import ChapterModelService from './model.chapter';

@Injectable()
export default class AppService {
  constructor(private readonly edgeService: EdgeService, private readonly chapterModelService: ChapterModelService) {
  }
  async getIndex() {
    return await this.chapterModelService.book(21);
  }
}
