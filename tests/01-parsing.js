const test = require('tape');
const nvar = require('nvar');

// Create new instances as required for each test.
function nv(source) {return nvar({source, target: Object.create(null)});}

test('Escaping with single-quotes', function (t) {
  t.deepEqual(nv("toast='kaya'"), {toast: 'kaya'}, 'Does not include surrounding quotes in final value.');
  t.deepEqual(nv("toast='  kaya toast\t'"), {toast: '  kaya toast\t'}, 'Treats spaces and tabs literally.');
  t.deepEqual(nv("toast='kaya\ntoast'"), {toast: 'kaya\ntoast'}, 'Treats newlines literally.');
  t.deepEqual(nv("science='\\$\\`\\\n\\\\'"), {science: '\\$\\`\\\n\\\\'}, 'Prevents backslash-escaping.');
  t.deepEqual(nv("science='`~!@#$%^&*()-=_+[]\\{}|;:\",./<>?'"), {science: '`~!@#$%^&*()-=_+[]\\{}|;:",./<>?'}, 'Treats all other symbol characters (except single-quotes) literally.');

  t.end();
});
