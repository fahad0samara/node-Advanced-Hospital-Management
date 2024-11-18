const winston = require('winston');
const path = require('path');

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/audit.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const auditLog = (action, userId, resourceType, resourceId, details) => {
  logger.info({
    action,
    userId,
    resourceType,
    resourceId,
    details,
    timestamp: new Date()
  });
};

const errorLog = (error, context) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date()
  });
};

module.exports = {
  auditLog,
  errorLog
};