import test from 'ava';
import functionNames from '../src/functionNames';

test('is an array of function names', (t) => {
  t.true(Array.isArray(functionNames));
});
