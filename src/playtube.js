'use strict';

/* global window */

var playtube = {},
    Playtube = {},
    Sister = require('sister'),
    Promise = require('promise'),
    load = require('load-script'),
    iframeAPIReady;

iframeAPIReady = new Promise(function (resolve) {
    // The API will call this function when page has finished downloading
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

    if (typeof elementId === 'string' && !document.getElementById(elementId)) {
        throw new Error('Element "#' + elementId + '" does not exist.');
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

                    // Until Proxies become available, this is the only way to Promisify the SDK.
                    /*methods = _.map(_.functions(player), function (name) {
                        return '\'' + name + '\'';
                    });

                    console.log(methods.join(', '));*/
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
        onReady: function (event) {
            emitter.trigger('ready', event);
        },
        onStateChange: function (event) {
            emitter.trigger('stateChange', event);
        },
        onPlaybackQualityChange: function (event) {
            emitter.trigger('playbackQualityChange', event);
        },
        onPlaybackRateChange: function (event) {
            emitter.trigger('playbackRateChange', event);
        },
        onError: function (event) {
            emitter.trigger('error', event);
        },
        onApiChange: function (event) {
            emitter.trigger('apiChange', event);
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

    methods = ['cueVideoById', 'loadVideoById', 'cueVideoByUrl', 'loadVideoByUrl', 'playVideo', 'pauseVideo', 'stopVideo', 'clearVideo', 'getVideoBytesLoaded', 'getVideoBytesTotal', 'getVideoLoadedFraction', 'getVideoStartBytes', 'cuePlaylist', 'loadPlaylist', 'nextVideo', 'previousVideo', 'playVideoAt', 'setShuffle', 'setLoop', 'getPlaylist', 'getPlaylistIndex', 'getPlaylistId', 'loadModule', 'unloadModule', 'setOption', 'mute', 'unMute', 'isMuted', 'setVolume', 'getVolume', 'seekTo', 'getPlayerState', 'getPlaybackRate', 'setPlaybackRate', 'getAvailablePlaybackRates', 'getPlaybackQuality', 'setPlaybackQuality', 'getAvailableQualityLevels', 'getCurrentTime', 'getDuration', 'removeEventListener', 'getVideoUrl', 'getDebugText', 'getVideoData', 'addCueRange', 'removeCueRange', 'getApiInterface', 'showVideoInfo', 'hideVideoInfo', 'G', 'C', 'R', 'aa', '$', 'Z', 'getVideoEmbedCode', 'getOptions', 'getOption', 'Y', 'X', 'addEventListener', 'destroy', 'A', 'P', 'J', 'setSize', 'getIframe'];

    methods.forEach(function (methodName) {
        playerAPI[methodName] = function () {
            var callArguments = arguments;

            return playerAPIReady
                .then(function (player) {
                    player[methodName].apply(player, callArguments);
                });
        };
    });

    return playerAPI;
};

window.gajus = window.gajus || {};
window.gajus.playtube = playtube;

module.exports = playtube;
