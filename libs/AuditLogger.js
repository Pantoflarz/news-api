let dateFormatPromise = import('dateformat').then(m => m.default);

const fs = require('fs');

class AuditLogger {

    #logger;

    constructor() {
      this.#logger = null;
    }

    async init() {
      const date = await this.#getFormattedDate();
      this.#logger = fs.createWriteStream('logs/audit/audit-log-' + date + '.txt', {
          flags: 'a'
      });
    }

    log (type, status, requestObj, responseObj) {
      let log = {
        type: type,
        status: status,
        timestamp: requestObj.timestamp,
        request: requestObj,
        response: responseObj
      }
      this.#logger.write(JSON.stringify(log) + '\n');
      this.#logger.end();
    }

    async #getFormattedDate() {
      const dateFormat = await dateFormatPromise;
      return dateFormat(new Date(), 'dd-mm-yyyy');
    }

}

module.exports = AuditLogger;
