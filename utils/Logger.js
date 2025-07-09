const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const Config = require('../settings/configs/ConfigLoader.js');

const logConfig = Config.apiConfig.logging;
const logLevel = process.env.LOG_LEVEL || logConfig.level || 'info';

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

const { combine, timestamp, printf, errors, colorize } = format;

// Console format
const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ timestamp, level, message, module, ...meta }) => {
    return `[ ${level} ] [ ${module || 'app'} ]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

// JSON log format with optional module label
const jsonFileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  printf(({ timestamp, level, message, module, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      module: module || 'app',
      message,
      ...meta,
    });
  })
);

// Base logger instance
const baseLogger = createLogger({
  level: logLevel,
  transports: [],
});

// Add transports with their formats
if (logConfig.console !== false) {
  baseLogger.add(
    new transports.Console({
      format: consoleFormat,
    })
  );
}

if (logConfig.file !== false) {
  const date = new Date().toISOString().split('T')[0];
  baseLogger.add(
    new transports.File({
      filename: path.join("logs", `log-${date}.json`),
      format: jsonFileFormat,
    })
  );
}

// Factory to return a tagged logger
function getLogger(moduleName) {
  return {
    info: (msg, meta) => baseLogger.info(msg, { module: moduleName, ...meta }),
    error: (msg, meta) => baseLogger.error(msg, { module: moduleName, ...meta }),
    debug: (msg, meta) => baseLogger.debug(msg, { module: moduleName, ...meta }),
    warn: (msg, meta) => baseLogger.warn(msg, { module: moduleName, ...meta }),
  };
}

module.exports = getLogger;
