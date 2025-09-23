import '@testing-library/jest-dom'

// Mock para jose/openid-client para evitar problemas de parsing
jest.mock('jose', () => ({
  compactDecrypt: jest.fn(),
  // Adicione outras funções do jose que forem necessárias
}));

jest.mock('openid-client', () => ({
  // Mock básico para openid-client
  Issuer: {
    discover: jest.fn(),
  },
  // Adicione outras propriedades/mock que forem necessárias
}));

// Mock para @panva/hkdf
jest.mock('@panva/hkdf', () => ({
  hkdf: jest.fn(),
}));

// Mock para preact e preact-render-to-string
jest.mock('preact', () => ({
  createElement: jest.fn(),
  Fragment: 'Fragment',
}));

jest.mock('preact-render-to-string', () => ({
  render: jest.fn(),
  renderToString: jest.fn(),
  shallowRender: jest.fn(),
}));

// Mock para next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'test-session-id' }),
    set: jest.fn(),
  }),
  headers: jest.fn().mockReturnValue(new Map()),
}));

// Mock para next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  }),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}));
