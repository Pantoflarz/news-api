function getClientIp(req) {
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const remote = req.connection?.remoteAddress || '';
  return remote.split(':').pop();
}

module.exports = getClientIp;
