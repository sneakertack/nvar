const test = require('tape');
const nvar = require('../lib');

// Helper to initialise new instances for each test.
function nv(source) {return nvar({source, target: Object.create(null)});}

// Note: tests are less unit and more accumulative - successive sections may build upon functionality established in the preceding sections.
// E.g. after backslash-escaping has been introduced and tested, the subsequent single-quotes section may then test for the case of backslashes appearing within quotes.

test('Unquoted values', function (t) {
  t.deepEqual(nv('toast=kaya'), {toast: 'kaya'}, 'Handles basic unquoted assignment.');
  t.deepEqual(nv('toast=kaya nope'), {toast: 'kaya'}, 'Ignores non-assignments.');
  t.deepEqual(nv('toast=kaya eggs=hardboiled nope nope nope'), {toast: 'kaya', eggs: 'hardboiled'}, 'Accepts multiple assignments at the start of a single line.');
  t.deepEqual(nv('toast=kaya nope sorry=darling'), {toast: 'kaya'}, 'Ignores assignment-like statements once a non-assignment has been encountered.');

  t.end();
});

// Canon: https://www.gnu.org/software/bash/manual/html_node/Escape-Character.html
test('Escaping with backslashes', function (t) {
  t.deepEqual(nv('toast=ka\\\nya'), {toast: 'kaya'}, 'Removes backslash-newline combination.');
  t.deepEqual(nv('science=`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\=\\_\\+\\[\\]\\\\\\{\\}\\|\\;\\:\\\'\\"\\,\\.\\/\\<\\>\\?\\a\\b\\c\\1\\2\\3'), {science: 'science=`~!@#$%^&*()-=_+[]\\{}|;:\'",./<>?abc123'}, 'Preserves literal value of character following a backslash.');
  t.deepEqual(nv('toast=ka\\ ya'), {toast: 'ka ya'}, 'Allows escaping of the space character in an unquoted value.');

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
