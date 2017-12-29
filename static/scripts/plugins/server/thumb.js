const utils = require("ffmpeg-utils2");

/**
 * samples a frame at 25% of the video and stores it
 * can serve as poster
 */

module.exports = {
  process: function(vidPath, info, cb) {
    if ("thumb" in info) {
      return setImmediate(cb, null, info);
    }

    if (!info.metadata || !info.metadata.dimensions) {
      return setImmediate(cb, null, info);
    }

    utils.extractFrames(
      {
        inFile: vidPath,
        videoDimensions: info.metadata.dimensions,
        outPath: ["./media", info.hash].join("/"),
        guid: "thumb",
        outImageMask: "",
        scale: 1,
        //fps:      Math.ceil(info.metadata.durationSecs / 5),
        startTime: (info.metadata.durationSecs * 0.25).toFixed(2),
        numFrames: 1
      },
      function(err, res) {
        if (err) {
          return cb(err);
        }

        const res2 = res.files;
        info.thumb = res2;

        cb(null, res2);
      }
    );
  }
};
