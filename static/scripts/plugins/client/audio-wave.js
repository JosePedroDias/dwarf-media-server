(function() {
    'use strict';

    /**
     * generates on the client an audio wave such as the one used extensively on soundcloud.
     */


    // shims
    var context = new (window.AudioContext || window.webkitAudioContext)();

    if (!context.createGain) {
        context.createGain = context.createGainNode;
    }
    if (!context.createDelay) {
        context.createDelay = context.createDelayNode;
    }
    if (!context.createScriptProcessor) {
        context.createScriptProcessor = context.createJavaScriptNode;
    }

    window.requestAnimFrame = window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(cb) { window.setTimeout(cb, 1000 / 60); };



    var PLUGIN_KEY = 'audioWave';
    var PLUGIN_NAME = 'audio-wave';



    // constants
    var DIMS = [512, 128];
    var SMOOTHING = 0; //0.5; // 0.2 0.5 0.8
    var FFT_SIZE = 32; // 32 - 64 - 2048 - 32768



    // globals
    var an, freqs, dur;
    var mEl, cEl, ctx, lastX, accum, times;
    var running = false;



    function draw() {
        an.getByteFrequencyData(freqs);

        var i, I = an.frequencyBinCount;
        var W = DIMS[0];
        var H = DIMS[1];

        var t = mEl.currentTime;

        if (isFinite(t)) {
            var x = Math.floor(t / dur * W);
            var hY = H / 2;

            if (x === lastX) {
                ++times;
                for (i = 0; i < I; ++i) {
                    accum += freqs[i];
                }
            }
            else {
                var v = accum / times / 256 / 10;
                //console.log(x, v, times);
                var dY = v * hY;
                if (dY === 0) { dY = 1; }
                ctx.fillRect(x - 1, hY - dY, 1, dY * 2);
                accum = 0;
                times = 0;
            }

            lastX = x;
        }

        requestAnimFrame(draw);
    }



    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(_mEl, info, cb) {
            mEl = _mEl;

            var bag = info[PLUGIN_KEY];

            if (!bag) {
                return setTimeout(cb, 0, null);
            }

            var ctnEl = document.createElement('div');
            ctnEl.className = PLUGIN_NAME;

            var imgEl = document.createElement('img');
            imgEl.src = bag.dataImage;
            ctnEl.appendChild(imgEl);

            var cursorEl = document.createElement('div');
            document.body.appendChild(ctnEl);
            ctnEl.appendChild(cursorEl);

            mEl.addEventListener('timeupdate', function() {
                var t = mEl.currentTime;
                var d = mEl.duration;

                cursorEl.style.left = (t/d*100).toFixed(2) + '%';
            });

            setTimeout(cb, 0, null);
        },

        edit: function(_mEl, info, cb) {
            mEl = _mEl;

            mEl.addEventListener('playing', function() {
                if (running) { return; }

                console.log('%s - running...', PLUGIN_KEY);

                running = true;

                cEl = document.createElement('canvas');
                document.body.appendChild(cEl);
                cEl.width  = DIMS[0];
                cEl.height = DIMS[1];
                ctx = cEl.getContext('2d');

                dur = mEl.duration;

                lastX = 0;
                accum = 0;
                times = 0;

                an = context.createAnalyser();
                an.smoothingTimeConstant = SMOOTHING;
                an.fftSize = FFT_SIZE;
                an.minDecibels = -140;
                an.maxDecibels = 0;

                var source = context.createMediaElementSource(mEl);
                source.connect(an);
                an.connect(context.destination);

                freqs = new Uint8Array(an.frequencyBinCount);

                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, DIMS[0], DIMS[1]);

                ctx.fillStyle = '#FFF';

                draw();
            });

            mEl.addEventListener('ended', function() {
                console.log('%s - DONE!', PLUGIN_KEY);
                //console.log( cEl.toDataURL('image/png') );
            });

            var extracter = function(cb) {
                if (!cEl) {
                    return setTimeout(cb, 0, null);
                }

                console.log('%s - called extracter', PLUGIN_KEY);
                var data = {
                    key: PLUGIN_KEY,
                    values: {
                        dataImage: cEl.toDataURL('image/png')
                    }
                };

                setTimeout(cb, 0, null, data);
            };

            setTimeout(cb, 0, null, extracter);
        }
    };



    if (window.plugins) {
        window.plugins.push(plugin);
    }
    else {
        window.plugins = [plugin];
    }
})();
