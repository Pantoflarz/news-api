require('dotenv').config();

const AuditLogger = require('../libs/AuditLogger');

const getClientIp = require('../utils/getClientIp.js');

const getLogger = require('../utils/Logger.js');
const logger = getLogger('Audit PostProcessor');

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

  let ip = getClientIp(req);

  if (ip === '1' || ip === '127.0.0.1') {
    ip = process.env.DEVELOPMENT_PUBLIC_IP;
  }

  const requestObj = {
    action: req.method,
    path: req.path,
    actor: req.userId,
    timestamp: new Date().toISOString(),
    source: ip,
    metadata: {}
  };

  const apiKey = req.get('x-rest-api-key');
  if (apiKey != null) requestObj.metadata['x-rest-api-key'] = obfuscate(apiKey);

  const refreshKey = req.get('x-rest-api-refresh-key');
  if (refreshKey != null) requestObj.metadata['x-rest-api-refresh-key'] = obfuscate(refreshKey);

  const responseObj = {
    statusCode: res.statusCode
  };

  try {
    const helper = new AuditLogger();
    await helper.init();

    const eventType = req.path.includes('/auth') ? 'AUTHENTICATION' : 'ACCESS';
    await helper.log(eventType, status, requestObj, responseObj);
  } catch (error) {
    // Optionally log or rethrow error if you want to track Audit failures
    logger.error('📋 Audit logging failed: ', error);
  }
}

const obfuscate = (value, visibleChars = 6) => {
  if (!value || typeof value !== 'string') return '';
  return `***${value.slice(-visibleChars)}`;
};

module.exports = Audit;
