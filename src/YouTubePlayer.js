// @flow

import _ from 'lodash';
import functionNames from './functionNames';
import eventNames from './eventNames';
import FunctionStateMap from './FunctionStateMap';
import type {
  EmitterType,
  YouTubePlayerType
} from './types';

const YouTubePlayer = {};

type EventHandlerMapType = {
  [key: string]: (event: Object) => void
};

/**
 * Construct an object that defines an event handler for all of the YouTube
 * player events. Proxy captured events through an event emitter.
 *
 * @todo Capture event parameters.
 * @see https://developers.google.com/youtube/iframe_api_reference#Events
 */
YouTubePlayer.proxyEvents = (emitter: EmitterType): EventHandlerMapType => {
  const events = {};

  for (const eventName of eventNames) {
    const onEventName = 'on' + _.upperFirst(eventName);

    events[onEventName] = (event) => {
      emitter.trigger(eventName, event);
    };
  }

  return events;
};

/**
 * Delays player API method execution until player state is ready.
 *
 * @todo Proxy all of the methods using Object.keys.
 * @todo See TRICKY below.
 * @param playerAPIReady Promise that resolves when player is ready.
 * @param strictState A flag designating whether or not to wait for
 * an acceptable state when calling supported functions.
 * @returns {Object}
 */
YouTubePlayer.promisifyPlayer = (playerAPIReady: Promise<YouTubePlayerType>, strictState: boolean = false) => {
  const functions = {};

  for (const functionName of functionNames) {
    if (strictState && FunctionStateMap[functionName]) {
      functions[functionName] = async (...args) => {
        const stateInfo = FunctionStateMap[functionName];
        const player = await playerAPIReady;
        const playerState = player.getPlayerState();

        // eslint-disable-next-line no-warning-comments
        // TODO: Just spread the args into the function once Babel is fixed:
        // https://github.com/babel/babel/issues/4270
        //
        // eslint-disable-next-line prefer-spread
        const value = player[functionName].apply(player, args);

        // TRICKY: For functions like `seekTo`, a change in state must be
        // triggered given that the resulting state could match the initial
        // state.
        if (
          stateInfo.stateChangeRequired ||

          // eslint-disable-next-line no-extra-parens
          (
            Array.isArray(stateInfo.acceptableStates) &&
            stateInfo.acceptableStates.indexOf(playerState) === -1
          )
        ) {
          await new Promise((resolve) => {
            const onPlayerStateChange = () => {
              const playerStateAfterChange = player.getPlayerState();

              let timeout;

              if (typeof stateInfo.timeout === 'number') {
                timeout = setTimeout(() => {
                  player.removeEventListener('onStateChange', onPlayerStateChange);

                  resolve();
                }, stateInfo.timeout);
              }

              if (
                Array.isArray(stateInfo.acceptableStates) &&
                stateInfo.acceptableStates.indexOf(playerStateAfterChange) !== -1
              ) {
                player.removeEventListener('onStateChange', onPlayerStateChange);

                clearTimeout(timeout);
                resolve();
              }
            };

            player.addEventListener('onStateChange', onPlayerStateChange);
          });
        }

        return value;
      };
    } else {
      functions[functionName] = async (...args) => {
        const player = await playerAPIReady;

        // eslint-disable-next-line no-warning-comments
        // TODO: Just spread the args into the function once Babel is fixed:
        // https://github.com/babel/babel/issues/4270
        //
        // eslint-disable-next-line prefer-spread
        return player[functionName].apply(player, args);
      };
    }
  }

  return functions;
};

export default YouTubePlayer;
