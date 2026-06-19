import { POST } from '../../app/api/ai/tips/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    streak: { findUnique: jest.fn() },
    userProfile: { findUnique: jest.fn() },
    carbonLog: { findMany: jest.fn() },
  },
}));

// Mock Anthropic generator
jest.mock('../../lib/ai/anthropic', () => ({
  generatePersonalizedTips: jest.fn().mockImplementation(() => {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"text": "Test tips"}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
  }),
}));

describe('AI Tips API Route (POST /api/ai/tips)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should stream AI response for authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce({ currentStreak: 5, level: 2 });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValueOnce({ transportMode: 'car' });
    (prisma.carbonLog.findMany as jest.Mock).mockResolvedValueOnce([{ category: 'food', co2Kg: 10 }]);

    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ query: 'How to save energy?', forceFresh: true }) 
    });
    
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });
});
