(function() {
    'use strict';

    /**
     * displays nearest thumbnail on time slider
     */

    var PLUGIN_KEY = 'filmstrip';
    var PLUGIN_NAME = 'filmstrip';

    /*
{
  "height": 768,
  "frameDimensions": [
    64,
    48
  ],
  "frames": 16,
  "imageFile": "media/r3hniu/filmstrip.jpg"
}
     */

    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(mEl, info, cb) {
            var bag = info[PLUGIN_KEY];
            if (!bag) {
                return setTimeout(cb, 0, null);
            }

            var timeSliderHandleEl = document.querySelector('#time-slider .handle');

            var ctnEl = document.createElement('div');
            ctnEl.className = PLUGIN_NAME + ' disabled';
            ctnEl.style.marginTop = ['-', bag.frameDimensions[1], 'px'].join('');
            ctnEl.style.marginLeft = ['-', ~~( (bag.frameDimensions[0] - 12)/2), 'px'].join('');
            ctnEl.style.width  = bag.frameDimensions[0] + 'px';
            ctnEl.style.height = bag.frameDimensions[1] + 'px';

            var imgEl = document.createElement('img');
            imgEl.src = '/' + bag.imageFile;
            ctnEl.appendChild(imgEl);

            timeSliderHandleEl.appendChild(ctnEl);

            var fH = bag.frameDimensions[1];
            var frames = bag.frames;

            var disabled = true;

            mEl.addEventListener('time-sliding-started', function() {
                disabled = false;
                ctnEl.className = PLUGIN_NAME;
            });

            mEl.addEventListener('time-sliding-stopped', function() {
                disabled = true;
                ctnEl.className = PLUGIN_NAME + ' disabled';
            });

            mEl.addEventListener('time-sliding', function(ev) {
                if (disabled) { return; }
                var r = ev.detail.r;
                var i = Math.floor( r * frames);
                imgEl.style.top = ['-', fH * i, 'px'].join('');
            });

            return setTimeout(cb, 0, null);
        }
    };



    if (window.plugins) {
        window.plugins.push(plugin);
    }
    else {
        window.plugins = [plugin];
    }
})();
