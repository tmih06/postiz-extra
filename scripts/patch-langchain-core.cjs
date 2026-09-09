const fs = require('fs');
const path = require('path');

const corePkgPath = path.resolve(__dirname, 'node_modules/@langchain/core/package.json');
if (fs.existsSync(corePkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
  if (!pkg.exports['./runnables/remote']) {
    pkg.exports['./runnables/remote'] = {
      types: './dist/runnables/remote.d.ts',
      default: './dist/runnables/remote.js'
    };
    fs.writeFileSync(corePkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('Successfully patched @langchain/core ./runnables/remote export');
  }
}
