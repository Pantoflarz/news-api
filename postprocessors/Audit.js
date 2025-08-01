require('dotenv').config();

const AuditLogger = require('../libs/AuditLogger');

async function Audit(req, res) {

    //event = access, authentication, modification
    //status - SUCCESS, ERROR
    //request -
      //action - HTTP Action
      //path - HTTP Path
      //actor - UserID
      //timestamp - timestamp
      //source - UA + IP
      //metadata - api key and refresh key (if provided) (obfuscated)
    //response -
        //http_code - HTTP code

    let status = "ERROR";

    if ([200, 201].includes(res.statusCode)) {
      status = "SUCCESS"
    }

    let ip = '';

    if (req.get('x-forwarded-for') !== undefined){
        let arr = req.get('x-forwarded-for').split(",");
        ip = arr[0];
    } else {
        ip = req.connection.remoteAddress.split(`:`).pop();
    }

    if (ip === "1" || ip === "127.0.0.1") {
        ip = process.env.DEVELOPMENT_PUBLIC_IP;
    }

    let requestObj = {
      action: req.method,
      path: req.path,
      actor: req.userId,
      timestamp: new Date(Date.now()),
      source: ip
    }

    if (req.get('x-rest-api-key') != null) {
      requestObj.metadata['x-rest-api-key'] = obfuscate(req.get('x-rest-api-key'));
    }

    if (req.get('x-rest-api-refresh-key') != null) {
      requestObj.metadata['x-rest-api-refresh-key'] = obfuscate(req.get('x-rest-api-refresh-key'));
    }

    let responseObj = {
      statusCode: res.statusCode
    }

    const helper = new AuditLogger();
    await helper.init();

    if (req.path.includes("/auth")) {
      helper.log("AUTHENTICATION", status, requestObj, responseObj);
    } else {
      helper.log("ACCESS", status, requestObj, responseObj);
    }
}

const obfuscate = (value, visibleChars = 6) => {
  if (!value || typeof value !== 'string') return '***';
  return `***${value.slice(-visibleChars)}`;
};

module.exports = Audit;
