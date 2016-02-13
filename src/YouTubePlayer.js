import _ from 'lodash';
import functionNames from './functionNames';
import eventNames from './eventNames';

let YouTubePlayer;

YouTubePlayer = {};

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
    let events;

    events = {};

    _.forEach(eventNames, (eventName) => {
        let onEventName;

        onEventName = 'on' + _.upperFirst(eventName);

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
    let functions;

    functions = {};

    _.forEach(functionNames, (functionName) => {
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
