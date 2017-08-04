if (!(parseInt(/v(\d+)/.exec(process.version)[1]) >= 6)) require('babel-register')({only: /tests\/[\w\-]+.js/});

require('./01-parsing');
require('./02-integration');
require('./03-functional');
