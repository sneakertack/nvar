module.exports = nvar;

function nvar(opts) {
  if (typeof opts === 'string') opts = {path: opts}; // String argument shorthand.
  const pathExplicitlySpecified = !!(opts || {}).path;
  let { // Destructure opts while stating defaults.
    path = '.env',
    source = null,
    target = process.env,
    enoent = pathExplicitlySpecified ? 'error' : 'warn',
    override = 'all'
  } = (opts || {});

  // Get the input.
  try {
    if (!source) source = require('fs').readFileSync(path, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      if (!enoent) return;
      if (enoent === 'warn') return console.error(`nvar did not assign any values, as it could not locate ${path}.`);
    } // 'error' (or any other value) should bubble the error.
    throw e;
  }

  // Controls assignment over existing pre-defined variables (via the `override` configuration option).
  let assignmentAllower;
  switch (typeof override) {
    case 'function':
      assignmentAllower = override;
      break;
    case 'string':
      assignmentAllower = {
        all: () => true,
        empty: (key, target) => !target[key],
        none: (key, target) => target[key] === undefined
      }[override];
      if (assignmentAllower) break;
    default:
      throw new Error("[nvar] `override` should be set to 'all', 'empty', 'none', or a function.");
  }

  // Do very procedural processing by character, because we need to enter and exit a lot of modes.
  let mode = 'n';
  let i = 0;
  let marker; // Temp variable (usually to mark the start position of a word).
  let word, key; // Temporary word storage.
  let exportPrefixEncountered;
  let quoteMode, escapeMode;
  while (source[i] !== undefined) {
    let char = source[i]; // Refresh what char is.
    // console.log(mode, i, [source[i-1], char, source[i+1]].map(x => x || '').join(''));
    switch (mode) {
      case 'n': // Start state.
        while (/\s/.test(char)) {char = source[++i];} // Advance across whitespace.
        if (char === '#') {mode = 'x'; break;} // Hash? It's a comment for the rest of the line.
        if (/[a-z_]/i.test(char)) {marker = i++; mode = 'k'; break;} // Looks like it could be the start of the key declaration (LHS of assignment).
        throw new Error('[nvar] Unexpected character \''+char+'\' (position '+i+')');
      case 'k': // Suspected key declaration.
        while (/\w/.test(char = source[i]) && char !== undefined) ++i; // Advance while valid variable characters.
        if (char === '=') {word = source.slice(marker, i); mode = 'v'; break;} // Yup, it's a legitimate assignment.
        if (char === '\\') { // Encountered a backslash? Only backslash-newlines are allowed on the LHS.
          if (source[i+1] === '\n') { // Pass, carry on. We'll strip the backslash-newline later during the actual assignment operation.
            i += 2;
            if (source[i] === '=') {word = source.slice(marker, i); mode = 'v';} // In addition in the edge case of an equal immediately following, switch accordingly.
            break;
          }
          // Otherwise it's disallowed, flow down to the x-modeswitch.
        } else if (/[\t ]/.test(char) && (word = source.slice(marker, i)) === 'export' && !exportPrefixEncountered) {
          exportPrefixEncountered = true;
          mode = 'n';
          break;
        }
        mode = 'x'; // Otherwise it looks like it's bogus. Disregard till end of line.
        break;
      case 'v': // Value declaration.
        key = word.replace(/\\\n/g, ''); // Help strip the key; also free up the word variable to be used for other things.
        word = '';
        quoteMode = null;
        marker = ++i; // Get past the =.
        while (mode === 'v' && (char = source[i])) {
          switch (quoteMode) {
            case 's':
              while ((char = source[i]) && char !== "'") i++;
              word += source.slice(marker, i);
              marker = ++i;
              quoteMode = null;
              break;
            case 'd':
              if (char === '\\') {
                word += parameterExpand(source.slice(marker, i));
                if (['\n', '"', '$', '\\'].indexOf(source[i + 1]) === -1) word += ('\\'+source[i + 1]);
                if (['"', '$', '\\'].indexOf(source[i + 1]) > -1) word += source[i + 1]; // Escapables.
                i += 2;
                marker = i;
                break;
              }
              if (char === '"') {
                word += parameterExpand(source.slice(marker, i));
                quoteMode = null;
                marker = ++i;
                break;
              }
              ++i;
              break;

            default: // Unquoted. You might meet ', ", \, $, space/tab, or newline.
              if (char === '\\') {
                word += parameterExpand(source.slice(marker, i));
                if (source[i + 1] !== '\n') word += source[i + 1];
                i += 2;
                marker = i;
                break;
              }
              if (char === "'") {word += parameterExpand(source.slice(marker, i)); quoteMode = 's'; marker = ++i; break;}
              if (char === '"') {word += parameterExpand(source.slice(marker, i)); quoteMode = 'd'; marker = ++i; break;}
              if ([' ', '\t', '\n'].indexOf(char) !== -1) {
                word += parameterExpand(source.slice(marker, i));
                if (assignmentAllower(key, target)) target[key] = word;
                word = '';
                i++;
                mode = 'n';
                break;
              }
              ++i;
          }
        }
        word += parameterExpand(source.slice(marker, i));
        if (mode === 'v' && word) {
          if (assignmentAllower(key, target)) target[key] = word;
          word = '';
        }
        break;
      case 'x': // Disregard until end of line (e.g. comment started, or non-assignment encountered).
        do {++i;} while ([undefined, '\n'].indexOf(char = source[i]) === -1);
        mode = 'n';
        break;
    }
  }

  return target;

  // Helpers
  function parameterExpand(str) {
    return str.replace(/\$({?)([a-z_]\w*)(}?)/gi, (match, p1, p2, p3) => {
      if ((p1 === '' && p3 === '') || (p1 === '{' && p3 === '}')) return target[p2] || '';
      return match;
    });
  }
}
