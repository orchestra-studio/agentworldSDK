import "server-only";

export interface LogContext {
  userId?: string;
  agent?: string;
  tool?: string;
  runId?: string;
  taskId?: string;
  [key: string]: unknown;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: string, message: string, data?: Record<string, unknown>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    };

    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}]`, message, logEntry);
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log("warn", message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
    };
    this.log("error", message, errorData);
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }

  traceTool(toolName: string, input: unknown, output: unknown, duration: number) {
    this.info("Tool execution", {
      tool: toolName,
      input,
      output,
      durationMs: duration,
    });
  }
}

export function createLogger(context: LogContext = {}) {
  return new Logger(context);
}

