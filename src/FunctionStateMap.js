export default {

  // Accept Ended or Paused.
  pauseVideo: {
    acceptableStates: [0, 2],
    stateChangeRequired: false
  },

  // Accept Ended or Playing.
  playVideo: {
    acceptableStates: [0, 1],
    stateChangeRequired: false
  },

  // Accept Ended, Playing or Paused.
  seekTo: {
    acceptableStates: [0, 1, 2],
    stateChangeRequired: true,

    // TRICKY: `seekTo` may not cause a state change if no buffering is
    // required.
    timeout: 3000
  }
};
