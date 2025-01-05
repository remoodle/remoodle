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

const pinoLogger = pino(pinoOptions);

export const logger = {
  api: pinoLogger.child({ module: "api" }),
  cluster: pinoLogger.child({ module: "cluster" }),
};
