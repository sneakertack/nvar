if (!(parseInt(/v(\d+)/.exec(process.version)[1]) >= 6)) require('babel-register');

require('./01-parsing');
require('./02-integration');
