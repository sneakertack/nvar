Adds environment variables declared in a `.env` file to your app's `process.env`. Useful during development.

## Intro

`nvar` is a Node module that lets you declare environment variables in an envfile (usually named `.env`) in your app's root folder. When your app starts, `nvar` supplements `process.env` with those variables, making it useful for setting your app configuration or storing API credentials during development.

It works like (and is inspired by) [dotenv](https://github.com/bkeepers/dotenv) (Ruby), [dotenv](https://github.com/motdotla/dotenv) (Node), and [env2](https://github.com/dwyl/env2). It differs from the popular Node [dotenv](https://github.com/motdotla/dotenv) library in that nvar's syntax follows that of shell script (which means e.g. you can use it with envfiles you would otherwise load using Bash's `source`, and expect it to work).


## Usage

Install by running:

```sh
npm install --save nvar
```

Make a `.env` file in your app's root folder, then require and call `nvar` at the top of your application code:

```sh
# .env
DB_URL='postgresql://user:password@localhost:5432/mydb'
GITHUB_API_TOKEN=6495e6cf5fb93d68 # quotes are usually optional.
export LOGLEVEL=SEVERE # optional 'export' prefix if you wish (for interoperability with Bash scripts).
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
  path: '../somedir/set-env.sh',
  someOption: true,
  someOtherOption: false
});
```

