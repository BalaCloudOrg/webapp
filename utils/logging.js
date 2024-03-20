const winston = require("winston");

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DDTHH:mm:ss.SSSZ",
    }),
    winston.format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "app.log",
      level: "debug",
    }),
  ],
});

module.exports = logger;
