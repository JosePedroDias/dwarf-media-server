(function() {
    'use strict';

    /*global ENABLED_PLUGINS:false */

    window.player = function(vidPath, info) {

        this.vidPath = vidPath;
        this.info    = info;

        var mEl;

        var playerEl = document.querySelector('#player');

        var doPlugins = function(action, cb) {
            async.mapSeries(
                plugins,
                function(plugin, innerCb) {
                    var fn = plugin[action];
                    if (typeof fn !== 'function') { return setTimeout(innerCb, 0, null); }
                    fn(mEl, info, innerCb);
                },
                cb
            );
        };

        var isAudioOnly = (info && info.metadata && info.metadata.aCodec && (!info.metadata.vCodec));



        // aux
        var pad00 = function(n) {
            return (n < 10) ? '0' + n : n;
        };

        var formatTime = function(t0) {
            var secs = Math.floor(t0 % 60);
            var mins = Math.floor(t0 / 60);
            var h = Math.floor(mins / 60);
            var arr;
            if (h > 0) {
                mins -= h * 60;
                arr = [h, pad00(mins), pad00(secs)];
            }
            else {
                arr = [mins, pad00(secs)];
            }
            return arr.join(':');
        };



        return {
            display: function(cb) {
                mEl = document.createElement(isAudioOnly ? 'audio' : 'video');

                if ('thumb' in info) {
                    mEl.setAttribute('poster', '/' + info.thumb);
                }

                //mEl.setAttribute('autoplay', '');

                //mEl.setAttribute('controls', '');

                mEl.setAttribute('src', vidPath);
                playerEl.appendChild(mEl);

                var ctnEl = document.createElement('div');
                ctnEl.className = 'ui';

                var togglePlaybackEl = document.createElement('button');
                togglePlaybackEl.className = 'toggle-playback';

                var togglePlaybackIconEl = document.createElement('i');
                togglePlaybackIconEl.className = 'fa fa-play';
                togglePlaybackEl.appendChild(togglePlaybackIconEl)

                ctnEl.appendChild( togglePlaybackEl );

                var togglePlayback = function() {
                    if (mEl.paused) { mEl.play();  }
                    else {            mEl.pause(); }
                };

                togglePlaybackEl.addEventListener('click', togglePlayback);
                mEl.addEventListener('click', togglePlayback);

                var timeSliderEl = document.createElement('div');
                timeSliderEl.id = 'time-slider';
                timeSliderEl.className = 'dragdealer';
                timeSliderEl.innerHTML = '<div class="handle"></div>';
                ctnEl.appendChild( timeSliderEl );

                var timeLabelEl = document.createElement('div');
                timeLabelEl.className = 'time-label';
                timeLabelEl.innerHTML = 'x';
                ctnEl.appendChild( timeLabelEl );

                var volumeSliderEl = document.createElement('div');
                volumeSliderEl.id = 'volume-slider';
                volumeSliderEl.className = 'dragdealer';
                volumeSliderEl.innerHTML = '<div class="handle"></div>';
                ctnEl.appendChild( volumeSliderEl );

                var volumeLabelEl = document.createElement('div');
                volumeLabelEl.className = 'volume-label';
                volumeLabelEl.innerHTML = '100%';
                ctnEl.appendChild( volumeLabelEl );

                playerEl.appendChild(ctnEl);

                var d;

                var ts = new Dragdealer(
                    'time-slider',
                    {
                        dragStartCallback: function(x) {
                            mEl.dispatchEvent( new Event('time-sliding-started') );
                        },
                        animationCallback: function(x) {
                            var ev = new CustomEvent('time-sliding', {detail:{r:x}});
                            mEl.dispatchEvent(ev);
                        },
                        dragStopCallback: function(x) {
                            //console.log('time', x);
                            mEl.currentTime = mEl.duration * x;
                            mEl.dispatchEvent( new Event('time-sliding-stopped') );
                        }
                    }
                );

                var vs = new Dragdealer(
                    'volume-slider',
                    {
                        x: 1,
                        //steps: 10,
                        dragStopCallback: function(x, y) {
                            //console.log('volume', x);
                            mEl.volume = x;
                        }
                    }
                );

                var updateTime = function(t, d) {
                    timeLabelEl.firstChild.nodeValue = [
                        formatTime(t),
                        ' / ',
                        formatTime(d)
                    ].join('');
                };

                mEl.addEventListener('loadedmetadata', function() {
                    d = mEl.duration;
                    updateTime(0, d);
                });

                mEl.addEventListener('timeupdate', function() {
                    var t = mEl.currentTime;
                    var r = t / d;
                    updateTime(t, d);
                    //console.log(r);
                    ts.setValue(r);
                });

                mEl.addEventListener('playing', function() {
                    togglePlaybackIconEl.className = 'fa fa-pause';
                });

                mEl.addEventListener('pause', function() {
                    togglePlaybackIconEl.className = 'fa fa-play';
                });

                var updateVolume = function(v) {
                    volumeLabelEl.firstChild.nodeValue = [
                        (v * 100).toFixed(0),
                        '%'
                    ].join('');
                };

                mEl.addEventListener('volumechange', function() {
                    var v = mEl.volume;
                    //console.log(v);
                    updateVolume(v);
                    vs.setValue(v);
                });

                setTimeout(cb, 0, null);
            },

            use: function(cb) {
                doPlugins('use', cb);
            },

            edit: function(cb) {
                doPlugins('edit', cb);
            },

            process: function(cb) {
                doPlugins('process', cb);
            },

            play: function() {
                mEl.play();
            },

            pause: function() {
                mEl.pause();
            }
        }
    };

})();