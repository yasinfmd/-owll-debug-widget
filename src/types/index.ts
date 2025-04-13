// src/types.ts

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
}



export interface DebugOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme?: 'light' | 'dark' | 'auto';
}

export interface NetworkLog  {
    id: string;
    timestamp: number;
    type: 'fetch' | 'xhr';
    method: string;
    url: string;
    status?: number;
    statusText?: string;
    requestHeaders?: Record<string, string>;
    requestBody?: any;
    responseHeaders?: Record<string, string>;
    responseBody?: any;
    requestQuery?: Record<string, string>;
    startTime: number;
    endTime?: number;
    duration?: number;
    error?: any;
  };