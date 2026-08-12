import { EventEmitter } from 'events';

export interface Http3Options {
  hostname: string;
  port: string | number;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
  timeout?: number;
}

export class Http3Response extends EventEmitter {
  public statusCode: number;
  public headers: Record<string, string>;
  public data: Buffer = Buffer.from('');

  constructor(statusCode: number, headers: Record<string, string>) {
    super();
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

export class Http3Request extends EventEmitter {
  private options: Http3Options;

  constructor(options: Http3Options) {
    super();
    this.options = options;
  }

  async execute(): Promise<Http3Response> {
    // HTTP/3 is disabled as requested
    throw new Error('HTTP/3 is currently disabled in this build.');
  }

  write(chunk: any) {
    // No-op
  }

  end() {
    // No-op
  }
}

export function request(options: Http3Options, callback: (res: Http3Response) => void): Http3Request {
  const req = new Http3Request(options);
  req.execute().then(res => callback(res)).catch(err => {
    const errorRes = new Http3Response(500, {});
    // Wait for next tick to emit error to ensure listener is attached
    process.nextTick(() => {
        errorRes.emit('error', err);
    });
    callback(errorRes);
  });
  return req;
}
