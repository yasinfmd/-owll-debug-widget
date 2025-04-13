import { createDebugButton } from '../ui/button';
import { LogEntry, LogLevel, DebugOptions, NetworkLog } from '../types';

let logs: LogEntry[] = [];

const defaultOptions: DebugOptions = {
  position: 'bottom-right',
  theme: 'dark'
};

export function initializeDebugWidget(options: DebugOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  
  const logMethods = ['log', 'info', 'warn', 'error', 'debug'];

  logMethods.forEach(method => {
    console[method] = (...args) => {
      const logEntry = createLogEntry(method as LogLevel, args);
      logs.push(logEntry);
      originalConsole[method].apply(console, args);
    };
  });

  const button = createDebugButton(mergedOptions);
  document.body.appendChild(button);
  patchFetch();
  patchXMLHttpRequest();
}

function createLogEntry(level: LogLevel, args: any[]): LogEntry {
  return {
    id: generateId(),
    timestamp: Date.now(),
    level,
    message: args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '),
    data: args.length > 0 ? args[0] : undefined
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function getLogsByLevel(level: LogLevel): LogEntry[] {
  return logs.filter(log => log.level === level);
}

export function clearLogs(): void {
  logs = [];
}

const networkLogs: NetworkLog[] = [];

const parseQueryParams = (url: string): Record<string, string> => {
  try {
    const query: Record<string, string> = {};
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  } catch {
    return {};
  }
};

const patchFetch = () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (...args: any[]): Promise<Response> => {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';
    const requestQuery = parseQueryParams(url);
    const startTime = Date.now();

    const networkEntry: NetworkLog = {
      id: crypto.randomUUID(),
      timestamp: startTime,
      type: 'fetch',
      method,
      url,
      requestQuery,
      startTime,
      requestHeaders: init?.headers || {},
      requestBody: init?.body || null
    };

    try {
      const response = await originalFetch(
         // @ts-ignore
        ...args);
      const clonedResponse = response.clone();
      const endTime = Date.now();
      networkEntry.status = response.status;
      networkEntry.statusText = response.statusText;
      networkEntry.endTime = endTime;
      networkEntry.duration = endTime - startTime;
      networkEntry.responseHeaders = Object.fromEntries(clonedResponse.headers.entries());
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        try {
          const jsonResponse = await clonedResponse.json();
          networkEntry.responseBody = jsonResponse;
        } catch (e) {
          console.error("JSON parse error:", e);
          networkEntry.responseBody = null;
        }
      } else {
        networkEntry.responseBody = await clonedResponse.text();
      }
      networkLogs.push(networkEntry);

      console.groupCollapsed(`🌐 FETCH ${method} ${url} [${response.status}] (${networkEntry.duration}ms)`);
      console.log(networkEntry);
      console.groupEnd();
      return response;
    } catch (error) {
      const endTime = Date.now();
      networkEntry.endTime = endTime;
      networkEntry.duration = endTime - startTime;
      networkEntry.status = 0;
      networkEntry.statusText = 'No Response (Network Error)';
      networkEntry.error = error instanceof Error ? error.message : 'Network Error';
      networkLogs.push(networkEntry);

      console.groupCollapsed(`❌ FETCH ${method} ${url} [NO RESPONSE]`);
      console.error('Network error - no response from server');
      console.log(networkEntry);
      console.groupEnd();

      throw error;
    }
  };
};

const patchXMLHttpRequest = () => {
  const OriginalXMLHttpRequest = globalThis.XMLHttpRequest;

  class PatchedXMLHttpRequest extends OriginalXMLHttpRequest {
    private requestUrl: string = '';
    private method: string = '';
    private requestBody: any = null;
    private startTime: number = 0;
    private requestHeaders: Record<string, string> = {};
    private requestQuery: Record<string, string> = {};
    private networkEntry?: NetworkLog;

    open(method: string, url: string, async?: boolean, username?: string | null, password?: string | null): void {
      this.method = method;
      this.requestUrl = url;
      this.requestQuery = parseQueryParams(url);
      super.open(method, url, async ?? true, username ?? null, password ?? null);
    }

    setRequestHeader(header: string, value: string): void {
      this.requestHeaders[header] = value;
      super.setRequestHeader(header, value);
    }

    send(body?: Document | BodyInit | null): void {
      this.requestBody = body;
      this.startTime = Date.now();

      this.networkEntry = {
        id: crypto.randomUUID(),
        timestamp: this.startTime,
        type: 'xhr',
        method: this.method,
        url: this.requestUrl,
        startTime: this.startTime,
        requestHeaders: this.requestHeaders,
        requestBody: body ? body.toString() : null,
        requestQuery: this.requestQuery
      };

      this.addEventListener('load', () => {
        const endTime = Date.now();
        this.networkEntry!.status = this.status;
        this.networkEntry!.statusText = this.statusText;
        this.networkEntry!.endTime = endTime;
        this.networkEntry!.duration = endTime - this.startTime;
        this.networkEntry!.responseHeaders = this.parseResponseHeaders();

        if (this.getResponseHeader('Content-Type')?.includes('application/json')) {
          try {
            this.networkEntry!.responseBody = JSON.parse(this.responseText);
          } catch (e) {
            console.error("JSON parse error:", e);
            this.networkEntry!.responseBody = null;
          }
        } else {
          this.networkEntry!.responseBody = this.responseText;
        }

        networkLogs.push(this.networkEntry!);

        console.groupCollapsed(`📡 XHR ${this.method} ${this.requestUrl} [${this.status}] (${this.networkEntry!.duration}ms)`);
        console.log(this.networkEntry);
        console.groupEnd();
      });

      this.addEventListener('error', () => {
        const endTime = Date.now();
        this.networkEntry!.endTime = endTime;
        this.networkEntry!.duration = endTime - this.startTime;
        this.networkEntry!.status = 0;
        this.networkEntry!.statusText = 'No Response (Network Error)';
        this.networkEntry!.error = 'Network Error';
        networkLogs.push(this.networkEntry!);

        console.groupCollapsed(`❌ XHR ${this.method} ${this.requestUrl} [NO RESPONSE]`);
        console.error('Network error - no response from server');
        console.log(this.networkEntry);
        console.groupEnd();
      });

      super.send(
        // @ts-ignore
        body);
    }

    private parseResponseHeaders(): Record<string, string> {
      const headers: Record<string, string> = {};
      const headerString = this.getAllResponseHeaders();
      headerString.trim().split(/[\r\n]+/).forEach(line => {
        const parts = line.split(': ');
        const header = parts.shift();
        const value = parts.join(': ');
        if (header) {
          headers[header] = value;
        }
      });
      return headers;
    }
  }

  globalThis.XMLHttpRequest = PatchedXMLHttpRequest;
};

function getNetworkLogs(): NetworkLog[] {
  return networkLogs;
}

function getNetworkLogsByStatus(status: string): NetworkLog[] {
  if (status === 'all') {
    return networkLogs;
  }

  const isSuccess = status === 'success';
  return networkLogs.filter(entry => {
    if (isSuccess && entry.status) {
      return entry.status >= 200 && entry.status < 300;
    } else {
      return entry.status && (entry.status < 200 || entry.status >= 300);
    }
  });
}

function clearNetworkLogs(): void {
  networkLogs.length = 0;
}

export { getNetworkLogs, getNetworkLogsByStatus, clearNetworkLogs, patchFetch, patchXMLHttpRequest };
