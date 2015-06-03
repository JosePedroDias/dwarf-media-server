(function() {
    'use strict';

    var PLUGIN_KEY = 'userFilledInfo';
    var PLUGIN_NAME = 'user-filled-info';

    var plugin = {
        keyName: PLUGIN_KEY,

        /*process: function(vidPath, info, cb) {
         throw 'TODO?';
         },*/

        use: function(vidPath, info, cb) {
            if (!(PLUGIN_KEY in info)) {
                return setTimeout(cb, 0, null);
            }

            var v, markup = ['<h2>USER FILLED INFO:</h2>\n'];
            for (var k in info[PLUGIN_KEY]) {
                if (!info[PLUGIN_KEY].hasOwnProperty(k)) { continue; }
                v = info[PLUGIN_KEY][k];
                markup.push(['<b>', k, '</b>: ', v, '<br/>'].join(''));
            }

            var el = document.createElement('div');
            el.className = PLUGIN_NAME;
            el.innerHTML = markup.join('\n');
            document.body.appendChild(el);

            return setTimeout(cb, 0, null);
        },

        edit: function(vidPath, info, cb) {
            var bag = info[PLUGIN_KEY];
            if (!bag) {
                info[PLUGIN_KEY] = bag = {
                    title: '',
                    description: '',
                    tags:  ''
                };
            }
            var markup = [
                '<div>',
                    '<p>',
                        '<label for="ufi-title">title</label>',
                        '<input id="ufi-title" value="' + bag.title + '">',
                    '</p>',
                    '<p>',
                        '<label for="ufi-description">description</label>',
                        '<textarea id="ufi-description">' + bag.description + '</textarea>',
                    '</p>',
                    '<p>',
                        '<label for="ufi-tags">tags</label>',
                        '<input id="ufi-tags" value="' + bag.tags + '">',
                    '</p>',
                '</div>'
            ];

            var el = document.createElement('div');
            el.className = 'user-filled-info';
            el.innerHTML = markup.join('\n');
            document.body.appendChild(el);

            var extracter = function(cb) {
                var data = {
                    key: PLUGIN_KEY,
                    values: {
                        title: document.getElementById('ufi-title').value,
                        description: document.getElementById('ufi-description').value,
                        tags: document.getElementById('ufi-tags').value
                    }
                };

                setTimeout(cb, 0, null, data);
            };

            return setTimeout(cb, 0, null, extracter);
        }
    };



    if (window.plugins) {
        window.plugins.push(plugin);
    }
    else {
        window.plugins = [plugin];
    }
})();
