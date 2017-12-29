const fs = require("fs");
const crypto = require("crypto");

module.exports = function(filePath, cb) {
  const fd = fs.createReadStream(filePath);
  const hash = crypto.createHash("md5");
  hash.setEncoding("hex");

  fd.on("error", function(err) {
    cb(err);
  });

  fd.on("end", function() {
    hash.end();
    cb(null, hash.read());
  });

  fd.pipe(hash);
};
