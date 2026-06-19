import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { generatePersonalizedTips, UserContext } from '@/lib/ai/anthropic';
import { logger } from '@/lib/utils/logger';

// In-memory rate limiter: Record<userId, { count: number, resetTime: number }>
const rateLimits: Record<string, { count: number; resetTime: number }> = {};

// In-memory cache for tips page to save API calls: Record<userId, { tips: string, expiresAt: number }>
const tipsCache: Record<string, { tips: string; expiresAt: number }> = {};

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Simple Rate Limiting (max 20 requests per hour)
    const now = Date.now();
    const limit = rateLimits[userId];
    if (limit) {
      if (now < limit.resetTime) {
        if (limit.count >= 20) {
          return NextResponse.json({ error: 'Rate limit exceeded. Max 20 queries per hour.' }, { status: 429 });
        }
        limit.count += 1;
      } else {
        rateLimits[userId] = { count: 1, resetTime: now + 3600000 };
      }
    } else {
      rateLimits[userId] = { count: 1, resetTime: now + 3600000 };
    }

    // 3. Parse user query & context (sanitize to prevent prompt injection)
    const body = await req.json();
    const rawQuery = typeof body.query === 'string' ? body.query : 'Give me personalized tips to reduce my carbon footprint today.';
    // Strip HTML tags and limit length
    const query = rawQuery.replace(/<[^>]*>/g, '').trim().slice(0, 500);
    const forceFresh = body.forceFresh || false;

    // 4. Check cache for general tips query
    const cacheKey = `${userId}:${query.substring(0, 50)}`;
    if (!forceFresh && tipsCache[cacheKey] && tipsCache[cacheKey].expiresAt > now) {
      // Stream the cached content
      const cachedContent = tipsCache[cacheKey].tips;
      return new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: cachedContent })}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        }
      );
    }

    // 5. Gather user data from database for context
    const [streak, profile, logs] = await Promise.all([
      prisma.streak.findUnique({ where: { userId } }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.carbonLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    // Calculate top emission category
    const categoryTotals: Record<string, number> = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      waste: 0,
    };
    logs.forEach((log) => {
      if (categoryTotals[log.category] !== undefined) {
        categoryTotals[log.category] += log.co2Kg;
      }
    });

    let topCategory = 'transport';
    let maxEmissions = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxEmissions) {
        maxEmissions = val;
        topCategory = cat;
      }
    });

    const userCarbonSummary = `Logs logged: ${logs.length}.
Breakdown (last 30 logs):
- Transport: ${categoryTotals.transport.toFixed(1)} kg CO2e
- Energy: ${categoryTotals.energy.toFixed(1)} kg CO2e
- Food: ${categoryTotals.food.toFixed(1)} kg CO2e
- Shopping: ${categoryTotals.shopping.toFixed(1)} kg CO2e
- Waste: ${categoryTotals.waste.toFixed(1)} kg CO2e
Profile details: Transport mode = ${profile?.transportMode || 'car'}, Diet = ${profile?.dietType || 'omnivore'}.`;

    const userContext: UserContext = {
      userCarbonSummary,
      topCategory,
      level: streak?.level || 1,
      streak: streak?.currentStreak || 0,
      query,
    };

    // 6. Generate AI response stream
    const readableStream = await generatePersonalizedTips(userContext);

    // To cache the stream, we can intercept the stream text and cache it
    let fullResponse = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        // Extract content to save in cache
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.text) fullResponse += data.text;
            } catch {
              // ignore
            }
          }
        }
        controller.enqueue(chunk);
      },
      flush() {
        if (fullResponse) {
          // Cache response for 6 hours
          tipsCache[cacheKey] = {
            tips: fullResponse,
            expiresAt: Date.now() + 6 * 3600000,
          };
        }
      },
    });

    const pipedStream = readableStream.pipeThrough(transformStream);

    return new Response(pipedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('POST /api/ai/tips', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
