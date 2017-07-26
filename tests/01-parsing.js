const test = require('tape');
const nvar = require('../lib');

// Test rig for parsing - Takes in assignment syntax as input, returns an object (to simulate an environment) with assignments made.
function nv(source, target = Object.create(null)) {return nvar({source, target});}
test('Test rig', function (t) { // Make sure the rig isn't entirely broken.
  const rigOk = nv('toast=kaya').toast === 'kaya';
  t.ok(rigOk, 'Test rig for parsing is correctly wired to the module\'s API.');
  if (!rigOk) {
    throw new Error('nv() test rig in '+__filename+' fails basic operation. Did the module API change? Rewire the test rig accordingly.');
  }
  t.end();
});

// Note: tests are less unit and more accumulative - successive sections may build upon functionality established in the preceding sections.
// E.g. after backslash-escaping has been introduced and tested, the subsequent single-quotes section may then test for the case of backslashes appearing within quotes.

test('Unquoted values', function (t) {
  t.deepEqual(nv('toast=kaya'), {toast: 'kaya'}, 'Handles basic unquoted assignment.');
  t.deepEqual(nv('toast=kaya nope'), {toast: 'kaya'}, 'Ignores non-assignments.');
  t.deepEqual(nv('toast=kaya eggs=hardboiled nope nope nope'), {toast: 'kaya', eggs: 'hardboiled'}, 'Accepts multiple assignments at the start of a single line.');
  t.deepEqual(nv('toast=kaya nope sorry=darling'), {toast: 'kaya'}, 'Ignores assignment-like statements once a non-assignment has been encountered.');

  t.end();
});

test("'export' Prefix", function (t) {
  t.deepEqual(nv('export toast=kaya'), {toast: 'kaya'}, "Accepts optional 'export' prefix at the start of assignment.");
  t.deepEqual(nv('export export toast=kaya'), {}, 'Only allows at most 1 optional prefix.');

  t.end();
});

// Canon: https://www.gnu.org/software/bash/manual/html_node/Escape-Character.html
test('Escaping with backslashes', function (t) {
  t.deepEqual(nv('toast=ka\\\nya'), {toast: 'kaya'}, 'Removes backslash-newline combination.');
  t.deepEqual(nv('science=`\\~\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\-\\=\\_\\+\\[\\]\\\\\\{\\}\\|\\;\\:\\\'\\"\\,\\.\\/\\<\\>\\?\\a\\b\\c\\1\\2\\3'), {science: '`~!@#$%^&*()-=_+[]\\{}|;:\'",./<>?abc123'}, 'Preserves literal value of character following a backslash.');
  t.deepEqual(nv('toast=ka\\ ya'), {toast: 'ka ya'}, 'Allows escaping of the space character in an unquoted value.');
  t.deepEqual(nv('to\\\nast\\\n=\\\nkaya'), {toast: 'kaya'}, 'Removes backslash-newline combinations even in the left side of an assignment.');
  t.deepEqual(nv('toa\\st=kaya'), {}, 'Does not otherwise work in the left side of an assignment.');

  t.end();
});

// Canon: https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html
test('Basic Parameter expansion', function (t) {
  // Modify the rig to provide a pre-existing variable for this secton.
  function nv2(source) {
    return nv(source, {style: 'retro'}); // Simulates an env which has a pre-existing environment variable 'style'.
  }
  t.equal(nv2('genre=$style').genre, 'retro', 'Handles basic parameter expansion (unbraced).');
  t.equal(nv2('genre=${style}').genre, 'retro', 'Handles basic parameter expansion (braced).');
  t.equal(nv2('superstyle=super$style').superstyle, 'superretro', 'Handles unbraced parameter expansion with literal prefix.');
  t.equal(nv2('direction=${style}grade').direction, 'retrograde', 'Handles braced parameter expansion with literal suffix.');
  t.equal(nv2('direction=$style\\grade').direction, 'retrograde', 'Handles demarcating the end of a variable name with a backslash in an unbraced expansion.');
  t.equal(nv2('dollarstyle=\\$style').dollarstyle, '$style', 'Does not expand if $-char is escaped.');
  t.equal(nv2('dollarbracestyle=$\\{style').dollarbracestyle, '${style', 'Does not expand if opening brace is escaped.');

  t.end();
});

// MAYBE-TODO: Advanced Parameter expansion, e.g. all the forms listed in https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html

// Canon: https://www.gnu.org/software/bash/manual/html_node/Single-Quotes.html
test('Escaping with single-quotes', function (t) {
  t.deepEqual(nv("toast='kaya'"), {toast: 'kaya'}, 'Does not include surrounding quotes in final value.');
  t.deepEqual(nv("toast='  kaya toast\t'"), {toast: '  kaya toast\t'}, 'Treats spaces and tabs literally.');
  t.deepEqual(nv("toast='kaya\ntoast'"), {toast: 'kaya\ntoast'}, 'Treats newlines literally.');
  t.deepEqual(nv("science='\\$\\`\\\n\\\\'"), {science: '\\$\\`\\\n\\\\'}, 'Prevents backslash-escaping.');
  t.deepEqual(nv("science='`~!@#$%^&*()-=_+[]\\{}|;:\",./<>?'"), {science: '`~!@#$%^&*()-=_+[]\\{}|;:",./<>?'}, 'Treats all other symbol characters (except single-quotes) literally.');

  t.end();
});

// Canon: https://www.gnu.org/software/bash/manual/html_node/Double-Quotes.html
test('Escaping with double-quotes', function (t) {
  t.deepEqual(nv('toast="kaya"'), {toast: 'kaya'}, 'Does not include surrounding quotes in final value.');
  t.deepEqual(nv('toast="  kaya toast\t"'), {toast: '  kaya toast\t'}, 'Treats spaces and tabs literally.');
  t.deepEqual(nv('toast="kaya\ntoast"'), {toast: 'kaya\ntoast'}, 'Treats newlines literally.');

  t.end();
});

test('Intense combinations of the above', function (t) {
  t.deepEqual(nv(`mixedbag='foo'bar"baz"`), {mixedbag: 'foobarbaz'}, 'Combo (incl. quoted element concatenation).');
  t.deepEqual(nv("SQ_style='it'\\''s okay'"), {SQ_style: "it's okay"}, 'Combo (incl. expected single-quoted usage and escaping).');
  t.equal(nvar({source: 'report="He said, \\"${message}\\"."', target: {message: `I said, "Everything's fine!"`}}).report, `He said, "I said, "Everything's fine!"."`, 'Combo (incl. quote literals in expanded parameters).');

  t.end();
});

test('Comments', function (t) {
  t.deepEqual(nv('# a comment\ntoast=kaya'), {toast: 'kaya'}, 'Ignores full-line comments (\'#\' at start of line).');
  t.deepEqual(nv('toast=kaya # a comment\neggs=hardboiled'), {toast: 'kaya', eggs: 'hardboiled'}, 'Ignores same-line comments (upon seeing space-hash (i.e. \' #\') till end of line).');
  t.deepEqual(nv('breakfast=toast\\ and\\ #-browns'), {breakfast: 'toast and #-browns'}, 'Doesnt\'t treat backslash-escaped space-hash as start of commentary.');
  t.deepEqual(nv("breakfast='toast and #-browns'"), {breakfast: 'toast and #-browns'}, 'Doesnt\'t treat space-hash within single-quotes as start of commentary.');
  t.deepEqual(nv('breakfast="toast and #-browns"'), {breakfast: 'toast and #-browns'}, 'Doesnt\'t treat space-hash within double-quotes as start of commentary.');

  t.end();
});
