import _ from 'lodash';
import load from 'load-script';

export default (protocol) => {
  /**
   * A promise that is resolved when window.onYouTubeIframeAPIReady is called.
   * The promise is resolved with a reference to window.YT object.
   *
   * @param {Function} resolve
   * @member {Object} iframeAPIReady
   */
  const iframeAPIReady = new Promise((resolve) => {
    if (window.YT && window.YT.Player && window.YT.Player instanceof Function) {
      resolve(window.YT);

      return;
    }

    const previous = window.onYouTubeIframeAPIReady;

    // The API will call this function when page has finished downloading
    // the JavaScript for the player API.
    window.onYouTubeIframeAPIReady = () => {
      if (previous) {
        previous();
      }

      resolve(window.YT);
    };
  });

  const iframeLoadProtocol = _.cond([
    [_.constant(protocol === 'http'), _.constant('http:')],
    [_.constant(protocol === 'https'), _.constant('https:')],
    [_.constant(window.location.protocol === 'http:'), _.constant('http:')],
    [_.constant(true), _.constant('https:')]
  ])();

  load(iframeLoadProtocol + '//www.youtube.com/iframe_api');

  return iframeAPIReady;
};
