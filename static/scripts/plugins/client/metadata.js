(function() {
  "use strict";

  const PLUGIN_KEY = "metadata";
  const PLUGIN_NAME = "metadata";

  const plugin = {
    keyName: PLUGIN_KEY,

    use: function(mEl, info, cb) {
      if (!(PLUGIN_KEY in info)) {
        return setTimeout(cb, 0, null);
      }

      let v,
        markup = ["<h2>METADATA:</h2>\n"];
      for (let k in info[PLUGIN_KEY]) {
        if (!info[PLUGIN_KEY].hasOwnProperty(k)) {
          continue;
        }
        v = info[PLUGIN_KEY][k];
        if (!v) {
          continue;
        }
        markup.push(["<b>", k, "</b>: ", v, "<br/>"].join(""));
      }
      const el = document.createElement("div");
      el.className = PLUGIN_NAME;
      el.innerHTML = markup.join("\n");
      document.body.appendChild(el);

      return setTimeout(cb, 0, null);
    }
  };

  if (window.plugins) {
    window.plugins.push(plugin);
  } else {
    window.plugins = [plugin];
  }
})();
