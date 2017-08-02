// Directly load source on Node 6+, load transpiled version otherwise.
module.exports = parseInt(/^v(\d+)/.exec(process.version)[1]) >= 6 ? require('./nvar') : require('./nvar-es5');
