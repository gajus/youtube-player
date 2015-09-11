import Sister from 'sister';
import Bluebird from 'bluebird';
import functionNames from './functionNames';
import eventNames from './eventNames';
import loadYouTubeIframeAPI from './loadYouTubeIframeAPI';
import _ from 'lodash';

let Playtube,
    playtube,
    youtubeIframeAPI;

Playtube = {};
playtube = {};
youtubeIframeAPI = loadYouTubeIframeAPI();

/**
 * @typedef options
 * @see https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
 * @param {Number} width
 * @param {Number} height
 * @param {String} videoId
 * @param {Object} playerVars
 * @param {Object} events
 */

/**
 * @param {HTMLElement|String} elementId Either the DOM element or the id of the HTML element where the API will insert an <iframe>.
 * @param {player~options} options
 * @return {Object}
 */
playtube.player = (elementId, options = {}) => {
    let emitter,
        playerAPI,
        playerAPIReady;

    playerAPI = {};
    emitter = Sister();

    if (options.events) {
        throw new Error(`Event handlers cannot be overwritten.`);
    }

    if (typeof elementId === `string` && !document.getElementById(elementId)) {
        throw new Error(`Element "#${elementId}" does not exist.`);
    }

    options.events = Playtube.proxyEvents(emitter);

    playerAPIReady = new Bluebird((resolve) => {
        youtubeIframeAPI
            .then((YT) => {
                return new YT.Player(elementId, options);
            })
            .then((player) => {
                emitter.on(`ready`, () => {
                    resolve(player);

                    // Until Proxies become available, this is the only way to Promisify the SDK.
                    /*
                    methods = _.map(_.functions(player), function (name) {
                        return '\'' + name + '\'';
                    });

                    console.log(methods.join(', '));
                    */
                });
            });
    });

    playerAPI = Playtube.promisifyPlayer(playerAPIReady);
    playerAPI.on = emitter.on;

    return playerAPI;
};

/**
 * Construct an object that defines an event handler for all of the
 * YouTube player events. Proxy captured events through an event emitter.
 *
 * @todo Capture event parameters.
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 * @param {Sister} emitter
 * @return {Object}
 */
Playtube.proxyEvents = (emitter) => {
    let events;

    events = {};

    _.forEach(eventNames, (eventName) => {
        let onEventName;

        onEventName = `on${_.capitalize(eventName)}`;

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
 * @return {Object}
 */
Playtube.promisifyPlayer = (playerAPIReady) => {
    let functions;

    functions = {};

    _.forEach(functionNames, (functionName) => {
        functions[functionName] = (...args) => {
            return playerAPIReady
                .then((player) => {
                    return player[functionName](...args);
                });
        }
    });

    return functions;
};

export default playtube;
