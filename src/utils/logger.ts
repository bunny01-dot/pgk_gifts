export const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
  },
  warn: (message: string, context?: any) => {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...context }));
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...context
    }));
  }
};
