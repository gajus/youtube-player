# Playtube

[![NPM version](http://img.shields.io/npm/v/playtube.svg?style=flat)](https://www.npmjs.org/package/playtube.svg)
[![Bower version](https://badge.fury.io/bo/playtube.svg.svg?v1)](http://badge.fury.io/bo/playtube.svg)

Playtube is an abstraction of [YouTube Player IFrame API](https://developers.google.com/youtube/iframe_api_reference) (YPIA).

The downside of using YPIA is:

* It requires defining callbacks in a global scope (`window`).
* It requires to track the state of a player (you must ensure that video player is "ready" before you can use the API).

Playtube:

* Registers listeners required to establish when YPIA has been loaded (abstracted; you don't see them).
* Uses Promises to abstract player API state (you can use the API without tracking the state of the player).

## Example

* [Playing video](./examples/playing-video).
* [Multiple players](./examples/multiple-players).
* [Registering events handlers](./examples/registering-event-handlers).

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
