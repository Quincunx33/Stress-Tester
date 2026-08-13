import { connectAsync } from '@currentspace/http3';
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
  private session: any;
  private stream: any;
  private options: Http3Options;

  constructor(options: Http3Options) {
    super();
    this.options = options;
  }

  async execute(): Promise<Http3Response> {
    try {
      const port = this.options.port || 443;
      const session = await connectAsync(`${this.options.hostname}:${port}`, {
        runtimeMode: 'auto',
        fallbackPolicy: 'warn-and-fallback'
      });

      const headers = {
        ':method': this.options.method,
        ':path': this.options.path,
        ':authority': this.options.hostname,
        ':scheme': 'https',
        ...this.options.headers
      };

      this.stream = session.request(headers, { 
        endStream: !this.options.body 
      });

      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.stream?.destroy();
          reject(new Error('HTTP/3 request timeout'));
        }, this.options.timeout || 5000);

        this.stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        this.stream.on('end', () => {
          clearTimeout(timeout);
          const response = new Http3Response(200, {});
          response.data = Buffer.concat(chunks);
          resolve(response);
        });
        this.stream.on('error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });

        if (this.options.body) {
          this.stream.write(this.options.body);
        }
        this.stream.end();
      });

    } catch (error) {
      throw new Error(`HTTP/3 failed: ${error}`);
    }
  }

  write(chunk: any) {
    if (this.stream) this.stream.write(chunk);
  }

  end() {
    if (this.stream) this.stream.end();
  }
}

export function request(options: Http3Options, callback: (res: Http3Response) => void): Http3Request {
  const req = new Http3Request(options);
  req.execute().then(res => callback(res)).catch(err => {
    const errorRes = new Http3Response(500, {});
    errorRes.emit('error', err);
    callback(errorRes);
  });
  return req;
}
