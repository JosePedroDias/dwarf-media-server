(function() {
  "use strict";

  /**
   * in edit mode exposes form fields for user to complete title, description and tags.
   * in watch mode, displays those fields
   */

  const PLUGIN_KEY = "userFilledInfo";
  const PLUGIN_NAME = "user-filled-info";

  const plugin = {
    keyName: PLUGIN_KEY,

    use: function(mEl, info, cb) {
      if (!(PLUGIN_KEY in info)) {
        return setTimeout(cb, 0, null);
      }

      let v;
      const markup = ["<h2>USER FILLED INFO:</h2>\n"];
      for (const k in info[PLUGIN_KEY]) {
        if (!info[PLUGIN_KEY].hasOwnProperty(k)) {
          continue;
        }
        v = info[PLUGIN_KEY][k];
        markup.push(["<b>", k, "</b>: ", v, "<br/>"].join(""));
      }

      const el = document.createElement("div");
      el.className = PLUGIN_NAME;
      el.innerHTML = markup.join("\n");
      document.body.appendChild(el);

      return setTimeout(cb, 0, null);
    },

    edit: function(mEl, info, cb) {
      let bag = info[PLUGIN_KEY];
      if (!bag) {
        info[PLUGIN_KEY] = bag = {
          title: info.original.clientFile,
          description: "",
          tags: ""
        };
      }
      const markup = [
        "<h2>USER FILLED INFO:</h2>",
        "<div>",
        "<p>",
        '<label for="ufi-title">title</label>',
        '<input id="ufi-title" value="' + bag.title + '">',
        "</p>",
        "<p>",
        '<label for="ufi-description">description</label>',
        '<textarea id="ufi-description">' + bag.description + "</textarea>",
        "</p>",
        "<p>",
        '<label for="ufi-tags">tags</label>',
        '<input id="ufi-tags" value="' + bag.tags + '">',
        "</p>",
        "</div>"
      ];

      const el = document.createElement("div");
      el.className = "user-filled-info";
      el.innerHTML = markup.join("\n");
      document.body.appendChild(el);

      const extracter = function(cb) {
        const data = {
          key: PLUGIN_KEY,
          values: {
            title: document.getElementById("ufi-title").value,
            description: document.getElementById("ufi-description").value,
            tags: document.getElementById("ufi-tags").value
          }
        };

        setTimeout(cb, 0, null, data);
      };

      setTimeout(cb, 0, null, extracter);
    }
  };

  if (window.plugins) {
    window.plugins.push(plugin);
  } else {
    window.plugins = [plugin];
  }
})();
