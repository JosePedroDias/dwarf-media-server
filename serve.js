const fs = require("fs");

const express = require("express");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const multer = require("multer");
const send = require("send");
const async = require("async");

const MEDIA_DIR = "media";

const upload = multer({
  dest: "tmp/",
  fileSize: 256 * 1024 * 1024
});

const md5File = require("./lib/md5-file");

const PORT = 3000;

const ENABLED_PLUGINS = {
  server: [
    "metadata",
    //"thumb",
    "filmstrip"
  ],
  client: [
    "user-filled-info",
    "metadata",
    "filmstrip"
    //,'thumb-cli'
    //"sample-audio",
    //"audio-wave",
  ]
};

const app = express();

app.engine(
  ".hbs",
  expHbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      iff: function(conditional, options) {
        if (options.hash.desired === options.hash.type) {
          options.fn(this);
        } else {
          options.inverse(this);
        }
      }
    }
  })
);
app.set("view engine", ".hbs");

app.use("/static", express.static("static"));
app.use("/media", express.static(MEDIA_DIR));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function rndBase32(len) {
  return (~~(Math.random() * Math.pow(32, len))).toString(32);
}

function hashToInfo(hash, cb) {
  fs.readFile([MEDIA_DIR, hash, "info.json"].join("/"), function(err, o) {
    if (err) {
      return cb(err);
    }

    cb(null, JSON.parse(o));
  });
}

function saveInfo(hash, info, cb) {
  fs.writeFile(
    [MEDIA_DIR, hash, "info.json"].join("/"),
    JSON.stringify(info),
    cb
  );
}

function getOriginalPath(info, onClient) {
  if (onClient) {
    return ["/stream", info.hash].join("/");
  }
  return [MEDIA_DIR, info.hash, info.original.file].join("/");
}

function getInfos(cb) {
  fs.readdir(MEDIA_DIR, function(err, files) {
    if (err) {
      return cb(err);
    }

    async.mapLimit(files, 4, hashToInfo, function(err, infos) {
      if (err) {
        throw err;
      }

      cb(null, infos);
    });
  });
}

function doServerPlugins(vidPath, info, cb) {
  const hash = info.hash;

  console.log("calling server plugins for hash %s...", hash);

  async.eachSeries(
    ENABLED_PLUGINS.server,
    function(plugin, innerCb) {
      console.log("* %s...", plugin);
      const fn = require("./static/scripts/plugins/server/" + plugin).process;
      fn(vidPath, info, innerCb);
    },
    function(err) {
      if (err) {
        return cb(err);
      }

      console.log("all done. saving...");

      saveInfo(hash, info, cb);
    }
  );
}

app.get("/", function(req, res) {
  //res.render('home', {title:'home'});
  res.redirect("/list");
});

app.get("/list", function(req, res) {
  getInfos(function(err, infos) {
    if (err) {
      throw err;
    }

    res.render("list", { title: "list", infos: infos });
  });
});

app.get("/upload", function(req, res) {
  res.render("upload", { title: "upload" });
});

app.post("/upload", upload.single("file"), function(req, res) {
  const f = req.file;
  const path0 = f.path;

  getInfos(function(err, infos) {
    if (err) {
      throw err;
    }

    const md5s = infos.map(function(info) {
      return info.md5;
    });

    md5File(path0, function(err, md5) {
      if (err) {
        throw err;
      }

      const idx = md5s.indexOf(md5);
      if (idx !== -1) {
        return res.redirect(["/watch", infos[idx].hash].join("/"));
      }

      const hash = rndBase32(6);
      const dir = [MEDIA_DIR, hash].join("/");
      const ext = f.originalname.split(".").pop(); // || 'mp4';
      const filename = ["original", ext].join(".");
      const path1 = [dir, filename].join("/");

      fs.mkdir(dir, function(err) {
        if (err) {
          throw err;
        }

        fs.rename(path0, path1, function(err) {
          // @TODO this rename doesn't free original file (at least in windows)
          if (err) {
            throw err;
          }

          const d = new Date();
          const info = {
            hash: hash,
            original: {
              mimeType: f.mimetype,
              clientFile: f.originalname,
              file: filename,
              sizeInBytes: f.size
            },
            createdAt: d.toISOString(),
            createdAtN: d.valueOf(),
            md5: md5
          };
          const path2 = [dir, "info.json"].join("/");

          fs.writeFile(path2, JSON.stringify(info), function(err) {
            if (err) {
              throw err;
            }

            doServerPlugins(path1, info, function(err) {
              if (err) {
                throw err;
              }

              res.redirect(["/edit", hash].join("/"));
            });
          });
        });
      });
    });
  });
});

app.get("/process/:hash", function(req, res) {
  hashToInfo(req.params.hash, function(err, info) {
    if (err) {
      return res.render("error", {
        title: "media not found",
        message:
          'the hash "' + req.params.hash + '" was not found on the server.'
      });
    }

    const vidPath = getOriginalPath(info);

    doServerPlugins(vidPath, info, function(err) {
      if (err) {
        throw err;
      }

      res.redirect(["/watch", req.params.hash].join("/"));
    });
  });
});

app.get("/stream/:hash", function(req, res) {
  hashToInfo(req.params.hash, function(err, info) {
    if (err) {
      throw err;
    }

    const path = [req.params.hash, info.original.file].join("/");

    send(req, path, { root: MEDIA_DIR })
      //.on('error', error)
      //.on('directory', redirect)
      //.on('headers', headers)
      .on("headers", function(res, path, stat) {
        res.setHeader("Access-Control-Allow-Origin", "*");
      })
      .pipe(res);
  });
});

app.get("/watch/:hash", function(req, res) {
  hashToInfo(req.params.hash, function(err, info) {
    if (err) {
      return res.render("error", {
        title: "media not found",
        message:
          'the hash "' + req.params.hash + '" was not found on the server.'
      });
    }

    res.render("watch", {
      title: "watch",
      vidPath: getOriginalPath(info, true),
      mediaDir: MEDIA_DIR,
      info: info,
      infoS: JSON.stringify(info),
      enabledPlugins: ENABLED_PLUGINS.client,
      enabledPluginsS: JSON.stringify(ENABLED_PLUGINS.client)
    });
  });
});

app.get("/edit/:hash", function(req, res) {
  hashToInfo(req.params.hash, function(err, info) {
    if (err) {
      return res.render("error", {
        title: "media not found",
        message:
          'the hash "' + req.params.hash + '" was not found on the server.'
      });
    }

    res.render("edit", {
      title: "edit",
      vidPath: getOriginalPath(info, true),
      info: info,
      infoS: JSON.stringify(info),
      enabledPlugins: ENABLED_PLUGINS.client,
      enabledPluginsS: JSON.stringify(ENABLED_PLUGINS.client)
    });
  });
});

app.post("/edit/:hash", function(req, res) {
  const infoKeysToUpdate = req.body;

  hashToInfo(req.params.hash, function(err, info) {
    if (err) {
      return res.render("error", {
        title: "media not found",
        message:
          'the hash "' + req.params.hash + '" was not found on the server.'
      });
    }

    // add/override sent keys
    for (const k in infoKeysToUpdate) {
      if (!infoKeysToUpdate.hasOwnProperty(k)) {
        continue;
      }
      info[k] = infoKeysToUpdate[k];
    }

    saveInfo(req.params.hash, info, function(err) {
      if (err) {
        throw err;
      }

      res.send({ status: "ok", info: info });
    });
  });
});

app.listen(PORT, function() {
  console.log("dwarf-media-server app listening on port %s...", PORT);
});
