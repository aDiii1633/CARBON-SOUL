import { POST } from '../../app/api/user/onboarding/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

describe('Onboarding API Route (POST /api/user/onboarding)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid profile data', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ dietType: 'invalid-diet' }) 
    });
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should process onboarding successfully with valid data', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });
    (prisma.$transaction as jest.Mock).mockResolvedValueOnce(true);

    const req = new Request('http://localhost', { 
      method: 'POST', 
      body: JSON.stringify({ 
        country: 'IN',
        transportMode: 'car',
        dietType: 'vegan',
        homeType: 'house',
        householdSize: 2,
        electricityKwh: 150,
        weeklyDriveKm: 20,
        flightsPerYear: 0
      }) 
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
