import forEach from 'lodash/forEach';
import upperFirst from 'lodash/upperFirst';
import functionNames from './functionNames';
import eventNames from './eventNames';

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

  forEach(eventNames, (eventName) => {
    const onEventName = 'on' + upperFirst(eventName);

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
 * @param {Promise} playerAPIReady Promise that resolves when player is ready.
 * @returns {Object}
 */
YouTubePlayer.promisifyPlayer = (playerAPIReady) => {
  const functions = {};

  forEach(functionNames, (functionName) => {
    functions[functionName] = (...args) => {
      return playerAPIReady
                .then((player) => {
                  return player[functionName](...args);
                });
    };
  });

  return functions;
};

export default YouTubePlayer;
