# dwarf-media-server



## what is this about?

exploring a joint approach for serving and handling media on both server-side and client-side.

offering a plugin interface on both sides and a simple JSON structure so plugins can build on each other.

the player itself can be served depending on the resulting data for the media resource.



## requirements

* recent enough node.js
* avconv



## setup

    npm install
    node serve.js



## plugin logic

plugins are asynchronous on both server and client-side

server-side plugins can do processing only (**process** method)

client-side plugins can do any and all of the following: **use**, **edit**, **process**.  

* `use` shows additional info to the video during playback
* `edit` displays form fields during video editing, setting a function which captures user data upon saving
* `process` is reserved to 



## TODO

* add audio-only property based on mime type?
* video plugins opt-out on those (thumb, filmstrip)
* filmstrip dims based on area instead of dumb scale

* authentication without password...
* search features

* processing plugins

    * server-side
        * create SD/HD MP4 with well-supported configs
        * create HLS simple profiles (audio-only, SD, HD)
        * audio wave form
        * speech recognition...
        
    * client-side (experimental)
        * thumbnail capture
        * generate film strip
        * audio wave form
