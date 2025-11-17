import pino from "pino";
import path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: isDevelopment ? "debug" : "info",

  // Development: pretty console output
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  }),

  // Production: structured JSON logs to file with rotation
  ...(!isDevelopment && {
    transport: {
      targets: [
        {
          target: "pino/file",
          options: {
            destination: path.join(process.cwd(), "logs", "app.log"),
            mkdir: true
          },
          level: "info"
        },
        {
          target: "pino/file",
          options: {
            destination: path.join(process.cwd(), "logs", "error.log"),
            mkdir: true
          },
          level: "error"
        },
        {
          target: "pino-pretty",
          options: {
            destination: 1, // stdout
            colorize: false
          },
          level: "info"
        }
      ]
    }
  })
});
