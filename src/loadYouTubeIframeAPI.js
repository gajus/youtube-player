import Bluebird from 'bluebird';
import load from 'load-script';

export default () => {
    let iframeAPIReady;

    /**
     * A promise that is resolved when window.onYouTubeIframeAPIReady is called.
     * The promise is resolved with a reference to global.YT object.
     *
     * @member {Object} iframeAPIReady
     */
    iframeAPIReady = new Bluebird((resolve) => {
        let previous;

        previous = global.onYouTubeIframeAPIReady;

        // The API will call this function when page has finished downloading
        // the JavaScript for the player API.
        global.onYouTubeIframeAPIReady = () => {
            if (previous) {
                previous();
            }

            resolve(global.YT);
        };
    });

    load(`https://www.youtube.com/iframe_api`);

    return iframeAPIReady;
};
