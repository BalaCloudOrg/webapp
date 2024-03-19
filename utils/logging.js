const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "app.log",
    }),
  ],
});

module.exports = logger;
