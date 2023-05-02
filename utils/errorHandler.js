// log errors to MongoDB using Winston
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.MongoDB({
      level: 'error',
      db: process.env.MONGODB_URI,
      options: { useUnifiedTopology: true }
    })
  ]
});

// express error handling middleware
function errorHandler(error, req, res, next) {
  // log error to console and MongoDB using Winston
  logger.error(error);

  // send error response to client
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
}

module.exports = errorHandler;
