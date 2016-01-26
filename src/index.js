import _ from 'lodash';
import Sister from 'sister';
import Bluebird from 'bluebird';
import loadYouTubeIframeAPI from './loadYouTubeIframeAPI';
import YouTubePlayer from './YouTubePlayer';

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
 * A factory function used to produce an instance of YT.Player and queue function calls and proxy events of the resulting object.
 *
 * @param {HTMLElement|String} elementId Either the DOM element or the id of the HTML element where the API will insert an <iframe>.
 * @param {YouTubePlayer~options} options
 * @returns {Object}
 */
export default (elementId, options = {}) => {
    let emitter,
        playerAPI,
        playerAPIReady,
        youtubeIframeAPI;

    youtubeIframeAPI = loadYouTubeIframeAPI();

    playerAPI = {};
    emitter = Sister();

    if (options.events) {
        throw new Error('Event handlers cannot be overwritten.');
    }

    if (_.isString(elementId) && !document.getElementById(elementId)) {
        throw new Error('Element "' + elementId + '" does not exist.');
    }

    options.events = YouTubePlayer.proxyEvents(emitter);

    playerAPIReady = new Bluebird((resolve) => {
        youtubeIframeAPI
            .then((YT) => {
                return new YT.Player(elementId, options);
            })
            .then((player) => {
                emitter.on('ready', () => {
                    resolve(player);
                });
            });
    });

    playerAPI = YouTubePlayer.promisifyPlayer(playerAPIReady);
    playerAPI.on = emitter.on;

    return playerAPI;
};
