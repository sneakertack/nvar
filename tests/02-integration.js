const test = require('tape');
const sinon = require('sinon');
const nvar = require('../lib');

test('Handling missing input', function (t) {
  const cerr = sinon.stub(console, 'error');
  nvar();
  t.ok(cerr.calledOnce, '0-arg: Logs a warning when default `.env` file can\'t be found.');

  t.throws(() => nvar('./some-non-existent-path.sh'), /non-existent-path/, 'string-arg: Throws an error if the specified path can\'t be found.');

  cerr.resetHistory();
  nvar({});
  t.ok(cerr.calledOnce, 'opts-arg: Logs a warning if file was not found and `path` was unspecified.');
  t.throws(() => nvar({path: './some-non-existent-path.sh'}), /non-existent-path/, 'opts-arg: Throws an error if file was not found and `path` was specified.');

  cerr.resetHistory();
  nvar({enoent: null}); nvar({path: './nonexistent.sh', enoent: null});
  t.ok(cerr.notCalled, 'Always remains silent when `enoent` is overriden to null.');

  cerr.resetHistory();
  nvar({enoent: 'warn'}); nvar({path: './nonexistent.sh', enoent: 'warn'});
  t.ok(cerr.calledTwice, 'Always logs a warning when `enoent` is overriden to \'warn\'.');

  t.throws(() => nvar({enoent: 'error'}), 'Throws an error when `enoent` is overriden to \'error\' (path unspecified).');
  t.throws(() => nvar({path: './nonexistent.sh', enoent: 'error'}), 'Throws an error when `enoent` is overriden to \'error\' (path specified).');

  t.end();
});
