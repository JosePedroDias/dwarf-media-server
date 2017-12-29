(function() {
  "use strict";

  /**
   * generates on the client an audio wave such as the one used extensively on soundcloud.
   */

  // shims
  const context = new (window.AudioContext || window.webkitAudioContext)();

  if (!context.createGain) {
    context.createGain = context.createGainNode;
  }
  if (!context.createDelay) {
    context.createDelay = context.createDelayNode;
  }
  if (!context.createScriptProcessor) {
    context.createScriptProcessor = context.createJavaScriptNode;
  }

  window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(cb) {
      window.setTimeout(cb, 1000 / 60);
    };

  const PLUGIN_KEY = "audioWave";
  const PLUGIN_NAME = "audio-wave";

  // constants
  const DIMS = [512, 128];
  const SMOOTHING = 0; //0.5; // 0.2 0.5 0.8
  const FFT_SIZE = 32; // 32 - 64 - 2048 - 32768

  // globals
  const an, freqs, dur;
  const mEl, cEl, ctx, lastX, accum, times;
  const running = false;

  function draw() {
    an.getByteFrequencyData(freqs);

    const i,
      I = an.frequencyBinCount;
    const W = DIMS[0];
    const H = DIMS[1];

    const t = mEl.currentTime;

    if (isFinite(t)) {
      const x = Math.floor(t / dur * W);
      const hY = H / 2;

      if (x === lastX) {
        ++times;
        for (i = 0; i < I; ++i) {
          accum += freqs[i];
        }
      } else {
        const v = accum / times / 256 / 10;
        //console.log(x, v, times);
        const dY = v * hY;
        if (dY === 0) {
          dY = 1;
        }
        ctx.fillRect(x - 1, hY - dY, 1, dY * 2);
        accum = 0;
        times = 0;
      }

      lastX = x;
    }

    requestAnimFrame(draw);
  }

  const plugin = {
    keyName: PLUGIN_KEY,

    use: function(_mEl, info, cb) {
      mEl = _mEl;

      const bag = info[PLUGIN_KEY];

      if (!bag) {
        return setTimeout(cb, 0, null);
      }

      const h2El = document.createElement("h2");
      h2El.appendChild(document.createTextNode("AUDIO WAVE:"));
      document.body.appendChild(h2El);

      const ctnEl = document.createElement("div");
      ctnEl.className = PLUGIN_NAME;

      const imgEl = document.createElement("img");
      imgEl.src = bag.dataImage;
      ctnEl.appendChild(imgEl);

      const cursorEl = document.createElement("div");
      ctnEl.appendChild(cursorEl);
      document.body.appendChild(ctnEl);

      mEl.addEventListener("timeupdate", function() {
        const t = mEl.currentTime;
        const d = mEl.duration;

        cursorEl.style.left = (t / d * 100).toFixed(2) + "%";
      });

      setTimeout(cb, 0, null);
    },

    edit: function(_mEl, info, cb) {
      mEl = _mEl;

      const h2El = document.createElement("h2");
      h2El.appendChild(document.createTextNode("AUDIO WAVE:"));
      document.body.appendChild(h2El);

      const pEl = document.createElement("p");
      pEl.appendChild(
        document.createTextNode(
          "let the resourse play all the way to capture the complete wave form"
        )
      );
      document.body.appendChild(pEl);

      mEl.addEventListener("playing", function() {
        if (running) {
          return;
        }

        console.log("%s - running...", PLUGIN_KEY);

        running = true;

        cEl = document.createElement("canvas");
        h2El.parentNode.insertBefore(cEl, h2El.nextSibling);
        //document.body.appendChild(cEl);

        cEl.width = DIMS[0];
        cEl.height = DIMS[1];
        ctx = cEl.getContext("2d");

        dur = mEl.duration;

        lastX = 0;
        accum = 0;
        times = 0;

        an = context.createAnalyser();
        an.smoothingTimeConstant = SMOOTHING;
        an.fftSize = FFT_SIZE;
        an.minDecibels = -140;
        an.maxDecibels = 0;

        const source = context.createMediaElementSource(mEl);
        source.connect(an);
        an.connect(context.destination);

        freqs = new Uint8Array(an.frequencyBinCount);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, DIMS[0], DIMS[1]);

        ctx.fillStyle = "#FFF";

        draw();
      });

      mEl.addEventListener("ended", function() {
        console.log("%s - DONE!", PLUGIN_KEY);
        //console.log( cEl.toDataURL('image/png') );
      });

      const extracter = function(cb) {
        if (!cEl) {
          return setTimeout(cb, 0, null);
        }

        console.log("%s - called extracter", PLUGIN_KEY);
        const data = {
          key: PLUGIN_KEY,
          values: {
            dataImage: cEl.toDataURL("image/png")
          }
        };

        setTimeout(cb, 0, null, data);
      };

      setTimeout(cb, 0, null, extracter);
    }
  };

  if (window.plugins) {
    window.plugins.push(plugin);
  } else {
    window.plugins = [plugin];
  }
})();
