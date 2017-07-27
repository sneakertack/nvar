Adds environment variables declared in a `.env` file to your app's `process.env`. Useful during development.

## Intro

`nvar` is a Node module that lets you declare environment variables in an envfile (usually named `.env`) in your app's root folder. When your app starts, `nvar` supplements `process.env` with those variables, making it useful for setting your app configuration or storing API credentials during development.

It works like (and is inspired by) [dotenv](https://github.com/bkeepers/dotenv) (Ruby), [dotenv](https://github.com/motdotla/dotenv) (Node), and [env2](https://github.com/dwyl/env2). It differs from the popular [dotenv](https://github.com/motdotla/dotenv) library for Node in that nvar's envfile syntax follows that of shell script (i.e. it is mostly interchangeable with Bash's `source`).


## Usage

Install by running (currently only works on Node 6+):

```sh
npm install --save nvar
```

Make a `.env` file in your app's root folder, then require and call `nvar` at the top of your application code:

```sh
# .env (usually gitignored)
DB_URL='postgresql://user:password@localhost:5432/mydb'
GITHUB_API_TOKEN=6495e6cf5fb93d68 # quotes are usually optional.
export LOGLEVEL=SEVERE # prepend with 'export' (not required for nvar, but typically found in Bash scripts).
```

```js
require('nvar')();
// Variables that were declared in .env in the application's root folder have now been added to process.env.
// Note the calling brackets at the end.

console.log(process.env.DB_URL);
console.log(process.env.GITHUB_API_TOKEN);
```

Or, if your `.env` file is somewhere else, then do:

```js
require('nvar')('../somedir/my-env.sh')
```

Or, if you need to change some other options from the defaults, then do:

```js
require('nvar')({
  path: '../somedir/set-env.sh', // filepath to envfile
  source: 'FOO=BAR', // alternatively, provide the envfile source directly.
  target: module.exports // assign to something else besides process.env instead.
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

**The in-depth version:** The following shell-isms are supported. That means there's a very high chance that you can use `nvar` to read your existing Bash-`source`d envfile, and vice versa.

```sh
FOO=bar
EGGS=scrambled TOAST=kaya # Multiple assignments on the same line work.
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

