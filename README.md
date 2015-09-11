# Playtube

[![NPM version](http://img.shields.io/npm/v/playtube.svg?style=flat)](https://www.npmjs.com/package/playtube)
[![Bower version](https://badge.fury.io/bo/playtube.svg)](http://bower.io/search/?q=playtube)
[![js-canonical-style](https://img.shields.io/badge/code%20style-canonical-brightgreen.svg?style=flat)](https://github.com/gajus/canonical)

Playtube is an abstraction of [YouTube Player IFrame API](https://developers.google.com/youtube/iframe_api_reference) (YPIA).

The downside of using YPIA is:

* It requires defining callbacks in a global scope (`window`).
* It requires to track the state of a player (you must ensure that video player is "ready" before you can use the API).

Playtube:

* Registers listeners required to establish when YPIA has been loaded (abstracted; you don't see them).
* Uses Promises to abstract player API state (you can use the API without tracking the state of the player).

Playtube and please [tweet it](https://twitter.com/intent/retweet?tweet_id=569169736971522048) if you like it. : )

## Example

* [Playing video](./examples/playing-video/index.html).
* [Multiple players](./examples/multiple-players/index.html).
* [Registering events handlers](./examples/registering-event-handlers/index.html).

```js
var playtube = require('playtube'),
    player;

player = playtube.player('video-player', {
    videoId: 'M7lc1UVf-VE'
});

// All methods are promises.
// "playVideo" is queued and will execute as soon as player is ready.
player
    .playVideo()
    .then(function () {
        // Promise is resolved after method is executed, i.e. after iframe API and video player have been loaded and "playVideo" method executed.
    });

// "stopVideo" is queued after "playVideo". This will cause video to start buffering.
player.stopVideo();

// Events are proxied through player.on event emitter.
player.on('stateChange', function (event) {
    // event.data
});
```

## Download

Using [Bower](http://bower.io/):

```sh
bower install playtube
```

Using [NPM](https://www.npmjs.org/):

```sh
npm install playtube
```

### Bower

When using Bower distribution (`./dist/playtube.min.js`) `playtube` is available under `window.gajus` namespace.

```html
<!DOCTYPE html>
<html>
<head>
    <script src="./bower_components/playtube/dist/playtube.min.js"></script>
</head>
<body>
    <div id="my-player"></div>
    <script>
    var playtube = window.gajus.playtube,
        player;

    player = playtube.player('my-player');
    </script>
</body>
</html>
```

## Running the Examples

```sh
npm install webpack-dev-server -g
webpack-dev-server
```

This will start a HTTP server on port 8000.
