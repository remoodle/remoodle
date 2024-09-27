import pino from "pino";

const pinoOptions: pino.LoggerOptions = {
  base: undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const rootLogger = pino(pinoOptions);

export const logger = {
  common: rootLogger.child({ module: "common" }),
  api: rootLogger.child({ module: "api" }),
  notifier: rootLogger.child({ module: "notifier" }),
  scheduler: rootLogger.child({ module: "notifier::scheduler" }),
  grades: rootLogger.child({ module: "notifier::grades" }),
  deadlines: rootLogger.child({ module: "notifier::deadlines" }),
};
