'use strict';

var _lodashCollectionForEach2 = require('lodash/collection/forEach');

var _lodashCollectionForEach3 = _interopRequireDefault(_lodashCollectionForEach2);

var _lodashStringCapitalize2 = require('lodash/string/capitalize');

var _lodashStringCapitalize3 = _interopRequireDefault(_lodashStringCapitalize2);

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _sister = require('sister');

var _sister2 = _interopRequireDefault(_sister);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _functionNames = require('./functionNames');

var _functionNames2 = _interopRequireDefault(_functionNames);

var _eventNames = require('./eventNames');

var _eventNames2 = _interopRequireDefault(_eventNames);

var _loadYouTubeIframeAPI = require('./loadYouTubeIframeAPI');

var _loadYouTubeIframeAPI2 = _interopRequireDefault(_loadYouTubeIframeAPI);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var Playtube = undefined,
    playtube = undefined,
    youtubeIframeAPI = undefined;

Playtube = {};
playtube = {};
youtubeIframeAPI = (0, _loadYouTubeIframeAPI2['default'])();

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
playtube.player = function (elementId) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var emitter = undefined,
        playerAPI = undefined,
        playerAPIReady = undefined;

    playerAPI = {};
    emitter = (0, _sister2['default'])();

    if (options.events) {
        throw new Error('Event handlers cannot be overwritten.');
    }

    if (typeof elementId === 'string' && !document.getElementById(elementId)) {
        throw new Error('Element "#' + elementId + '" does not exist.');
    }

    options.events = Playtube.proxyEvents(emitter);

    playerAPIReady = new _bluebird2['default'](function (resolve) {
        youtubeIframeAPI.then(function (YT) {
            return new YT.Player(elementId, options);
        }).then(function (player) {
            emitter.on('ready', function () {
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
Playtube.proxyEvents = function (emitter) {
    var events = undefined;

    events = {};

    (0, _lodashCollectionForEach3['default'])(_eventNames2['default'], function (eventName) {
        var onEventName = undefined;

        onEventName = 'on' + (0, _lodashStringCapitalize3['default'])(eventName);

        events[onEventName] = function (event) {
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
Playtube.promisifyPlayer = function (playerAPIReady) {
    var functions = undefined;

    functions = {};

    (0, _lodashCollectionForEach3['default'])(_functionNames2['default'], function (functionName) {
        functions[functionName] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return playerAPIReady.then(function (player) {
                return player[functionName].apply(player, args);
            });
        };
    });

    return functions;
};

exports['default'] = playtube;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map