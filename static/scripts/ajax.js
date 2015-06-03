var ajax = function(o) {
    var xhr = new XMLHttpRequest();

    if (o.withCredentials) { xhr.withCredentials = true; }
    xhr.open(o.method || 'GET', o.url, true);

    if ('headers' in o) {
        for (var k in o.headers) {
            if (!o.headers.hasOwnProperty(k)) { continue; }
            xhr.setRequestHeader(k, o.headers[k]);
        }
    }

    var cbInner = function() {
        if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
            return o.cb(null, JSON.parse(xhr.response));
        }
        o.cb('error requesting ' + o.uri);
    };
    xhr.onload  = cbInner;
    xhr.onerror = cbInner;

    var pl = o.payload || null;
    if (pl !== null && typeof pl !== 'string') {
        pl = JSON.stringify(pl);
    }

    xhr.send(pl);
};
