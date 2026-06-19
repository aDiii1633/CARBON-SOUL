import { GET } from '../../app/api/user/profile/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    userProfile: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Profile API Route (GET /api/user/profile)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (auth as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET();
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('should return user profile for authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    const mockProfile = {
      id: 'profile_1',
      userId: 'usr_123',
      country: 'IN',
      transportMode: 'car',
      dietType: 'omnivore',
      homeType: 'apartment',
      householdSize: 3,
      electricityKwh: 200,
      weeklyDriveKm: 50,
      flightsPerYear: 2,
    };

    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValueOnce(mockProfile);

    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.country).toBe('IN');
    expect(body.transportMode).toBe('car');
    expect(body.householdSize).toBe(3);
  });

  it('should return null profile if not yet onboarded', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_new' } });

    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toBeNull();
  });
});
