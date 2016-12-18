import test from 'ava';
import PublicAPIConstructor from '../src';

test('is a function', (t) => {
  t.true(PublicAPIConstructor instanceof Function);
});
