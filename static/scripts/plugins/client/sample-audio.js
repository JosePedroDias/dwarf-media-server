(function() {
    'use strict';

    /**
     *
     */

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

    var PLUGIN_KEY = 'sampleAudio';
    var PLUGIN_NAME = 'sample-audio';

    var DIMS = [300, 100];
    var SMOOTHING = 0.8;
    var FFT_SIZE = 2048;

    // http://webaudioapi.com/samples/visualizer/visualizer-sample.js

    var mEl, cEl, ctx;

    var draw = function() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, dims[0], dims[1]);
    };

    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(vidPath, info, cb) {
            mEl = document.querySelector('video, audio');
            mEl.addEventListener('loadeddata', function() {
                cEl = document.createElement('canvas');
                document.body.appendChild(cEl);
                cEl.width  = dims[0];
                cEl.height = dims[1];
                ctx = document.getContext('2d');

                var d = mEl.duration;
                console.log(d);

                var analyser = context.createAnalyser();

                analyser.connect(context.destination);
                analyser.minDecibels = -140;
                analyser.maxDecibels = 0;

                var freqs = new Uint8Array(analyser.frequencyBinCount);
                var times = new Uint8Array(analyser.frequencyBinCount);

                draw();
            });
        }
    };



    if (window.plugins) {
        window.plugins.push(plugin);
    }
    else {
        window.plugins = [plugin];
    }
})();
