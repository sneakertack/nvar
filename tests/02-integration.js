const test = require('tape');
const sinon = require('sinon');
const nvar = require('../lib');

test('Handling missing input', function (t) {
  const cerr = sinon.stub(console, 'error');
  nvar();
  t.ok(cerr.calledOnce, '0-arg: Logs a warning when default \'.env\' file can\'t be found.');
  cerr.restore();
  // cerr.resetHistory();

  t.throws(() => nvar('./some-non-existent-path.sh'), /non-existent-path/, 'string-arg: Throws an error if the specified path can\'t be found.');

  t.end();
});
