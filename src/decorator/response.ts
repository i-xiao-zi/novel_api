import { SetMetadata } from '@nestjs/common';

export const RESPONSE_INTERCEPTOR_KEY = 'response_interceptor_options';

export interface ResponseInterceptorOptions {
  enabled?: boolean;      // 是否启用拦截器
  customMessage?: string; // 自定义消息
  customCode?: number;    // 自定义状态码
}

export const ResponseInterceptor = (options?: boolean | ResponseInterceptorOptions) => {
  let config: ResponseInterceptorOptions;
  
  if (typeof options === 'boolean') {
    config = { enabled: options };
  } else if (typeof options === 'object') {
    config = options;
  } else {
    config = { enabled: true }; // 默认启用
  }
  
  return SetMetadata(RESPONSE_INTERCEPTOR_KEY, config);
};