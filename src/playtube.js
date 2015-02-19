'use strict';

/* global window */

var playtube = {},
    Playtube = {},
    _ = require('lodash'),
    Sister = require('sister'),
    Promise = require('bluebird'),
    iframeAPIReady,
    load;

iframeAPIReady = new Promise(function (resolve) {
    // The API will call this function when the page has finished downloading
    // the JavaScript for the player API
    window.onYouTubeIframeAPIReady = function () {
        resolve();
    };
});

load('https://www.youtube.com/iframe_api');

/**
 *
 *
 * @param {HTMLElement|String} elementId Either the DOM element or the id of
 * the HTML element where the API will insert the <iframe> tag containing the player.
 * @param {Object} options Video player options (https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player)
 * excluding the events object.
 */
playtube.player = function (elementId, options) {
    return iframeAPIReady.then(function () {
        var playerAPI = {},
            playerAPIReady,
            player,
            emitter = Sister();

        options = options || {};

        if (options.events) {
            throw new Error('Event handlers cannot be overwritten.');
        }

        options.events = Playtube.proxyEvents(emitter);

        player = new window.YT.Player(elementId, options);

        playerAPIReady = new Promise(function (resolve) {
            emitter.on('ready', resolve);
        });

        playerAPI = Playtube.promisifyPlayer(playerAPIReady, player);
        playerAPI.on = emitter.on;

        return playerAPI;
    });
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
 * @param {Object} player Reference to the player instance
 */
Playtube.promisifyPlayer = function (playerAPIReady, player) {
    var playerAPI = {},
        methods;

    methods = ['playVideo', 'stopVideo'];

    _.forEach(methods, function (name) {
        playerAPI[name] = function () {
            var callArguments = arguments;

            return playerAPIReady.then(function () {
                return player[name](callArguments);
            });
        };
    });

    return playerAPI;
};

module.exports = playtube;
