(function() {
  "use strict";

  /*global ENABLED_PLUGINS:false */

  window.player = function(vidPath, info, mediaDir) {
    this.vidPath = vidPath;
    this.info = info;

    let mEl;

    const playerEl = document.querySelector("#player");

    const doPlugins = function(action, cb) {
      async.mapSeries(
        plugins,
        function(plugin, innerCb) {
          const fn = plugin[action];
          if (typeof fn !== "function") {
            return setTimeout(innerCb, 0, null);
          }
          fn(mEl, info, innerCb);
        },
        cb
      );
    };

    const isAudioOnly =
      info && info.metadata && info.metadata.aCodec && !info.metadata.vCodec;

    // aux
    const pad00 = function(n) {
      return n < 10 ? "0" + n : n;
    };

    const formatTime = function(t0) {
      const secs = Math.floor(t0 % 60);
      const mins = Math.floor(t0 / 60);
      const h = Math.floor(mins / 60);
      let arr;
      if (h > 0) {
        mins -= h * 60;
        arr = [h, pad00(mins), pad00(secs)];
      } else {
        arr = [mins, pad00(secs)];
      }
      return arr.join(":");
    };

    return {
      display: function(cb) {
        mEl = document.createElement(isAudioOnly ? "audio" : "video");

        if ("thumb" in info) {
          mEl.setAttribute("poster", "/" + info.thumb);
        }

        if ("webvtt" in info) {
          const trackEl = document.createElement("track");
          trackEl.setAttribute("default", "");
          trackEl.setAttribute(
            "src",
            "/" + mediaDir + "/" + info.hash + "/" + info.webvtt
          );
          mEl.appendChild(trackEl);
        }

        //mEl.setAttribute("autoplay", "");

        //mEl.setAttribute('controls', '');

        mEl.setAttribute("src", vidPath);
        playerEl.appendChild(mEl);

        const ctnEl = document.createElement("div");
        ctnEl.className = "ui";

        const togglePlaybackEl = document.createElement("button");
        togglePlaybackEl.className = "toggle-playback button";

        const togglePlaybackIconEl = document.createElement("i");
        togglePlaybackIconEl.className = "fa fa-play";
        togglePlaybackEl.appendChild(togglePlaybackIconEl);

        ctnEl.appendChild(togglePlaybackEl);

        const togglePlayback = function() {
          if (mEl.paused) {
            mEl.play();
          } else {
            mEl.pause();
          }
        };

        togglePlaybackEl.addEventListener("click", togglePlayback);
        mEl.addEventListener("click", togglePlayback);

        const timeSliderEl = document.createElement("div");
        timeSliderEl.id = "time-slider";
        timeSliderEl.className = "dragdealer";
        timeSliderEl.innerHTML = '<div class="handle"></div>';
        ctnEl.appendChild(timeSliderEl);

        const timeLabelEl = document.createElement("div");
        timeLabelEl.className = "time-label";
        timeLabelEl.innerHTML = "x";
        ctnEl.appendChild(timeLabelEl);

        const volumeSliderEl = document.createElement("div");
        volumeSliderEl.id = "volume-slider";
        volumeSliderEl.className = "dragdealer";
        volumeSliderEl.innerHTML = '<div class="handle"></div>';
        ctnEl.appendChild(volumeSliderEl);

        const volumeLabelEl = document.createElement("div");
        volumeLabelEl.className = "volume-label";
        volumeLabelEl.innerHTML = "100%";
        ctnEl.appendChild(volumeLabelEl);

        playerEl.appendChild(ctnEl);

        let d;

        const ts = new Dragdealer("time-slider", {
          dragStartCallback: function(x) {
            mEl.dispatchEvent(new Event("time-sliding-started"));
          },
          animationCallback: function(x) {
            const ev = new CustomEvent("time-sliding", { detail: { r: x } });
            mEl.dispatchEvent(ev);
          },
          dragStopCallback: function(x) {
            //console.log('time', x);
            mEl.currentTime = mEl.duration * x;
            mEl.dispatchEvent(new Event("time-sliding-stopped"));
          }
        });

        const vs = new Dragdealer("volume-slider", {
          x: 1,
          //steps: 10,
          dragStopCallback: function(x, y) {
            //console.log('volume', x);
            mEl.volume = x;
          }
        });

        const updateTime = function(t, d) {
          timeLabelEl.firstChild.nodeValue = [
            formatTime(t),
            " / ",
            formatTime(d)
          ].join("");
        };

        mEl.addEventListener("loadedmetadata", function() {
          d = mEl.duration;
          updateTime(0, d);
        });

        mEl.addEventListener("timeupdate", function() {
          const t = mEl.currentTime;
          const r = t / d;
          updateTime(t, d);
          //console.log(r);
          ts.setValue(r);
        });

        mEl.addEventListener("playing", function() {
          togglePlaybackIconEl.className = "fa fa-pause";
        });

        mEl.addEventListener("pause", function() {
          togglePlaybackIconEl.className = "fa fa-play";
        });

        const updateVolume = function(v) {
          volumeLabelEl.firstChild.nodeValue = [(v * 100).toFixed(0), "%"].join(
            ""
          );
        };

        mEl.addEventListener("volumechange", function() {
          const v = mEl.volume;
          //console.log(v);
          updateVolume(v);
          vs.setValue(v);
        });

        setTimeout(cb, 0, null);
      },

      use: function(cb) {
        doPlugins("use", cb);
      },

      edit: function(cb) {
        doPlugins("edit", cb);
      },

      process: function(cb) {
        doPlugins("process", cb);
      },

      play: function() {
        mEl.play();
      },

      pause: function() {
        mEl.pause();
      }
    };
  };
})();
