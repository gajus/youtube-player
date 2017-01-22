# YouTube Player

[![NPM version](http://img.shields.io/npm/v/youtube-player.svg?style=flat-square)](https://www.npmjs.com/package/youtube-player)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

* [Usage](#usage)
    * [Events](#events)
* [Examples](#examples)
* [Download](#download)
* [Running the Examples](#running-the-examples)

`youtube-player` is an abstraction of [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) (YIPA).

The downsides of using YouTube IFrame Player API are:

* Requires to define callbacks in the global scope (`window`).
* Requires to track the state of a player (e.g. you must ensure that video player is "ready" before you can use the API).

`youtube-player`:

* Registers listeners required to establish when YIPA has been loaded.
* Does not overwrite global YIPA callback functions.
* Queues player API calls until when video player is "ready".

##

## Usage

```js
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
 * @typedef YT.Player
 * @see https://developers.google.com/youtube/iframe_api_reference
 * */

/**
 * A factory function used to produce an instance of YT.Player and queue function calls and proxy events of the resulting object.
 *
 * @param {YT.Player|HTMLElement|String} elementId Either An existing YT.Player instance,
 * the DOM element or the id of the HTML element where the API will insert an <iframe>.
 * @param {YouTubePlayer~options} options See `options` (Ignored when using an existing YT.Player instance).
 * @param {boolean} strictState A flag designating whether or not to wait for
 * an acceptable state when calling supported functions. Default: `false`.
 * See `FunctionStateMap.js` for supported functions and acceptable states.
 * @returns {Object}
 */
import YouTubePlayer from 'youtube-player';
```

`youtube-player` is a factory function.

 The resulting object exposes all [functions of an instance of `YT.Player`](https://developers.google.com/youtube/iframe_api_reference#Functions). The difference is that the function body is wrapped in a promise. This promise is resolved only when the player has finished loading and is ready to begin receiving API calls (`onReady`). Therefore, all function calls are queued and replayed only when player is ready.

 This encapsulation does not affect the API other than making every function return a promise.

```js
let player;

player = YouTubePlayer('video-player');

// 'loadVideoById' is queued until the player is ready to receive API calls.
player.loadVideoById('M7lc1UVf-VE');

// 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
player.playVideo();

// 'stopVideo' is queued after 'playVideo'.
player
    .stopVideo()
    .then(() => {
        // Every function returns a promise that is resolved after the target function has been executed.
    });
```

### Events

`player.on` event emitter is used to listen to all [YouTube IFrame Player API events](https://developers.google.com/youtube/iframe_api_reference#Events), e.g.

```js
player.on('stateChange', (event) => {
    // event.data
});
 ```
 
`player.off` removes a previously added event listener, e.g.

```js
var listener = player.on(/* ... */);
player.off(listener)
```

## Examples

* [Playing a video](./examples/src/playing-video/index.html).
* [Multiple players](./examples/src/multiple-players/index.html).
* [Registering events handlers](./examples/src/registering-event-handlers/index.html).

## Download

Using [NPM](https://www.npmjs.org/):

```sh
npm install youtube-player
```

## Running the Examples

```sh
npm install
npm run build
cd ./examples
npm install
npm run start
```

This will start a HTTP server on port 8000.
