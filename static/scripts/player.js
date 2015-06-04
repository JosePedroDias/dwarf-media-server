(function() {
    'use strict';

    /*global enabledPlugins:false */

    window.player = function(vidPath, info) {

        this.vidPath = vidPath;
        this.info    = info;

        var doPlugins = function(action, cb) {
            async.mapSeries(
                plugins,
                function(plugin, innerCb) {
                    var fn = plugin[action];
                    if (typeof fn !== 'function') { return setTimeout(innerCb, 0, null); }
                    fn(vidPath, info, innerCb);
                },
                cb
            );
        };

        var isAudioOnly = (info && info.metadata && info.metadata.aCodec && (!info.metadata.vCodec))

        return {
            display: function(cb) {
                var videoEl = document.createElement(isAudioOnly ? 'audio' : 'video');
                videoEl.setAttribute('controls', '');
                videoEl.setAttribute('autoplay', '');
                videoEl.setAttribute('src', vidPath);
                document.body.appendChild(videoEl);
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
            }
        }
    };

})();