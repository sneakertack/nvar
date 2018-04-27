[![Build Status](https://travis-ci.org/sneakertack/nvar.svg?branch=master)](https://travis-ci.org/sneakertack/nvar) ![A static test-count badge (dynamise one day)](https://img.shields.io/badge/tests-58%2F58-brightgreen.svg) [![Coverage Status](https://coveralls.io/repos/github/sneakertack/nvar/badge.svg?branch=master)](https://coveralls.io/github/sneakertack/nvar?branch=master)

## Intro

`nvar` is a Node module that lets you declare environment variables in an envfile (usually `.env` in your app's root folder). When your app starts, `nvar` loads those variables (into `process.env` by default), making it useful for editing your app configuration and API credentials during development.

It works like (and is inspired by) [dotenv](https://github.com/bkeepers/dotenv) (Ruby), [dotenv](https://github.com/motdotla/dotenv) (Node), and [env2](https://github.com/dwyl/env2). It differs from the popular [dotenv](https://github.com/motdotla/dotenv) library for Node in that `nvar` follows Shell syntax (so if you are already loading environment variables via `source`, you can expect this module to work like a drop-in replacement).


## Usage

Install by running:

```sh
npm install --save nvar
```

Make a `.env` file in your app's root folder:

```sh
# .env (usually added to .gitignore)
DB_URL='postgresql://user:password@localhost:5432/mydb'
GITHUB_API_TOKEN=6495e6cf5fb93d68 # quotes are usually optional.
export LOGLEVEL=SEVERE # prepend with 'export' (not required for nvar, but typically found in Bash scripts).
```

Then, require and call `nvar` at the top of your application code:

```js
// Note the calling brackets at the end.
require('nvar')();

// Variables that were declared in .env in the application's root folder have now been added to process.env.
console.log(process.env.DB_URL); // Prints 'postgresql://user:password@localhost:5432/mydb'.
console.log(process.env.GITHUB_API_TOKEN); // Prints '6495e6cf5fb93d68'.
console.log(process.env.LOGLEVEL); // Prints 'SEVERE'.
```

Or, if your `.env` file is somewhere else, then do:

```js
require('nvar')('../somedir/my-env.sh')
```

Or, if you need to change some other options from the defaults, then do:

```js
require('nvar')({
  // All options listed.
  path: '../somedir/set-env.sh', // Filepath to envfile
  source: 'FOO=BAR', // Alternatively, provide the envfile source directly.
  target: module.exports, // Assign to something else besides process.env instead.
  enoent: 'warn', // What should happen if the envfile was not found? Set to null|'warn'|'error'.
  override: 'all' // Whether to override pre-existing variables. Set to 'all'|'empty'|'none'.
});
```

## Writing your envfile

**The TL;DR version:** Write lines of `KEY='VALUE'`. No spaces before/after the `=`. Single-quote your values (and if you need a single-quote literal, escape with `'\''`).

```sh
FOO='bar'
ENVIRONMENT='development'
API_TOKEN='12345abc'
GREETING='What'\''s your name?'
```

**The in-depth version:** The following shell-isms are supported, so its very likely that you can use `nvar` to read your existing Bash-`source`d envfile, and vice versa.

```sh
FOO=bar
EGGS=halfboiled TOAST=kaya # Multiple assignments on the same line work.
LUNCH=noodle echo ignored # Disregards shell commands.

# Backslash followed by newline breaks the value across multiple lines.
pi=3.141\
59265359

# Prepend with 'export', nvar doesn't mind.
export gum=secretly
export buns=quietly
# If all your variables are prepended with 'export', then `source`ing your envfile vs. using nvar would do the same thing, so that's convenient.

# Things like '\', '$', and whitespace do special things in shell. To prevent, a safe choice is single-quotes, which literalizes almost everything.
statement='everything i$ literal,
including newlines,
so that'\''s okay.' # Escape single-quotes by writing '\''.

# Double quotes: Mostly like single-quotes, though parameter expansion still works. See further below.
VERDICT="we've decided
that this is pretty !@#\$-ing \"cool\"." # Escape ", $, and \ with a backslash.

# Concatenation
FILLERS="foo"bar'baz' # Sets a value of 'foobarbaz' (FYI: concatenation is really why '\'' works as an escape when single-quoting).

# Parameter expansion of prior variables.
DB_USER=alice
DB_PASS=in
DB_HOST=data.land
DB_PORT=5432
DB_NAME=fun
DB_URL="${DB_USER}:${DB_PASS}@$DB_HOST:$DB_PORT/${DB_NAME}" # Curly braces are optional. Can be done within double quotes, or unquoted.
```

Feel free to review the [test results](https://github.com/sneakertack/nvar/blob/master/tests/results.txt), which also doubles as a specification for the syntax that can be accepted by the module.

## API

Here is a list of options you can pass in as an options object to `nvar`:

### Options

Option | Default | Description
--- | --- | ---
`path`&nbsp;<sup>v1.0</sup> | `'./.env'` |  Location of the envfile to load. If you only want to change this filepath, you can pass it directly as a string argument, instead of wrapping it in an options object.
`source`&nbsp;<sup>v1.0</sup> | `null` | Alternatively, pass in the assignments directly as text, e.g. `'EGGS=halfboiled\nTOAST=kaya'`. `path` is ignored if `source` is set.
`target`&nbsp;<sup>v1.0</sup> | `process.env` | Where to save the assignments to.
`enoent`&nbsp;<sup>v1.1</sup> | `'warn'` if relying on default `path`, `'error'` if path was specified | Whether to throw an error, log a warning to stderr, or do nothing if the file was not found. Irrelevant if using `source` instead of `path`.
`override`&nbsp;<sup>v1.3</sup> | `'all'` | If a variable already exists in the environment, should `nvar` override it? `'all'` means the environment can be overriden (default). `'empty'` means only empty `''` or unset variables can be set. `'none'` means only unset variables can be set.<br/><br/><small>_Advanced needs: Need even more control? Pass in a custom function (params `(key, env)`) that returns `true` or `false` instead. E.g. setting `override` to `(key) => !/[A-Z]/.test(key)` overrides variables written in lowercase only._</small>

## Contributing

Where possible, this module tries to support all shell syntax that might reasonably be expected to appear in a config file. If you believe you have a use case that is not covered, feel free to [raise an issue](https://github.com/sneakertack/nvar/issues).
