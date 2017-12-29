const ajax = function(o) {
  "use strict";
  const xhr = new XMLHttpRequest();

  if (o.withCredentials) {
    xhr.withCredentials = true;
  }
  xhr.open(o.method || "GET", o.url, true);

  if ("headers" in o) {
    for (const k in o.headers) {
      if (!o.headers.hasOwnProperty(k)) {
        continue;
      }
      xhr.setRequestHeader(k, o.headers[k]);
    }
  }

  const cbInner = function() {
    if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
      return o.cb(null, JSON.parse(xhr.response));
    }
    o.cb("error requesting " + o.uri);
  };
  xhr.onload = cbInner;
  xhr.onerror = cbInner;

  let pl = o.payload || null;
  if (pl !== null && typeof pl !== "string") {
    pl = JSON.stringify(pl);
  }

  xhr.send(pl);
};
