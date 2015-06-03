var path = require('path');
var fs   = require('fs');

var express    = require('express');
var expHbs     = require('express-handlebars');
var bodyParser = require('body-parser');
var multer     = require('multer');
var send       = require('send');



var PORT = 3000;



var app = express();

app.engine('.hbs', expHbs({defaultLayout:'main', extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use('/static', express.static('static'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended:true})); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data



function rndBase32(len) {
    return ( ~~(Math.random() * Math.pow(32, len)) ).toString(32);
}

function hashToInfo(hash, cb) {
    fs.readFile(['media', hash, 'info.json'].join('/'), function(err, o) {
        if (err) {
            return cb(err);
        }

        cb(null, JSON.parse(o));
    });
}


app.get('/', function (req, res) {
    res.render('home');
});



app.get('/list', function (req, res) {
    fs.readdir('media', function(err, files) {
        if (err) { throw err; }

        res.render('list', {files:files});
    })
});



app.get('/upload', function (req, res) {
    res.render('upload');
});



app.post('/upload', function (req, res) {
    var f = req.files.file;
    var path0 = f.path;
    var ext = path.extname(f.name).toLowerCase();
    var hash = rndBase32(6);
    var dir = ['media/', hash].join('');
    var filename = ['original', ext].join('');
    var path1 = [dir, filename].join('/');

    fs.mkdir(dir, function(err) {
        if (err) { throw err; }

        fs.rename(path0, path1, function(err) {
            if (err) { throw err; }

            var d = new Date();
            var info = {
                hash:         hash,
                originalFile: filename,
                originalExt:  ext,
                createdAt:    d.toISOString(),
                createdAtN:   d.valueOf()
            };
            var path2 = [dir, 'info.json'].join('/');
            fs.writeFile(path2, JSON.stringify(info), function(err) {
                if (err) { throw err; }

                res.redirect(['/watch', hash].join('/'));
            });
        });
    })
});



app.get('/video/:hash', function (req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) { throw err; }

        var path = [req.params.hash, info.originalFile].join('/');

        send(req, path, {root:'media'})
            //.on('error', error)
            //.on('directory', redirect)
            //.on('headers', headers)
            .pipe(res);
    });
});



app.get('/watch/:hash', function (req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) { throw err; }

        res.render('watch', info);
    });
});



app.listen(PORT, function() {
    console.log('video-kiss-server app listening on port %s...', PORT);
});
