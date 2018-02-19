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

test('Overriding existing variables', function (t) {

  t.deepEqual(nvar({
    source: 'new=2\nexisting=2\nempty=2',
    target: {existing: '1', empty: ''}
  }), {new: '2', existing: '2', empty: '2'}, 'Overrides all existing variables by default.');

  t.deepEqual(nvar({
    override: 'all',
    source: 'new="2"\nexisting="2"\nempty="2"',
    target: {existing: '1', empty: ''}
  }), {new: '2', existing: '2', empty: '2'}, 'Overrides all existing variables when `override` is set to \'all\'.');

  t.deepEqual(nvar({
    override: 'empty',
    source: `new='2'\nexisting='2'\nempty='2'`,
    target: {existing: '1', empty: ''}
  }), {new: '2', existing: '1', empty: '2'}, 'Overrides empty variables only when `override` is set to \'empty\'.');

  t.deepEqual(nvar({
    override: 'none',
    source: 'new=2\nexisting=2\nempty=2',
    target: {existing: '1', empty: ''}
  }), {new: '2', existing: '1', empty: ''}, 'Does not override existing variables when `override` is set to \'none\'.');

  t.deepEqual(nvar({
    override: function (key, target) {return key[0] === 'e'},
    source: 'new=2\nexisting=2\nempty=2',
    target: {existing: '1', empty: ''}
  }), {existing: '2', empty: '2'}, 'Overrides based on the boolean result of an arbitrary function assigned to `override`.');

  t.throws(() => nvar({
    override: 'bogus',
    source: 'new=2\nexisting=2\nempty=2',
    target: {existing: '1', empty: ''}
  }), 'Throws an error when `override` is set to a bogus string value.');

  t.end();
})
