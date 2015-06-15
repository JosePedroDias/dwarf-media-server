var avconvUtils = require('avconv-utils');

/**
 * creates a filmstrip, so scrubbing can be enhanced
 */

module.exports = {
    process: function(vidPath, info, cb) {
        if ('filmstrip' in info) {
            return setImmediate(cb, null, info);
        }

        if (!info.metadata || !info.metadata.dimensions) {
            return setImmediate(cb, null, info);
        }

        avconvUtils.doMosaicMagic(
            {
                video:    vidPath,
                scale:    0.1,
                fps:      1,
                strategy: 'vertical',
                mosaic:   ['media', info.hash, 'filmstrip.jpg'].join('/')
            },
            function(err, res) {
                if (err) { return cb(err); }

                var res2 = {
                    height: res.mosaicDimensions[1],
                    frameDimensions: res.frameDimensions,
                    frames: res.n,
                    imageFile: res.outFile
                };
                info.filmstrip = res2;

                cb(null, res2);
            }
        );
    }
};
