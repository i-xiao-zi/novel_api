import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as Cheerio from 'cheerio';

@Injectable()
export default class EdgeService {
  getHello(): string {
    return 'Hello World!';
  }
  async search(): Promise<string> {
    const html = await axios.get('https://www.baidu.com');
    const $ = Cheerio.load(html.data);
    const title = $('title').text();
    return title;
  }
}
