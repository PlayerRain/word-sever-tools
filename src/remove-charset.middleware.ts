import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RemoveCharsetMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = (key: string, value: any) => {
      if (key.toLowerCase() === 'content-type' && typeof value === 'string') {
        value = value.split(';')[0];
      }
      return originalSetHeader(key, value);
    };
    next();
  }
}