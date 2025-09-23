// Mock simples para NextResponse
export class NextResponse {
  status: number;
  body: any;
  headers: Record<string, string>;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = {};
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers[key] = value as string;
      });
    }
  }

  json() {
    if (typeof this.body === 'string') {
      return Promise.resolve(JSON.parse(this.body));
    }
    return Promise.resolve(this.body);
  }

  static json(data: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }
}

// Mock simples para Request
export class Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    // Mock implementation
  }
}
