const path = require('node:path');

module.exports = {
  apps: ['backend', 'frontend', 'orchestrator'].map((name) => ({
    name,
    cwd: path.join(__dirname, 'apps', name),
    script: 'bun',
    args: 'run start',
    interpreter: 'none',
  })),
};
