var fs = require('fs');
var crypto = require('crypto');

module.exports = function(filePath, cb) {
    var fd = fs.createReadStream(filePath);
    var hash = crypto.createHash('md5');
    hash.setEncoding('hex');

    fd.on('error', function(err) {
        cb(err);
    });

    fd.on('end', function() {
        hash.end();
        cb(null, hash.read());
    });

    fd.pipe(hash);
};
