const test = require('tape');
const nvar = require('../lib');

test('Composite test', function (t) {
  t.deepEqual(nvar({path: __dirname+'/fixture-env', target: Object.create(null)}), {
    FOO: 'bar',
    EGGS: 'halfboiled',
    TOAST: 'kaya',
    LUNCH: 'noodle',
    conversation: 'what\'s your name?\nit is bob.',
    DELIMITER: ' ',
    gum: 'secretly',
    buns: 'quietly',
    VERDICT: 'we\'ve decided\nthat this is pretty !@#$-ing "cool".',
    FILLERS: 'foobarbaz',
    DB_HOST: 'data.land',
    DB_USER: 'alice',
    DB_PASSWORD: 'in',
    DB_PORT: '5432',
    DB_DATABASE: 'hat',
    DB_URL: 'postgresql://alice:in@data.land:5432/hat',
    pi: '3.14159265359'
  }, 'Successfully handles an example envfile.');

  t.end();
});
