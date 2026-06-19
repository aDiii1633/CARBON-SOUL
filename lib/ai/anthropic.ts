import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, UserContext } from './prompts';

const apiKey = process.env.ANTHROPIC_API_KEY;
const isMock = !apiKey || apiKey.startsWith('mock-');

const client = !isMock
  ? new Anthropic({ apiKey })
  : null;

export async function generatePersonalizedTips(userContext: UserContext) {
  if (isMock || !client) {
    // Return a mock readable stream that streams a response for local testing
    return new ReadableStream({
      async start(controller) {
        const textEncoder = new TextEncoder();
        const sendChunk = (text: string) => {
          controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        };

        const mockResponse = `Hi there! I am EcoBot, your carbon footprint advisor. 
Based on your logs, your top emission category is **${userContext.topCategory}**. Currently, you are at Level **${userContext.level}** with a **${userContext.streak}-day streak**!

Here is my personalized advice for you:
1. **Reduce Transport Impact**: Since transport emissions are high, try walking, cycling, or using public transit for trips under 5km. You'll save roughly 0.17 kg CO2 per km.
2. **Eco-friendly Habits**: Go meat-free today (saves ~2.5 kg CO2) and turn off any standby appliances (saves ~0.1 kg CO2).

Keep up the great work! Let me know if you want a 7-day eco challenge.`;

        // Stream the text chunk by chunk to simulate real API streaming
        const chunks = mockResponse.match(/.{1,8}/g) || [mockResponse];
        for (const chunk of chunks) {
          sendChunk(chunk);
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
        controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
  }

  // Real Anthropic stream
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: buildSystemPrompt(userContext),
    messages: [{ role: 'user', content: userContext.query }],
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();
      try {
        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
export type { UserContext };
