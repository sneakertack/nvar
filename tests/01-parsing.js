const test = require('tape');
const nvar = require('../lib');

// Helper to initialise new instances for each test.
function nv(source) {return nvar({source, target: Object.create(null)});}

test('Unquoted values', function (t) {
  t.deepEqual(nv('toast=kaya'), {toast: 'kaya'}, 'Handles basic unquoted assignment.');
  t.deepEqual(nv('toast=kaya nope'), {toast: 'kaya'}, 'Ignores non-assignments.');
  t.deepEqual(nv('toast=kaya eggs=hardboiled nope nope nope'), {toast: 'kaya', eggs: 'hardboiled'}, 'Accepts multiple assignments at the start of a single line.');
  t.deepEqual(nv('toast=kaya nope sorry=darling'), {toast: 'kaya'}, 'Ignores assignment-like statements once a non-assignment has been encountered.');

  t.end();
});

// Canon: https://www.gnu.org/software/bash/manual/html_node/Single-Quotes.html
test('Escaping with single-quotes', function (t) {
  t.deepEqual(nv("toast='kaya'"), {toast: 'kaya'}, 'Does not include surrounding quotes in final value.');
  t.deepEqual(nv("toast='  kaya toast\t'"), {toast: '  kaya toast\t'}, 'Treats spaces and tabs literally.');
  t.deepEqual(nv("toast='kaya\ntoast'"), {toast: 'kaya\ntoast'}, 'Treats newlines literally.');
  t.deepEqual(nv("science='\\$\\`\\\n\\\\'"), {science: '\\$\\`\\\n\\\\'}, 'Prevents backslash-escaping.');
  t.deepEqual(nv("science='`~!@#$%^&*()-=_+[]\\{}|;:\",./<>?'"), {science: '`~!@#$%^&*()-=_+[]\\{}|;:",./<>?'}, 'Treats all other symbol characters (except single-quotes) literally.');

  t.end();
});
