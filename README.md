# KISS VIDEO UPLOAD/SERVE/PROCESS

exploring an asynchronous plugin logic for both server and client-side

server-side plugins can do processing only (**process** method)

client-side plugins can do any and all of the following: **use**, **edit**, **process**.  

* `use` shows additional info to the video during playback
* `edit` displays form fields during video editing, setting a function which captures user data upon saving
* `process` is reserved to 



# TODO

* authentication without password...
* search features

* processing plugins

    * server-side
        * generate md5 of video. upon new upload, if matches, reuse older one
        * create SD/HD MP4 with well-supported configs
        * create HLS simple profiles (audio-only, SD, HD)
        * thumbnail capture
        * generate film strip
        * audio wave form
        * speech recognition...
        
    * client-side (experimental)
        * thumbnail capture
        * generate film strip
        * audio wave form
