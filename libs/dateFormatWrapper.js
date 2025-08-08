//needed for now to avoid having to deal with dynamic import complexities
async function getDateFormat() {
  const { default: dateFormat } = await import('dateformat');
  return dateFormat;
}

module.exports = getDateFormat;
