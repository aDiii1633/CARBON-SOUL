import { GET } from '../../app/api/carbon/history/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    carbonLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Carbon History API Route (GET /api/carbon/history)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request('http://localhost');
    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it('should return paginated logs and metadata', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    const mockLogs = [
      { id: '1', category: 'transport', co2Kg: 10 },
      { id: '2', category: 'food', co2Kg: 5 },
    ];

    (prisma.carbonLog.findMany as jest.Mock).mockResolvedValueOnce(mockLogs);
    (prisma.carbonLog.count as jest.Mock).mockResolvedValueOnce(25);

    const req = new Request('http://localhost?page=2&limit=2');
    const response = await GET(req);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    
    expect(body.logs).toHaveLength(2);
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(2);
    expect(body.pagination.totalItems).toBe(25);
    expect(body.pagination.totalPages).toBe(13); // ceil(25 / 2)
  });

  it('should clamp limit and page to valid values', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    (prisma.carbonLog.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.carbonLog.count as jest.Mock).mockResolvedValueOnce(0);

    const req = new Request('http://localhost?page=-5&limit=500');
    const response = await GET(req);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    
    expect(body.pagination.page).toBe(1); // Clamped from -5
    expect(body.pagination.limit).toBe(100); // Clamped from 500
  });
});
