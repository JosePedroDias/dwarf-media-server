const utils = require("ffmpeg-utils2");

/**
 * stores info from avconv
 */

module.exports = {
  process: function(vidPath, info, cb) {
    if ("metadata" in info) {
      return setImmediate(cb, null, info);
    }

    utils.getMetadata(vidPath, function(err, meta) {
      if (err) {
        return cb(err, meta);
      }

      info.metadata = meta;

      cb(null, meta);
    });
  }
};
