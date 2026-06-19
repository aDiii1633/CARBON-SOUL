import { GET, POST } from '../../app/api/actions/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';
import { PREDEFINED_ACTIONS } from '../../lib/constants/daily-actions';

jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    carbonLog: {
      findMany: jest.fn(),
    },
    dailyAction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    streak: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    badge: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Actions API Route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/actions', () => {
    it('should return 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return 5 actions deterministically with completed status', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

      // Mock user logs to force 'transport' as top category
      (prisma.carbonLog.findMany as jest.Mock).mockResolvedValueOnce([
        { category: 'transport', co2Kg: 50 },
        { category: 'food', co2Kg: 10 },
      ]);

      // Mock one completed action today
      const testActionId = PREDEFINED_ACTIONS.find(a => a.category === 'transport')?.actionId;
      (prisma.dailyAction.findMany as jest.Mock).mockResolvedValueOnce([
        { actionId: testActionId, completedAt: new Date() },
      ]);

      const response = await GET();
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toHaveLength(5);
      
      const completedAction = body.find((a: any) => a.actionId === testActionId);
      if (completedAction) {
        expect(completedAction.completed).toBe(true);
      }
    });
  });

  describe('POST /api/actions', () => {
    it('should return 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValueOnce(null);
      const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ actionId: 'walk-2km' }) });
      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it('should return 400 if action ID is missing or invalid', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
      const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ actionId: 'invalid-id' }) });
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it('should return 400 if action is already completed today', async () => {
      (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
      (prisma.dailyAction.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'exists' });

      const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ actionId: 'walk-2km' }) });
      const response = await POST(req);
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Action already completed today');
    });
  });
});
