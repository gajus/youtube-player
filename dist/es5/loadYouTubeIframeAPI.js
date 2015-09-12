'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _loadScript = require('load-script');

var _loadScript2 = _interopRequireDefault(_loadScript);

exports['default'] = function () {
    var iframeAPIReady = undefined;

    /**
     * A promise that is resolved when window.onYouTubeIframeAPIReady is called.
     * The promise is resolved with a reference to global.YT object.
     *
     * @param {Function} resolve
     * @member {Object} iframeAPIReady
     */
    iframeAPIReady = new _bluebird2['default'](function (resolve) {
        var previous = undefined;

        previous = global.onYouTubeIframeAPIReady;

        // The API will call this function when page has finished downloading
        // the JavaScript for the player API.
        global.onYouTubeIframeAPIReady = function () {
            if (previous) {
                previous();
            }

            resolve(global.YT);
        };
    });

    (0, _loadScript2['default'])('https://www.youtube.com/iframe_api');

    return iframeAPIReady;
};

module.exports = exports['default'];
//# sourceMappingURL=loadYouTubeIframeAPI.js.map