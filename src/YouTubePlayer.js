import _ from 'lodash';
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
 * @returns {Object}
 */
YouTubePlayer.promisifyPlayer = (playerAPIReady) => {
  const functions = {};

  _.forEach(functionNames, (functionName) => {
    functions[functionName] = async (...args) => {
      const player = await playerAPIReady;

      // TRICKY: Just spread the args into the function once Babel is fixed:
      // https://github.com/babel/babel/issues/4270
      return player[functionName].apply(null, args);
    };
  });

  return functions;
};

export default YouTubePlayer;
