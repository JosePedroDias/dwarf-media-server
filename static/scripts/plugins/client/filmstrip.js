(function() {
  "use strict";

  /**
   * displays nearest thumbnail on time slider
   */

  const PLUGIN_KEY = "filmstrip";
  const PLUGIN_NAME = "filmstrip";

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

  const plugin = {
    keyName: PLUGIN_KEY,

    use: function(mEl, info, cb) {
      const bag = info[PLUGIN_KEY];
      if (!bag) {
        return setTimeout(cb, 0, null);
      }

      const timeSliderHandleEl = document.querySelector("#time-slider .handle");

      const ctnEl = document.createElement("div");
      ctnEl.className = PLUGIN_NAME + " disabled";
      ctnEl.style.marginTop = ["-", bag.frameDimensions[1], "px"].join("");
      ctnEl.style.marginLeft = [
        "-",
        ~~((bag.frameDimensions[0] - 12) / 2),
        "px"
      ].join("");
      ctnEl.style.width = bag.frameDimensions[0] + "px";
      ctnEl.style.height = bag.frameDimensions[1] + "px";

      const imgEl = document.createElement("img");
      imgEl.src = "/" + bag.imageFile;
      ctnEl.appendChild(imgEl);

      timeSliderHandleEl.appendChild(ctnEl);

      const NW = Math.round(bag.mosaicDimensions[0] / bag.frameDimensions[0]);
      const fW = bag.frameDimensions[0];
      const fH = bag.frameDimensions[1];
      const N = bag.frames;

      let disabled = true;

      mEl.addEventListener("time-sliding-started", function() {
        disabled = false;
        ctnEl.className = PLUGIN_NAME;
      });

      mEl.addEventListener("time-sliding-stopped", function() {
        disabled = true;
        ctnEl.className = PLUGIN_NAME + " disabled";
      });

      mEl.addEventListener("time-sliding", function(ev) {
        if (disabled) {
          return;
        }
        const r = ev.detail.r;
        const i = Math.floor(r * N);
        const x = i % NW;
        const y = Math.floor(i / NW);
        imgEl.style.left = ["-", fW * x, "px"].join("");
        imgEl.style.top = ["-", fH * y, "px"].join("");
        //console.log("#%s - x:%s y:%s", i, x, y);
      });

      return setTimeout(cb, 0, null);
    }
  };

  if (window.plugins) {
    window.plugins.push(plugin);
  } else {
    window.plugins = [plugin];
  }
})();
