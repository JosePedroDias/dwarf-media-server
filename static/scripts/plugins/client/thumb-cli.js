(function() {
    'use strict';

    /**
     * samples frame at 25% of the video to a canvas and gets data URL in JPEG format
     */

    var PLUGIN_KEY = 'thumbCli';
    var PLUGIN_NAME = 'thumb-cli';

    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(mEl, info, cb) {
            if (!(PLUGIN_KEY in info)) {
                return setTimeout(cb, 0, null);
            }
        },

        edit: function(vEl, info, cb) {
            var bag = info[PLUGIN_KEY];

            if (vEl.nodeName.toLowerCase !== 'video') {
                vEl = undefined;
            }

            if (bag || !vEl) {
                return setTimeout(cb, 0, null);
            }

            //console.log('a');

            var dims;
            vEl.addEventListener('loadeddata', function() {
                //console.log('b');

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
                    console.log('%s - thumb captured!', PLUGIN_KEY);
                });

                console.log('%s - go to %s...', PLUGIN_KEY, t);
                vEl.currentTime = t;

                var extracter = function(cb) {
                    console.log('%s - called extracter', PLUGIN_KEY);
                    var data = {
                        key: PLUGIN_KEY,
                        values: {
                            dataImage: cEl.toDataURL('image/jpeg')
                        }
                    };

                    setTimeout(cb, 0, null, data);
                };

                setTimeout(cb, 0, null, extracter);
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
