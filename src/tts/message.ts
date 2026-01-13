import { SpeekOption, Response, ResponseAudio } from "./types";

export default class Message {
    static config(boundary: 'sentence' | 'word' | false = 'sentence', outputFormat: string = 'audio-24khz-48kbitrate-mono-mp3') {
        return `X-Timestamp:${new Date().toUTCString()}\r\n`
        + `Content-Type:application/json; charset=utf-8\r\n`
        + `Path:speech.config\r\n\r\n`
        + `{`
        +     `"context":`
        +     `{`
        +         `"synthesis":`
        +         `{`
        +             `"audio":`
        +             `{`
        +                 `"metadataoptions":`
        +                 `{`
        +                     `"sentenceBoundaryEnabled":"${boundary === 'sentence'}",`
        +                     `"wordBoundaryEnabled":"${boundary === 'word'}"`
        +                 `},`
        +                 `"outputFormat":"${outputFormat}"`
        +             `}`
        +         `}`
        +     `}`
        + `}\r\n`;
    }

    static xml(requestId: string, data: string|string[], option: SpeekOption){
        let prosody = '';
        if(typeof data === 'string') {
            prosody = `<prosody pitch='${option.pitch}' rate ='${option.rate}' volume='${option.volume}'>${data}</prosody>`;
        } else {
            prosody = data.map((item) => `<prosody pitch='${option.pitch}' rate ='${option.rate}' volume='${option.volume}'>${item}</prosody>`).join('');
        }
        return `X-RequestId:${requestId}\r\n`
            + `Content-Type:application/ssml+xml\r\n`
            + `X-Timestamp:${new Date().toUTCString()}Z\r\n`  // This is not a mistake, Microsoft Edge bug.
            + `Path:ssml\r\n\r\n`
            + `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>`
            +   `<voice name='${option.voice}'>`
            +       `${prosody}`
            +   `</voice>`
            + `</speak>`
    }
    static text_parse(message: Buffer): Response {
        const headerLength = message.indexOf('\r\n\r\n');
        const result: { [key: string]: string } = {};
        const headerString = message.subarray(0, headerLength).toString('utf-8');
        if (headerString) {
            const headerLines = headerString.split('\r\n');
            for (const line of headerLines) {
            const [key, value] = line.split(':', 2);
            if (key && value) {
                result[key] = value.trim();
            }
            }
        }
        result['data'] = JSON.parse(message.subarray(headerLength + 2).toString('utf-8'));
        return result as unknown as Response;
    }
    static binary_parse(message: Buffer) {
        const headerLength = message.readUInt16BE(0);
        const result: { [key: string]: any } = {};
        const headerString = message.subarray(2, headerLength + 2).toString('utf-8');
        if (headerString) {
            const headerLines = headerString.split('\r\n');
            for (const line of headerLines) {
            const [key, value] = line.split(':', 2);
            if (key && value) {
                result[key] = value.trim();
            }
            }
        }
        result['data'] = message.subarray(headerLength + 2);
        return result as unknown as ResponseAudio;
    }
}