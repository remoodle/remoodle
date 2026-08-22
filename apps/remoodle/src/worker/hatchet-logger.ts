import {
  type LogExtra,
  Logger,
  LogLevelEnum,
  type LogLevel,
} from "@hatchet-dev/typescript-sdk/util/logger";
import { log } from "evlog";

type HatchetLogEvent = {
  source: "hatchet";
  module: "worker";
  operation: "hatchet";
  message: string;
  error?: Error;
  hatchet: {
    context: string;
    configuredLevel: LogLevel;
    level: Exclude<LogLevel, "OFF">;
    extra?: LogExtra;
    utilKey?: string;
  };
};

function isLevelEnabled(level: Exclude<LogLevel, "OFF">, configuredLevel: LogLevel) {
  return LogLevelEnum[level] >= LogLevelEnum[configuredLevel];
}

function emitHatchetLog(event: HatchetLogEvent) {
  switch (event.hatchet.level) {
    case "DEBUG":
      log.debug(event);
      return;
    case "WARN":
      log.warn(event);
      return;
    case "ERROR":
      log.error(event);
      return;
    default:
      log.info(event);
  }
}

export class EvlogHatchetLogger extends Logger {
  constructor(
    private readonly context: string,
    private readonly logLevel: LogLevel = "INFO",
  ) {
    super();
  }

  private write(
    level: Exclude<LogLevel, "OFF">,
    message: string,
    extra?: LogExtra,
    error?: Error,
    utilKey?: string,
  ) {
    if (!isLevelEnabled(level, this.logLevel)) {
      return;
    }

    emitHatchetLog({
      source: "hatchet",
      module: "worker",
      operation: "hatchet",
      message,
      ...(error ? { error } : {}),
      hatchet: {
        context: this.context,
        configuredLevel: this.logLevel,
        level,
        ...(extra && Object.keys(extra).length > 0 ? { extra } : {}),
        ...(utilKey ? { utilKey } : {}),
      },
    });
  }

  override debug(message: string, extra?: LogExtra) {
    this.write("DEBUG", message, extra);
  }

  override info(message: string, extra?: LogExtra) {
    this.write("INFO", message, extra);
  }

  override green(message: string, extra?: LogExtra) {
    this.write("INFO", message, extra);
  }

  override warn(message: string, error?: Error, extra?: LogExtra) {
    this.write("WARN", message, extra, error);
  }

  override error(message: string, error?: Error, extra?: LogExtra) {
    this.write("ERROR", message, extra, error);
  }

  override util(key: string, message: string, extra?: LogExtra) {
    this.write("DEBUG", message, extra, undefined, key);
  }
}

export const createHatchetLogger = (context: string, logLevel?: LogLevel) =>
  new EvlogHatchetLogger(context, logLevel);
