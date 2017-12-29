(function() {
  "use strict";

  /**
   *
   */

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

  const PLUGIN_KEY = "sampleAudio";
  const PLUGIN_NAME = "sample-audio";

  const DIMS = [512, 256];
  const SMOOTHING = 0.8; // 0.2 0.5 0.8
  const FFT_SIZE = 128; // 32 - 64 - 2048 - 32768

  let an, times, freqs;
  let mEl, cEl, ctx;

  function draw() {
    an.getByteFrequencyData(freqs);
    an.getByteTimeDomainData(times);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, DIMS[0], DIMS[1]);

    let i;
    const I = an.frequencyBinCount;
    const W = DIMS[0];
    const H = DIMS[1];

    let x, y;
    const bW = W / I;

    // frequency domain chart
    ctx.fillStyle = "#F00";
    for (i = 0; i < I; ++i) {
      x = i * bW;
      y = freqs[i] / 256 * H;
      ctx.fillRect(x, H - y - 1, bW, y);
    }

    // time domain chart
    ctx.strokeStyle = "#0F0";
    ctx.lineWidth = 4; //bW / 2;
    ctx.beginPath();
    for (i = 0; i < I; ++i) {
      x = i * bW + bW / 2;
      y = times[i] / 256 * H;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    requestAnimFrame(draw);
  }

  const plugin = {
    keyName: PLUGIN_KEY,

    use: function(_mEl, info, cb) {
      mEl = _mEl;

      mEl.addEventListener("loadeddata", function() {
        const h2El = document.createElement("h2");
        h2El.appendChild(document.createTextNode("SAMPLE AUDIO:"));
        document.body.appendChild(h2El);

        cEl = document.createElement("canvas");
        document.body.appendChild(cEl);
        cEl.width = DIMS[0];
        cEl.height = DIMS[1];
        ctx = cEl.getContext("2d");

        an = context.createAnalyser();
        an.smoothingTimeConstant = SMOOTHING;
        an.fftSize = FFT_SIZE;
        an.minDecibels = -140;
        an.maxDecibels = 0;

        const source = context.createMediaElementSource(mEl);
        source.connect(an);
        an.connect(context.destination);

        freqs = new Uint8Array(an.frequencyBinCount);
        times = new Uint8Array(an.frequencyBinCount);

        draw();
      });

      setTimeout(cb, 0, null);
    }
  };

  if (window.plugins) {
    window.plugins.push(plugin);
  } else {
    window.plugins = [plugin];
  }
})();
