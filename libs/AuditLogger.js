const { getDateFormat } = require('./dateFormatWrapper.js');
const fs = require('fs');

class AuditLogger {

    #logger;

    constructor() {
      this.#logger = null;
    }

    async init() {
      const dateFormat = await getDateFormat();
      const date = dateFormat(new Date(), 'dd-mm-yyyy');
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
