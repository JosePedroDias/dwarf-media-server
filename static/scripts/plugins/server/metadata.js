var avconvUtils = require('avconv-utils');

module.exports = {
    process: function(vidPath, info, cb) {
        if ('metadata' in info) {
            return setImmediate(cb, null, info);
        }

        avconvUtils.getMetadata(vidPath, function(err, meta) {
            if (err) { return cb(err, meta); }

            info.metadata = meta;

            cb(null, meta);
        });
    }
};
