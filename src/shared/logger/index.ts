/**
 * Log levels supported by the application
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface for structured log messages
 */
interface LogMessage {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Logger utility for TypeScript frontend.
 * Currently wraps the console API, but structured for future Tauri integration.
 */
class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
  }

  /**
   * Format the log message structure
   */
  private formatLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): LogMessage {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Internal handler to output logs
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      const style = this.getConsoleStyle(level);
      const args = [`%c[${level.toUpperCase()}] ${message}`, style];

      if (context) {
        args.push(JSON.stringify(context, null, 2));
      }

      switch (level) {
        case 'debug':
          console.debug(...args);
          break;
        case 'info':
          console.info(...args);
          break;
        case 'warn':
          console.warn(...args);
          break;
        case 'error':
          console.error(...args);
          break;
      }
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #888; font-weight: bold';
      case 'info':
        return 'color: #00bfff; font-weight: bold';
      case 'warn':
        return 'color: #ffd700; font-weight: bold';
      case 'error':
        return 'color: #ff0000; font-weight: bold';
      default:
        return '';
    }
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
