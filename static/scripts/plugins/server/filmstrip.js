const utils = require("ffmpeg-utils2");

/**
 * creates a filmstrip, so scrubbing can be enhanced
 */

module.exports = {
  process: function(vidPath, info, cb) {
    if ("filmstrip" in info) {
      return setImmediate(cb, null, info);
    }

    if (!info.metadata || !info.metadata.dimensions) {
      return setImmediate(cb, null, info);
    }

    utils.doMosaicMagic(
      {
        video: vidPath,
        scale: 0.25,
        fps: 0.2,
        _strategy: "horizontal",
        strategy: "ar_1_1",
        mosaic: ["./media", info.hash, "filmstrip.jpg"].join("/")
      },
      function(err, res) {
        if (err) {
          return cb(err);
        }

        const res2 = {
          frameDimensions: res.frameDimensions,
          mosaicDimensions: res.mosaicDimensions,
          frames: res.n,
          imageFile: res.outFile
        };
        info.filmstrip = res2;

        cb(null, res2);
      }
    );
  }
};
