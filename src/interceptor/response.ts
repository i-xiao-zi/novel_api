import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_INTERCEPTOR_KEY, ResponseInterceptorOptions } from '../decorator/response';

export interface Response<T> {
    code: number;
    message: string | string[];
    data: T;
}

@Injectable()
export default class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private readonly reflector: Reflector) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {

        // 获取装饰器配置
        const options = this.reflector.get<ResponseInterceptorOptions>(
            RESPONSE_INTERCEPTOR_KEY,
            context.getHandler(),
        );

        // 如果明确设置为 false，直接返回原始数据
        if (options?.enabled === false) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => ({
                code: 0,
                message: 'success',
                data: data,
            })),
        );
    }
}