let dateFormatPromise = import('dateformat').then(m => m.default);

const fs = require('fs');
const path = require('path');

const RestAPI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../settings/configs/RestAPI.json'), 'utf8')
);

class Logger {

    logger;
    consoleLogType = [];
    fileLogType = [];

    constructor() {
        this.#getFormattedDate().then(date => {
          this.logger = fs.createWriteStream('logs/log-' + date + '.txt', {
              flags: 'a'
          });
        });
        RestAPI.api.logging.console.forEach((item, i) => {
          this.consoleLogType.push(LogType[item]);
        });
        RestAPI.api.logging.file.forEach((item, i) => {
          this.fileLogType.push(LogType[item]);
        });
    }

    error (message) {
      return this.#log(LogType.ERROR, message);
    }

    warn (message) {
      return this.#log(LogType.WARN, message);
    }

    info (message) {
      return this.#log(LogType.INFO, message);
    }

    debug (message) {
      return this.#log(LogType.DEBUG, message);
    }

    #log(type, message) {
      this.#getFormattedDateTime().then(date => {
        if(this.#shouldLog(type, this.consoleLogType)) {
          console.log('[' + date + '] [ ' + this.#getPrefix(type, true) + ' ]:\x1b[37m ' + message + '\x1b[0m');
        }
        if(this.#shouldLog(type, this.fileLogType)) {
          this.logger.write('[ ' + this.#getPrefix(type, false) + ' ] [' + date + ']: ' + message + '\n');
        }
      });
    }

    #getPrefix(type, color) {
        switch (type) {
            case LogType.DEBUG:
                return color ? '\x1b[33mDEBUG\x1b[0m' : 'DEBUG';
            case LogType.INFO:
                return color ? '\x1b[94mINFO\x1b[0m' : 'INFO';
            case LogType.WARN:
                return color ? '\x1b[35mWARN\x1b[0m' : 'WARN';
            case LogType.ERROR:
                return color ? '\x1b[91mERROR\x1b[0m' : 'ERROR';
            default:
                console.log("defaulting")
                return color ? '\x1b[33mDEBUG\x1b[0m' : 'DEBUG';
        }
    }

    #shouldLog(type, currentLogLevel) {
        if (currentLogLevel.includes(type)) {
          return true;
        }
    }

    async #getFormattedDate() {
      const dateFormat = await dateFormatPromise;
      return dateFormat(new Date(), 'dd-mm-yyyy');
    }

    async #getFormattedDateTime() {
      const dateFormat = await dateFormatPromise;
      return dateFormat(new Date(), 'dd-mm-yyyy HH:mm:ss.l');
    }
}

const LogType = {
	DEBUG: Symbol("DEBUG"),
	INFO: Symbol("INFO"),
	WARN: Symbol("WARN"),
	ERROR: Symbol("ERROR")
}

module.exports = Logger;
