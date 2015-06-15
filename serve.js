var fs   = require('fs');

var express    = require('express');
var expHbs     = require('express-handlebars');
var bodyParser = require('body-parser');
var multer     = require('multer');
var send       = require('send');
var async      = require('async');

var md5File = require('./lib/md5-file');



var PORT = 3000;

var ENABLED_PLUGINS = {
    server: [
         'metadata'
        ,'thumb'
        ,'filmstrip'
    ],
    client: [
         'user-filled-info'
        ,'metadata'
        //,'thumb-cli'
        //,'sample-audio'
        ,'audio-wave'
        ,'filmstrip'
    ]
};




var app = express();

app.engine(
    '.hbs',
    expHbs({
        defaultLayout:'main',
        extname:'.hbs',
        helpers: {
            iff: function(conditional, options) {
                if (options.hash.desired === options.hash.type) {
                    options.fn(this);
                }
                else {
                    options.inverse(this);
                }
            }
        }
    })
);
app.set('view engine', '.hbs');

app.use('/static', express.static('static'));
app.use('/media', express.static('media'));

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



function saveInfo(hash, info, cb) {
    fs.writeFile(['media', hash, 'info.json'].join('/'), JSON.stringify(info), cb);
}



function getOriginalPath(info, onClient) {
    if (onClient) {
        return ['/stream', info.hash].join('/');
    }
    return ['media', info.hash, info.original.file].join('/');
}


function getInfos(cb) {
    fs.readdir('media', function(err, files) {
        if (err) { return cb(err); }

        async.mapLimit(
            files,
            4,
            hashToInfo,
            function(err, infos) {
                if (err) { throw err; }

                cb(null, infos);
            }
        );
    });
}



function doServerPlugins(vidPath, info, cb) {
    var hash = info.hash;

    console.log('calling server plugins for hash %s...', hash);

    async.eachSeries(
        ENABLED_PLUGINS.server,
        function(plugin, innerCb) {
            console.log('* %s...', plugin);
            var fn = require('./static/scripts/plugins/server/' + plugin).process;
            fn(vidPath, info, innerCb);
        },
        function(err) {
            if (err) { return cb(err); }

            console.log('all done. saving...');

            saveInfo(hash, info, cb);
        }
    );
}



app.get('/', function (req, res) {
    //res.render('home', {title:'home'});
    res.redirect('/list');
});



app.get('/list', function (req, res) {
    getInfos(function(err, infos) {
        if (err) { throw err; }

        res.render('list', {title:'list', infos:infos});
    });
});



app.get('/upload', function (req, res) {
    res.render('upload', {title:'upload'});
});



app.post('/upload', function (req, res) {
    var f = req.files.file;
    var path0 = f.path;

    getInfos(function(err, infos) {
        if (err) { throw err; }

        var md5s = infos.map(function(info) {
            return info.md5;
        });

        md5File(path0, function(err, md5) {
            if (err) { throw err; }

            var idx = md5s.indexOf(md5);
            if (idx !== -1) {
                return res.redirect(['/watch', infos[idx].hash].join('/'));
            }

            var hash = rndBase32(6);
            var dir = ['media/', hash].join('');
            var ext = f.extension;
            var filename = ['original', ext].join('.');
            var path1 = [dir, filename].join('/');

            fs.mkdir(dir, function(err) {
                if (err) { throw err; }

                fs.rename(path0, path1, function(err) {
                    if (err) { throw err; }

                    var d = new Date();
                    var info = {
                        hash:         hash,
                        original: {
                            mimeType: f.mimetype,
                            clientFile: f.originalname,
                            file: filename,
                            sizeInBytes: f.size
                        },
                        createdAt:    d.toISOString(),
                        createdAtN:   d.valueOf(),
                        md5:          md5
                    };
                    var path2 = [dir, 'info.json'].join('/');

                    fs.writeFile(path2, JSON.stringify(info), function(err) {
                        if (err) { throw err; }

                        doServerPlugins(path1, info, function(err) {
                            if (err) { throw err; }

                            res.redirect(['/edit', hash].join('/'));
                        });
                    });
                });
            })
        });
    });
});


app.get('/process/:hash', function(req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) {
            return res.render(
                'error',
                {
                    title: 'media not found',
                    message: 'the hash "' + req.params.hash + '" was not found on the server.'
                }
            );
        }

        var vidPath = getOriginalPath(info);

        doServerPlugins(vidPath, info, function(err) {
            if (err) { throw err; }

            res.redirect(['/watch', req.params.hash].join('/'));
        });
    });
});



app.get('/stream/:hash', function (req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) { throw err; }

        var path = [req.params.hash, info.original.file].join('/');

        send(req, path, {root:'media'})
            //.on('error', error)
            //.on('directory', redirect)
            //.on('headers', headers)
            .pipe(res);
    });
});



app.get('/watch/:hash', function (req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) {
            return res.render(
                'error',
                {
                    title: 'media not found',
                    message: 'the hash "' + req.params.hash + '" was not found on the server.'
                }
            );
        }

        res.render(
            'watch',
            {
                title:           'watch',
                vidPath:         getOriginalPath(info, true),
                info:            info,
                infoS:           JSON.stringify(info),
                enabledPlugins:  ENABLED_PLUGINS.client,
                enabledPluginsS: JSON.stringify(ENABLED_PLUGINS.client)
            }
        );
    });
});



app.get('/edit/:hash', function (req, res) {
    hashToInfo(req.params.hash, function(err, info) {
        if (err) {
            return res.render(
                'error',
                {
                    title: 'media not found',
                    message: 'the hash "' + req.params.hash + '" was not found on the server.'
                }
            );
        }

        res.render(
            'edit',
            {
                title:           'edit',
                vidPath:         getOriginalPath(info, true),
                info:            info,
                infoS:           JSON.stringify(info),
                enabledPlugins:  ENABLED_PLUGINS.client,
                enabledPluginsS: JSON.stringify(ENABLED_PLUGINS.client)
            }
        );
    });
});



app.post('/edit/:hash', function (req, res) {
    var infoKeysToUpdate = req.body;

    hashToInfo(req.params.hash, function(err, info) {
        if (err) {
            return res.render(
                'error',
                {
                    title: 'media not found',
                    message: 'the hash "' + req.params.hash + '" was not found on the server.'
                }
            );
        }

        // add/override sent keys
        for (var k in infoKeysToUpdate) {
            if (!infoKeysToUpdate.hasOwnProperty(k)) { continue; }
            info[k] = infoKeysToUpdate[k];
        }

        saveInfo(req.params.hash, info, function (err) {
            if (err) {
                throw err;
            }

            res.send({status:'ok', info:info});
        });
    });
});



app.listen(PORT, function() {
    console.log('dwarf-media-server app listening on port %s...', PORT);
});
