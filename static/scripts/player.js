(function() {
    'use strict';

    /*global ENABLED_PLUGINS:false */

    window.player = function(vidPath, info) {

        this.vidPath = vidPath;
        this.info    = info;

        var mEl;

        var doPlugins = function(action, cb) {
            async.mapSeries(
                plugins,
                function(plugin, innerCb) {
                    var fn = plugin[action];
                    if (typeof fn !== 'function') { return setTimeout(innerCb, 0, null); }
                    fn(mEl, info, innerCb);
                },
                cb
            );
        };

        var isAudioOnly = (info && info.metadata && info.metadata.aCodec && (!info.metadata.vCodec));

        return {
            display: function(cb) {
                mEl = document.createElement(isAudioOnly ? 'audio' : 'video');

                mEl.setAttribute('controls', '');

                if ('thumb' in info) {
                    mEl.setAttribute('poster', '/' + info.thumb);
                }

                //mEl.setAttribute('autoplay', '');
                mEl.setAttribute('src', vidPath);
                document.body.appendChild(mEl);
                setTimeout(cb, 0, null);
            },

            use: function(cb) {
                doPlugins('use', cb);
            },

            edit: function(cb) {
                doPlugins('edit', cb);
            },

            process: function(cb) {
                doPlugins('process', cb);
            },

            play: function() {
                mEl.play();
            },

            pause: function() {
                mEl.pause();
            }
        }
    };

})();