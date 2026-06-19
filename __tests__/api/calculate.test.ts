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
    $transaction: jest.fn(),
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
    
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 400 Bad Request if validation fails', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    // Missing required fields
    const mockReq = {
      json: async () => ({
        category: 'invalid_category',
      }),
    } as unknown as Request;

    const response = await POST(mockReq);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Invalid input data');
  });

  it('should execute transaction and return 200 on valid data input', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    
    const mockTxResult = {
      carbonLog: { id: 'log_999', co2Kg: 8.5 },
      streak: { currentStreak: 3, level: 1 },
      newBadges: [],
      pointsEarned: 15,
    };
    (prisma.$transaction as jest.Mock).mockResolvedValueOnce(mockTxResult);

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
    expect(body.carbonLog.id).toBe('log_999');
    expect(body.pointsEarned).toBe(15);
  });
});
