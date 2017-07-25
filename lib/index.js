var fs = require('fs');

function nvar({
  path = '.env',
  source = null,
  target = process.env
} = {}) {
  // Get the input.
  if (!source) source = fs.readFileSync(path, 'utf8');
  }

  return target;
}

module.exports = nvar;
