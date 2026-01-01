import WebSocket from "isomorphic-ws";
import fetch from 'isomorphic-fetch';
import Message from "./message";
import { SpeekOption, Voice } from "./types";
import { generateId } from "./utils";
import { DRM } from "./drm";

export class EdgeTTS {
  private static _voices: Voice[];
  private _ws: WebSocket;
  private _messages: Map<string, any[]> = new Map();
  constructor() {
    console.log(`wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&Sec-MS-GEC=${DRM.generateSecMsGec()}&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=${generateId()}`);
    this._ws = new WebSocket(`wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&Sec-MS-GEC=${DRM.generateSecMsGec()}&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=${generateId()}`, {
      headers: {
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.2849.68.0.0.0 Safari/537.36 Edg/130.0.2849.68.0.0.0`,
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      }
    });
    this._ws.on('open', () => {
      console.log('> WebSocket connected')
    })
    this._ws.on('error', (event: WebSocket.ErrorEvent) => {
      console.log('> WebSocket error', event)
    })
    this._ws.on('message', (data: Buffer, isBinary: boolean) => {
      console.log('WebSocket message', data)
      if(isBinary) {
        const msg = Message.binary_parse(data);
        let queue = this._messages.get(msg["X-RequestId"]);
        if(queue !== undefined) {
          queue.push(msg);
          this._messages.set(msg["X-RequestId"], queue);
        }
        return;
      } else {
        const msg = Message.text_parse(data);
        let queue = this._messages.get(msg["X-RequestId"]);
        if(queue !== undefined) {
          queue.push(msg);
          this._messages.set(msg["X-RequestId"], queue);
        }
      }
    })
  }
  public static async voices(locale: string|undefined = 'zh-CN') {
    const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4');
    if(!response.ok) {
      throw new Error('Failed to fetch voices: ' + response.statusText)
    }
    EdgeTTS._voices = await response.json();
    EdgeTTS._voices = EdgeTTS._voices.filter(voice => locale && voice.Locale === locale);
    return EdgeTTS._voices;
  }
  public speak(text: string, option: SpeekOption) {
    const config_data = Message.config(option.boundary);
    this._ws.send(config_data);
    const requestId = generateId();
    this._messages.set(requestId, []);
    const xml_data = Message.xml(requestId, text, option);
    this._ws.send(xml_data);
    return new Promise((resolve, _) => {
      while(true) {
        let queue = this._messages.get(requestId);
        if(queue !== undefined) {
          if(queue.length > 0) {
            console.log(queue)
            resolve(queue);
          }
        }
      }
    })
    // while(!this._messages.has(requestId)) {
    //   await new Promise(resolve => setTimeout(resolve, 100));
    // }
  }
}
