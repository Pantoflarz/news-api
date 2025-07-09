const fs = require('fs');
const path = require('path');

class ConfigLoader {
  constructor() {
    const filePath = path.join(__dirname, 'RestAPI.json');
    this.config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  get apiConfig() {
    return this.config.api ?? null;
  }

  get scopesConfig() {
    return this.config.scopes ?? null;
  }

}

module.exports = new ConfigLoader();
