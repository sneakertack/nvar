var fs = require('fs');

function bootstrap(opts) {
  // opts currently unused.
  const lines = fs.readFileSync('.env', 'utf8').split('\n').map(l => l.split('=').map(s => s.trim()));
  for (line of lines) {
    process.env[line[0]] = line[1];
  }
}

module.exports = bootstrap;
