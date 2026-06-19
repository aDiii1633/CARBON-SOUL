import { POST } from '../../app/api/carbon/calculate/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

// Mock auth session
jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    carbonLog: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
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
    dailyAction: {
      findMany: jest.fn(),
    },
  },
}));

describe('Calculate Carbon Log API Route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);

    const mockReq = {
      json: async () => ({}),
    } as unknown as Request;

    const response = await POST(mockReq);
    expect(response.status).toBe(401);
  });

  it('should return 400 Bad Request if validation fails', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    const mockReq = {
      json: async () => ({
        category: 'invalid_category',
      }),
    } as unknown as Request;

    const response = await POST(mockReq);
    expect(response.status).toBe(400);
  });

  it('should execute transaction and return 200 on valid data input', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    
    // Mock DB operations within the transaction
    (prisma.carbonLog.create as jest.Mock).mockResolvedValueOnce({ id: 'log_999', co2Kg: 8.5 });
    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce(null); // Force streak creation
    (prisma.streak.create as jest.Mock).mockResolvedValueOnce({ id: 'str_1', currentStreak: 0, level: 1 });
    (prisma.streak.update as jest.Mock).mockResolvedValueOnce({ currentStreak: 1, level: 1 });
    (prisma.badge.findMany as jest.Mock).mockResolvedValueOnce([]); // User has no badges

    const mockReq = {
      json: async () => ({
        category: 'transport',
        activity: 'Petrol car travel',
        amount: 50,
        unit: 'km',
        co2Kg: 8.5,
      }),
    } as unknown as Request;

    const response = await POST(mockReq);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.streak).toBeDefined();
    expect(prisma.carbonLog.create).toHaveBeenCalled();
    expect(prisma.streak.create).toHaveBeenCalled();
    expect(prisma.streak.update).toHaveBeenCalled();
  });

  it('should process correctly when co2Kg is zero', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    
    // Mock DB operations within the transaction
    (prisma.carbonLog.create as jest.Mock).mockResolvedValueOnce({ id: 'log_100', co2Kg: 0 });
    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'str_1', currentStreak: 5, lastActiveDate: new Date().toISOString() });
    (prisma.streak.update as jest.Mock).mockResolvedValueOnce({ currentStreak: 6 });
    (prisma.badge.findMany as jest.Mock).mockResolvedValueOnce([]);

    const mockReq = {
      json: async () => ({
        category: 'energy',
        activity: 'Electricity',
        amount: 100,
        unit: 'kWh',
        co2Kg: 0,
      }),
    } as unknown as Request;

    const response = await POST(mockReq);
    expect(response.status).toBe(200);
    expect(prisma.carbonLog.create).toHaveBeenCalled();
  });
});
