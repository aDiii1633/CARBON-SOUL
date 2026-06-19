/**
 * Minimal structured logger for API routes.
 * Prefixes messages with context and respects NODE_ENV to reduce noise.
 */

type LogLevel = 'error' | 'warn' | 'info';

function shouldLog(level: LogLevel): boolean {
  // In test environment, suppress info and warn logs
  if (process.env.NODE_ENV === 'test') {
    return level === 'error';
  }
  return true;
}

function formatMessage(context: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${context}] ${message}`;
}

export const logger = {
  error(context: string, error: unknown): void {
    if (!shouldLog('error')) return;
    const message = error instanceof Error ? error.message : String(error);
    console.error(formatMessage(context, message));
    if (error instanceof Error && error.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  },

  warn(context: string, message: string): void {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage(context, message));
  },

  info(context: string, message: string): void {
    if (!shouldLog('info')) return;
    console.info(formatMessage(context, message));
  },
};
