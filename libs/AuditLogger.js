let dateFormatPromise = import('dateformat').then(m => m.default);

const fs = require('fs');

class AuditLogger {

    constructor() {

    }

    log (type, status, requestObj, responseObj) {
      let log = {
        type: type,
        status: status,
        timestamp: requestObj.timestamp,
        request: requestObj,
        response: responseObj
      }
      this.#getFormattedDate().then(date => {
        const logger = fs.createWriteStream('logs/audit/audit-log-' + date + '.txt', {
            flags: 'a'
        });
        logger.write(JSON.stringify(log) + '\n');
        logger.end();
      });
    }

    async #getFormattedDate() {
      const dateFormat = await dateFormatPromise;
      return dateFormat(new Date(), 'dd-mm-yyyy');
    }

}

module.exports = AuditLogger;
