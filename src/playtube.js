'use strict';

/* global window */

var playtube = {},
    Playtube = {},
    _ = require('lodash'),
    Sister = require('sister'),
    Promise = require('bluebird'),
    load = require('load-script'),
    iframeAPIReady;

iframeAPIReady = new Promise(function (resolve) {
    // The API will call this function when the page has finished downloading
    // the JavaScript for the player API
    window.onYouTubeIframeAPIReady = function () {
        resolve();
    };
});

load('https://www.youtube.com/iframe_api');

/**
 * @param {HTMLElement|String} elementId Either the DOM element or the id of
 * the HTML element where the API will insert the <iframe> tag containing the player.
 * @param {Object} options Video player options (https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player)
 * excluding the events object.
 */
playtube.player = function (elementId, options) {
    var playerAPI = {},
        playerAPIReady,
        emitter = Sister();

    options = options || {};

    if (options.events) {
        throw new Error('Event handlers cannot be overwritten.');
    }

    options.events = Playtube.proxyEvents(emitter);

    playerAPIReady = new Promise(function (resolve) {
        iframeAPIReady
            .then(function () {
                return new window.YT.Player(elementId, options);
            })
            .then(function (player) {
                emitter.on('ready', function () {
                    resolve(player);
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
 */
Playtube.proxyEvents = function (emitter) {
    return {
        onReady: function () {
            emitter.trigger('ready');
        },
        onStateChange: function () {
            emitter.trigger('stateChange');
        },
        onPlaybackQualityChange: function () {
            emitter.trigger('playbackQualityChange');
        },
        onPlaybackRateChange: function () {
            emitter.trigger('playbackRateChange');
        },
        onError: function () {
            emitter.trigger('error');
        },
        onApiChange: function () {
            emitter.trigger('apiChange');
        }
    };
};

/**
 * Delays player API method execution until player state is ready.
 *
 * @todo Proxy all of the methods using Object.keys.
 * @param {Promise} playerAPIReady Promise that resolves when player is ready.
 */
Playtube.promisifyPlayer = function (playerAPIReady) {
    var playerAPI = {},
        methods;

    methods = ['playVideo', 'stopVideo'];

    _.forEach(methods, function (name) {
        playerAPI[name] = function () {
            var callArguments = arguments;

            return playerAPIReady
                .then(function (player) {
                    return player[name](callArguments);
                });
        };
    });

    return playerAPI;
};

window.gajus = window.gajus || {};
window.gajus.playtube = playtube;

module.exports = playtube;
