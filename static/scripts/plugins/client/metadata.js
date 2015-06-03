(function() {
    'use strict';

    var PLUGIN_KEY = 'metadata';
    var PLUGIN_NAME = 'metadata';

    var plugin = {
        keyName: PLUGIN_KEY,

        use: function(vidPath, info, cb) {
            if (!(PLUGIN_KEY in info)) {
                return setTimeout(cb, 0, null);
            }

            var v, markup = ['<h2>METADATA:</h2>\n'];
            for (var k in info[PLUGIN_KEY]) {
                if (!info[PLUGIN_KEY].hasOwnProperty(k)) { continue; }
                v = info[PLUGIN_KEY][k];
                if (!v) { continue; }
                markup.push(['<b>', k, '</b>: ', v, '<br/>'].join(''));
            }
            var el = document.createElement('div');
            el.className = PLUGIN_NAME;
            el.innerHTML = markup.join('\n');
            document.body.appendChild(el);

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
