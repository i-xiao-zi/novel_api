
export interface VoiceTag {
  /** Content categories that the voice is optimized for */
  ContentCategories: string[];
  /** Personality traits that describe the voice's characteristics */
  VoicePersonalities: string[];
};

export interface Voice {
  Name: string;
  ShortName: string;
  Gender: "Female" | "Male";
  Locale: string;
  SuggestedCodec: string;
  FriendlyName: string;
  Status: string;
  VoiceTag: VoiceTag;
}
export interface SpeekOption {
  voice: string;
  boundary: 'sentence' | 'word' | false;
  rate?: string;
  volume?: string;
  pitch?: string;
}
export interface ResponseTurnStart {
  context: {
    serviceTag: string;
    audio: {
      type: string;
      streamId: string;
    }
  }
}
export interface ResponseResponse {
  context: {
    serviceTag: string;
    audio: {
      type: string;
      streamId: string;
    }
  }
}

export interface ResponseTurnStart {
  context: {
    serviceTag: string;
    audio: {
      type: string;
      streamId: string;
    }
  }
}

export interface ResponseMetadata {
  Metadata: {
    Type: string;
    Data: {
      Offset: number;
      Duration: number;
      text: {
        Text: string;
        Length: number;
        BoundaryType: string;
      }
    }
  }[];
}

export interface Response<T = any> {
  'X-RequestId': string;
  'Content-Type': string | 'application/json; charset=utf-8';
  Path: string | 'turn.start' | 'response' | 'audio.metadata' | 'turn.end';
  data: T;
}
export interface ResponseAudio {
  'X-RequestId': string;
  'Content-Type': string | 'application/json; charset=utf-8';
  'X-StreamId': string;
  data: Buffer;
}