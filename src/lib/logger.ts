type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 100;

export function log(level: LogLevel, message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  
  logs.unshift(entry);
  
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
  
  console[level](message, data);
}

export function getLogs(limit = 50) {
  return logs.slice(0, limit);
}

export const logger = {
  info: (message: string, data?: any) => log('info', message, data),
  warn: (message: string, data?: any) => log('warn', message, data),
  error: (message: string, data?: any) => log('error', message, data),
};
