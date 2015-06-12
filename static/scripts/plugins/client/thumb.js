(function() {
    'use strict';

    /**
     * samples frame at 25% of the video to a canvas and gets data URL in JPEG format
     * TODO: submit back to server?
     * TODO: hide it
     */

    var PLUGIN_KEY = 'thumb';
    var PLUGIN_NAME = 'thumb';

    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(vidPath, info, cb) {
            var vEl = document.querySelector('video');
            var dims;
            vEl.addEventListener('loadeddata', function() {
                dims = [vEl.videoWidth, vEl.videoHeight];
                var cEl = document.createElement('canvas');
                cEl.width = dims[0];
                cEl.height = dims[1];
                cEl.style.display = 'none';
                document.body.appendChild(cEl);
                vEl.pause();
                var d = vEl.duration;
                var t = d * 0.25;

                vEl.addEventListener('seeked', function() {
                    var ctx = cEl.getContext('2d');
                    ctx.drawImage(vEl, 0, 0, dims[0], dims[1]);
                    var imgURL = cEl.toDataURL('image/jpeg');
                    console.log(imgURL);
                });

                vEl.currentTime = t;
            });
        }
    };



    if (window.plugins) {
        window.plugins.push(plugin);
    }
    else {
        window.plugins = [plugin];
    }
})();
