import _ from 'lodash';
import functionNames from './functionNames';
import eventNames from './eventNames';
import FunctionStateMap from './FunctionStateMap';

const YouTubePlayer = {};

/**
 * Construct an object that defines an event handler for all of the YouTube
 * player events. Proxy captured events through an event emitter.
 *
 * @todo Capture event parameters.
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 * @param {Sister} emitter
 * @returns {Object}
 */
YouTubePlayer.proxyEvents = (emitter) => {
  const events = {};

  _.forEach(eventNames, (eventName) => {
    const onEventName = 'on' + _.upperFirst(eventName);

    events[onEventName] = (event) => {
      emitter.trigger(eventName, event);
    };
  });

  return events;
};

/**
 * Delays player API method execution until player state is ready.
 *
 * @todo Proxy all of the methods using Object.keys.
 * @todo See TRICKY below.
 * @param {Promise} playerAPIReady Promise that resolves when player is ready.
 * @param {boolean} strictState A flag designating whether or not to wait for
 * an acceptable state when calling supported functions. Default: `false`.
 * @returns {Object}
 */
YouTubePlayer.promisifyPlayer = (playerAPIReady, strictState = false) => {
  const functions = {};

  _.forEach(functionNames, (functionName) => {
    if (strictState && FunctionStateMap[functionName] instanceof Array) {
      functions[functionName] = async (...args) => {
        const acceptStates = FunctionStateMap[functionName];
        const player = await playerAPIReady;
        const playerState = await player.getPlayerState();

        if (acceptStates.indexOf(playerState) === -1) {
          await new Promise((resolve) => {
            const onPlayerStateChange = async () => {
              const playerStateAfterChange = await player.getPlayerState();

              if (acceptStates.indexOf(playerStateAfterChange) !== -1) {
                player.removeEventListener('onStateChange', onPlayerStateChange);

                resolve();
              }
            };

            player.addEventListener('onStateChange', onPlayerStateChange);
          });
        }

        // TRICKY: Just spread the args into the function once Babel is fixed:
        // https://github.com/babel/babel/issues/4270
        //
        // eslint-disable-next-line prefer-spread
        return player[functionName].apply(player, args);
      };
    } else {
      functions[functionName] = async (...args) => {
        const player = await playerAPIReady;

        // TRICKY: Just spread the args into the function once Babel is fixed:
        // https://github.com/babel/babel/issues/4270
        //
        // eslint-disable-next-line prefer-spread
        return player[functionName].apply(player, args);
      };
    }
  });

  return functions;
};

export default YouTubePlayer;
