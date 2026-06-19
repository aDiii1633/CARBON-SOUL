import { POST } from '../../app/api/carbon/calculate/route';
import { GET } from '../../app/api/streaks/route';
import { auth } from '../../auth';
import { prisma } from '../../lib/db/prisma';

// Mock auth session
jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock('../../lib/db/prisma', () => ({
  prisma: {
    streak: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    badge: {
      findMany: jest.fn(),
    },
    carbonLog: {
      count: jest.fn(),
    },
  },
}));

describe('Streaks API Route (GET /api/streaks)', () => {
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

  it('should return streak, badges, and challenge data for authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    const mockStreak = {
      currentStreak: 5,
      longestStreak: 10,
      lastActiveDate: '2026-06-19',
      totalPoints: 250,
      level: 2,
    };

    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce(mockStreak);
    (prisma.badge.findMany as jest.Mock).mockResolvedValueOnce([
      { badgeId: 'first-log', name: 'Footprint Finder', description: 'First log', earnedAt: new Date() },
    ]);
    (prisma.carbonLog.count as jest.Mock).mockResolvedValueOnce(3);

    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.streak.currentStreak).toBe(5);
    expect(body.streak.longestStreak).toBe(10);
    expect(body.streak.totalPoints).toBe(250);
    expect(body.badges).toHaveLength(1);
    expect(body.challenge.progress).toBe(3);
    expect(body.challenge.target).toBe(5);
    expect(body.challenge.completed).toBe(false);
  });

  it('should auto-create streak record for new users', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_new' } });

    const newStreak = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalPoints: 0,
      level: 1,
    };

    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.streak.create as jest.Mock).mockResolvedValueOnce(newStreak);
    (prisma.badge.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.carbonLog.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.streak.currentStreak).toBe(0);
    expect(body.challenge.completed).toBe(false);
  });

  it('should mark challenge as completed when 5+ logs this week', async () => {
    (auth as jest.Mock).mockResolvedValueOnce({ user: { id: 'usr_123' } });

    (prisma.streak.findUnique as jest.Mock).mockResolvedValueOnce({
      currentStreak: 7, longestStreak: 7, lastActiveDate: '2026-06-19', totalPoints: 500, level: 3,
    });
    (prisma.badge.findMany as jest.Mock).mockResolvedValueOnce([]);
    (prisma.carbonLog.count as jest.Mock).mockResolvedValueOnce(8);

    const response = await GET();
    const body = await response.json();
    expect(body.challenge.completed).toBe(true);
    expect(body.challenge.progress).toBe(5); // capped at target
  });
});
