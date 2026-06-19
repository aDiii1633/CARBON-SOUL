import { POST } from '../../app/api/auth/register/route';
import { prisma } from '../../lib/db/prisma';
import { insforge } from '../../lib/db/insforge';

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

jest.mock('../../lib/db/insforge', () => ({
  insforge: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

describe('Register API Route (POST /api/auth/register)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid data', async () => {
    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ email: 'not-an-email', password: '123' }) 
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should return 400 if InsForge sign-up fails', async () => {
    (insforge.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already in use' }
    });

    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test' }) 
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Email already in use');
  });

  it('should return 201 on successful registration', async () => {
    (insforge.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'usr_123' } },
      error: null
    });

    (prisma.$transaction as jest.Mock).mockResolvedValueOnce({ id: 'usr_123' });

    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test' }) 
    });
    const response = await POST(req);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.userId).toBe('usr_123');
  });
});
