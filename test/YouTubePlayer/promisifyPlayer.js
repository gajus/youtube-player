import test from 'ava';
import YouTubePlayer from '../../src/YouTubePlayer';
import functionNames from '../../src/functionNames';

test('is a function', (t) => {
  t.true(YouTubePlayer.promisifyPlayer instanceof Function);
});

test('converts all API methods to asynchronous functions', async (t) => {
  const mockPlayer = {};
  const mockArg = {};
  const playerAPIReady = new Promise((resolve) => {
    resolve(mockPlayer);
  });
  const functions = YouTubePlayer.promisifyPlayer(playerAPIReady);

  for (const fname of functionNames) {
    mockPlayer[fname] = (arg) => {
      return arg;
    };

    const promise = functions[fname](mockArg);

    t.true(promise instanceof Promise);

    // eslint-disable-next-line babel/no-await-in-loop
    const result = await promise;

    t.true(result === mockArg);
  }
});
