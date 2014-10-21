(function(window) {

"use strict";


/**
 * Top namespace object for everything Spiritual. On startup, the global variable `gui` gets
 * redefined to an instance of {gui.Spiritual}. All these constants get copied in the process.
 */
window.gui = {

    /**
     * Current version (injected during build process).
     * @see https://www.npmjs.org/package/grunt-spiritual-build
     * @type {string} (majorversion.minorversion.patchversion)
     */
    version: '0.1.6',

    /**
     * TODO: comment on 'gui.Namespace' goes here.
     * @type {boolean}
     */
    portals: true,

    /**
     * Flag general debug mode.
     * @type {boolean}
     */
    debug: false,

    /**
     * Robot mode: Automatically spiritualize and
     * materialize by overriding native DOM methods.
     * @type {string}
     */
    MODE_ROBOT: "robot",

    /**
     * Human mode: Spiritualize and materialize at own risk.
     * @type {string}
     */
    MODE_HUMAN: "human",

    /**
     * Funny mode: Spiritualize manually, materialize automatically.
     * @type {string}
     */
    MODE_FUNNY: "funny",

    /**
     * @TODO: This ain't up to date no more...
     * @TODO: leave the URL alone a see if we can postMessage these things just in time...
     * The {gui.IframeSpirit} will stamp this querystring parameter into any URL it loads.
     * The value of the parameter matches the iframespirits '$contextid'. Value becomes the
     * '$contextid' of the local 'gui' object (a {gui.Spiritual} instance). This establishes
     * a relation between iframe and hosted document that can be used for xdomain stuff.
     * @type {string}
     */
    PARAM_CONTEXTID: "gui-contextid",
    PARAM_XHOST: "gui-xhost",

    /**
     * Global broadcasts
     * TODO: harmonize some naming with action types
     */
    BROADCAST_KICKSTART: "gui-broadcast-kickstart",
    BROADCAST_WILL_SPIRITUALIZE: "gui-broadcast-will-spiritualize",
    BROADCAST_DID_SPIRITUALIZE: "gui-broadcast-did-spiritualize",
    BROADCAST_MOUSECLICK: "gui-broadcast-mouseevent-click",
    BROADCAST_MOUSEMOVE: "gui-broadcast-mouseevent-mousemove",
    BROADCAST_MOUSEDOWN: "gui-broadcast-mouseevent-mousedown",
    BROADCAST_MOUSEUP: "gui-broadcast-mouseevent-mouseup",
    BROADCAST_SCROLL: "gui-broadcast-window-scroll",
    BROADCAST_RESIZE: "gui-broadcast-window-resize",
    BROADCAST_RESIZE_END: "gui-broadcast-window-resize-end",
    BROADCAST_POPSTATE: "gui-broadcast-window-popstate",
    BROADCAST_HASHCHANGE: "gui-broadcast-window-hashchange",
    BROADCAST_ORIENTATIONCHANGE: "gui-broadcast-orientationchange",
    BROADCAST_LOADING_CHANNELS: "gui-broadcast-loading-channels",
    BROADCAST_CHANNELS_LOADED: "gui-broadcast-channels-loaded",
    BROADCAST_TWEEN: "gui-broadcast-tween",
    BROADCAST_WILL_UNLOAD: "gui-broadcast-will-unload",
    BROADCAST_UNLOAD: "gui-broadcast-unload",

    /** 
     * Plugin broadcast types that should leave core.
     */
    BROADCAST_ATTENTION_ENTER: "gui-broadcast-attention-enter",
    BROADCAST_ATTENTION_EXIT: "gui-broadcast-attention-exit",
    BROADCAST_ATTENTION_MOVE: "gui-broadcast-attention-move",

    /** 
     * Global actions
     */
    //ACTION_DOC_ONCONSTRUCT : "gui-action-document-construct",
    ACTION_DOC_ONDOMCONTENT: "gui-action-document-domcontent",
    ACTION_DOC_ONLOAD: "gui-action-document-onload",
    ACTION_DOC_ONHASH: "gui-action-document-onhash",
    ACTION_DOC_ONSPIRITUALIZED: "gui-action-document-spiritualized",
    ACTION_DOC_UNLOAD: "gui-action-document-unload",
    //ACTION_DOC_FIT : "gui-action-document-fit",

    /**
     * Framework internal actions of little use.
     */
    $ACTION_XFRAME_VISIBILITY: "gui-action-xframe-visibility",

    /**
     * Local actions.
     */
    ACTION_WINDOW_LOADING: "gui-action-window-loading",
    ACTION_WINDOW_LOADED: "gui-action-window-loaded",

    /**
     * Lifecycle types (all spirits)
     */
    LIFE_CONSTRUCT: "gui-life-construct",
    LIFE_CONFIGURE: "gui-life-configure",
    LIFE_ENTER: "gui-life-enter",
    LIFE_ATTACH: "gui-life-attach",
    LIFE_READY: "gui-life-ready",
    LIFE_DETACH: "gui-life-detach",
    LIFE_EXIT: "gui-life-exit",
    LIFE_ASYNC: "gui-life-async",
    LIFE_DESTRUCT: "gui-life-destruct",
    LIFE_VISIBLE: "gui-life-visible",
    LIFE_INVISIBLE: "gui-life-invisible",
    LIFE_RENDER: "gui-life-render", // belongs to edb.module really...

    /**
     * Lifecycle types (some spirits)
     */
    LIFE_IFRAME_CONSTRUCT: "gui-life-iframe-construct",
    LIFE_IFRAME_DOMCONTENT: "gui-life-iframe-domcontent",
    LIFE_IFRAME_SPIRITUALIZED: "gui-life-iframe-spiritualized",
    LIFE_IFRAME_ONLOAD: "gui-life-iframe-onload",
    LIFE_IFRAME_ONHASH: "gui-life-iframe-onhash",
    LIFE_IFRAME_UNLOAD: "gui-life-iframe-unload",

    /**
     * Tick types (timed events)
     */
    TICK_DOC_FIT: "gui-tick-document-fit", // @TODO: deprecated
    $TICK_INSIDE: "gui-tick-spirits-inside",
    $TICK_OUTSIDE: "gui-tick-spirits-outside",
    $TICK_DESTRUCT: "gui-tick-spirits-destruct",

    /**
     * Crawler types
     */
    CRAWLER_SPIRITUALIZE: "gui-crawler-spiritualize",
    CRAWLER_MATERIALIZE: "gui-crawler-materialize",
    CRAWLER_DETACH: "gui-crawler-detach",
    CRAWLER_DISPOSE: "gui-crawler-dispose", // ??????
    CRAWLER_ACTION: "gui-crawler-action",
    CRAWLER_VISIBLE: "gui-crawler-visible",
    CRAWLER_INVISIBLE: "gui-crawler-invisible",
    // CRAWLER_DOMPATCHER : "gui-crawler-webkit-dompatcher",

    /** 
     * CSS classnames (underscore is to indicate that the classname are managed by JS)
     */
    CLASS_NOSPIRITS: "gui-nospirits", // declare spirit-free zone (performance)
    CLASS_INVISIBLE: "_gui-invisible",
    CLASS_HIDDEN: "_gui-hidden",
    CLASS_COVER: "_gui-cover",

    /**
     * Timeout in milliseconds before we decide that user is finished resizing the window.
     */
    TIMEOUT_RESIZE_END: 250,

    /**
     * Device orientation.
     * TODO: Get this out of here, create gui.Device or something
     */
    orientation: 0,
    ORIENTATION_PORTRAIT: 0,
    ORIENTATION_LANDSCAPE: 1
};



/**
 * Resolve an URL string relative to a document.
 * TODO: Read https://gist.github.com/jlong/2428561
 * @param {Document} doc
 * @param {String} href
 */
gui.URL = function(doc, href) {
    if (doc && doc.nodeType === Node.DOCUMENT_NODE) {
        var val, link = gui.URL._createLink(doc, href);
        Object.keys(gui.URL.prototype).forEach(function(key) { // TODO: exclude toString somehow...
            if (gui.Type.isString((val = link[key]))) {
                if (key === "pathname" && !val.startsWith("/")) {
                    val = "/" + val; // http://stackoverflow.com/questions/956233/javascript-pathname-ie-quirk
                }
                this[key] = val;
            }
        }, this);
        this.id = this.hash ? this.hash.substring(1) : null;
        this.external = this.href.split("#")[0] !== doc.URL.split("#")[0];
    } else {
        throw new TypeError("Document expected");
    }
};

gui.URL.prototype = {
    hash: null, // #test
    host: null, // www.example.com:80
    hostname: null, // www.example.com
    href: null, // http://www.example.com:80/search?q=devmo#test
    pathname: null, // search
    port: null, // 80
    protocol: null, // http:
    search: null, // ?q=devmo
    id: null, // test,
    external: false, // external relative to the *document*, not the server host!!! (rename "outbound" to clear this up?)
    toString: function() { // behave somewhat like window.location ....
        return this.href;
    }
};


// Statics ..............................................................................................

/**
 * Convert relative path to absolute path in context of base where base is a document or an absolute path.
 * @see http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
 * @param {String|Document} base
 * @param {String} href
 * @returns {String}
 */
gui.URL.absolute = function(base, href) { // return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
    href = href || "";
    if (base.nodeType === Node.DOCUMENT_NODE) {
        return new gui.URL(base, href).href;
    } else if (typeof base === "string") {
        var stack = base.split("/");
        var parts = href.split("/");
        stack.pop(); // remove current filename (or empty string) (omit if "base" is the current folder without trailing slash)
        parts.forEach(function(part) {
            if (part !== ".") {
                if (part === "..") {
                    stack.pop();
                } else {
                    stack.push(part);
                }
            }
        });
        return stack.join("/");
    }
};

/**
 * Is URL external to document (as in external host)?
 * @param {String} url
 * @param {Document} doc
 * @returns {boolean}
 */
gui.URL.external = function(src, doc) {
    doc = doc || document;
    var url = new gui.URL(doc, src);
    return url.host !== doc.location.host || url.port !== doc.location.port;
};

/**
 * Extract querystring parameter value from URL.
 * @param {String} url
 * @param {String} name
 * @returns {String} String or null
 */
gui.URL.getParam = function(url, name) {
    name = name.replace(/(\[|\])/g, "\\$1");
    var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(url);
    return results === null ? null : results[1];
};

/**
 * Add or remove (unencoded) querystring parameter from URL. If it
 * already exists, we'll replace it's (first ancountered) value.
 * TODO: Something simpler
 * @param {String} url
 * @param {String} name
 * @param {String} value Use null to remove
 * @returns {String} String
 */
gui.URL.setParam = function(url, name, value) {
    var params = [],
        cut, index = -1;
    var path = url.split("#")[0];
    var hash = url.split("#")[1];
    if (path.indexOf("?") > -1) {
        cut = path.split("?");
        path = cut[0];
        params = cut[1].split("&");
        params.every(function(param, i) {
            var x = param.split("=");
            if (x[0] === name) {
                index = i;
                if (value !== null) {
                    x[1] = value;
                    params[i] = x.join("=");
                }
            }
            return index < 0;
        });
    }
    if (value === null) {
        if (index > -1) {
            params.remove(index, index);
        }
    } else if (index < 0) {
        params[params.length] = [name, value].join("=");
    }
    params = params.length > 0 ? "?" + params.join("&") : "";
    return path + params + (hash ? "#" + hash : "");
};

/**
 * Format URL with hashmap key-values as querystring parameters.
 * @param {String} baseurl
 * param @optional {Map<String,String|number|boolean|Array>} params
 * @returns {String}
 */
gui.URL.parametrize = function(baseurl, params) {
    if (gui.Type.isObject(params)) {
        gui.Object.each(params, function(key, value) {
            baseurl += baseurl.contains("?") ? "&" : "?";
            switch (gui.Type.of(value)) {
                case "array":
                    baseurl += value.map(function(member) {
                        return key + "=" + String(member);
                    }).join("&");
                    break;
                default:
                    baseurl += key + "=" + String(value);
                    break;
            }
        });
    }
    return baseurl;
};

/**
 * @TODO: fix this
 * @param {Window} win
 * @returns {String}
 */
gui.URL.origin = function(win) {
    var loc = win.location;
    return loc.origin || loc.protocol + "//" + loc.host;
};

/**
 * @param {Document} doc
 * @param @optional {String} href
 */
gui.URL._createLink = function(doc, href) {
    var link = doc.createElement("a");
    link.href = href || "";
    if (gui.Client.isExplorer) { // IE9???
        var uri = gui.URL.parseUri(link.href);
        Object.keys(uri).forEach(function(key) {
            if (!link[key]) {
                link[key] = uri[key]; // this is wrong...
            }
        });
    }
    return link;
};

/**
 * Temp IE hotfix...
 * @see http://blog.stevenlevithan.com/archives/parseuri
 * TODO: https://github.com/websanova/js-url
 * TODO: https://github.com/allmarkedup/purl
 */
gui.URL.parseUri = function(str) {
    var o = gui.URL.parseOptions,
        m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i = 14;
    while (i--) {
        uri[o.key[i]] = m[i] || "";
    }
    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
        if ($1) {
            uri[o.q.name][$1] = $2;
        }
    });
    return uri;
};

/**
 * Temp IE hotfix...
 */
gui.URL.parseOptions = {
    strictMode: true,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};



/**
 * Generating keys for unique key purposes.
 */
gui.KeyMaster = {

    /**
     * @static
     * Generate random key. Not simply incrementing a counter in order to celebrate the
     * rare occasion that spirits might be uniquely identified across different domains.
     * @param @optional {String} prefix Used instead of "key" to prefix the key
     * @returns {String}
     */
    generateKey: function(prefix) {
        prefix = "key"; // @TODO: remove this line when we get drunk enough to fix the regular expression below...
        var ran = Math.random().toString();
        var key = (prefix || "key") + ran.slice(2, 11);
        if (this._keys[key]) {
            key = this.generateKey(prefix);
        } else {
            this._keys[key] = true;
        }
        return key;
    },

    /**
     * @static
     * Generate GUID. TODO: Verify integrity of this by mounting result in Java or something.
     * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     * @returns {String}
     */
    generateGUID: function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toLowerCase();
    },

    /**
     * @static
     * String appears to be a generated key? We don't look it up in the key cache,
     * so this method can be used to check a key that was generated in old session.
     * @param {String} string
     * @returns {boolean}
     */
    isKey: function(string) {
        var hit = null,
            looks = false;
        if (gui.Type.isString(string)) {
            hit = this.extractKey(string);
            looks = hit && hit[0] === string;
        }
        return looks;
    },

    /**
     * Extract (potential) key from string.
     * TODO: Rename 'extractKeys' (multiple)
     * @param {String} string
     * @returns {String}
     */
    extractKey: function(string) {
        return (/key\d{9}/).exec(string);
    },


    // Private ...................................................................

    /**
     * Tracking generated keys to prevent doubles.
     * @type {Map<String,boolean>}
     */
    _keys: Object.create(null)
};



/**
 * Polyfilling missing features from ES5 and selected features from ES6.
 * Some of these are implemented weakly and should be used with caution
 * (See Map, Set and WeakMap).
 * TODO: Remove Set, Map and WeakMap!
 * TODO: Object.is and friends
 */
gui.SpiritualAid = {

    /**
     * Polyfill window or Web Worker context.
     * @param {Window} win
     * @param @optional {boolean} worker
     */
    polyfill: function(win, worker) {
        "use strict";
        this._strings(win);
        this._arrays(win);
        this._functions(win);
        this._globals(win);
        this._extras(win);
        if (!worker) {
            this._effects(win);
        }
    },


    // Private ...............................................................

    /**
     * Extend one object with another.
     * @param {object} what Native prototype
     * @param {object} whit Extension methods
     */
    _extend: function(what, whit) {
        Object.keys(whit).forEach(function(key) {
            var def = whit[key];
            if (what[key] === undefined) {
                if (def.get && def.set) {
                    // TODO: look at element.dataset polyfill (iOS?)
                } else {
                    what[key] = def;
                }
            }
        });
    },

    /**
     * Patching `String.prototype`
     * @param {Window} win
     */
    _strings: function(win) {
        this._extend(win.String.prototype, {
            trim: function() {
                return this.replace(/^\s*/, "").replace(/\s*$/, "");
            },
            repeat: function(n) {
                return new win.Array(n + 1).join(this);
            },
            startsWith: function(sub) {
                return this.indexOf(sub) === 0;
            },
            endsWith: function(sub) {
                sub = String(sub);
                var i = this.lastIndexOf(sub);
                return i >= 0 && i === this.length - sub.length;
            },
            contains: function(sub) {
                return this.indexOf(sub) > -1;
            },
            toArray: function() {
                return this.split("");
            }
        });
    },

    /**
     * Patching arrays.
     * @param {Window} win
     */
    _arrays: function(win) {
        this._extend(win.Array, {
            every: function every(array, fun, thisp) {
                var res = true,
                    len = array.length >>> 0;
                for (var i = 0; i < len; i++) {
                    if (array[i] !== undefined) {
                        if (!fun.call(thisp, array[i], i, array)) {
                            res = false;
                            break;
                        }
                    }
                }
                return res;
            },
            forEach: function forEach(array, fun, thisp) {
                var len = array.length >>> 0;
                for (var i = 0; i < len; i++) {
                    if (array[i] !== undefined) {
                        fun.call(thisp, array[i], i, array);
                    }
                }
            },
            map: function map(array, fun, thisp) {
                var m = [],
                    len = array.length >>> 0;
                for (var i = 0; i < len; i++) {
                    if (array[i] !== undefined) {
                        m.push(fun.call(thisp, array[i], i, array));
                    }
                }
                return m;
            },
            filter: function map(array, fun, thisp) {
                return Array.prototype.filter.call(array, fun, thisp);
            },
            isArray: function isArray(o) {
                return win.Object.prototype.toString.call(o) === "[object Array]";
            },
            concat: function(a1, a2) {
                function map(e) {
                    return e;
                }
                return this.map(a1, map).concat(this.map(a2, map));
            }
        });
    },

    /**
     * Patching `Function.prototype` (something about iOS)
     * @param {Window} win
     */
    _functions: function(win) {
        this._extend(win.Function.prototype, {
            bind: function bind(oThis) {
                if (typeof this !== "function") {
                    throw new win.TypeError("Function bind not callable");
                }
                var fSlice = win.Array.prototype.slice,
                    aArgs = fSlice.call(arguments, 1),
                    fToBind = this,
                    Fnop = function() {},
                    fBound = function() {
                        return fToBind.apply(
                            this instanceof Fnop ? this : oThis || win,
                            aArgs.concat(fSlice.call(arguments))
                        );
                    };
                Fnop.prototype = this.prototype;
                fBound.prototype = new Fnop();
                return fBound;
            }
        });
    },

    /**
     * ES6 `Map` and `Set` are polyfilled as simple 
     * sugar and should only be used with primitive keys.
     * TODO: investigate support for Object.getPrototypeOf(win)
     * TODO: credit whatever source we grabbed WeakMap from (?)
     * @param {Window} win
     */
    _globals: function(win) {
        this._extend(win, {
            console: {
                log: function() {},
                debug: function() {},
                warn: function() {},
                error: function() {}
            },
            Map: (function() {
                function Map() {
                    this._map = Object.create(null);
                }
                Map.prototype = {
                    isNative: false,
                    get: function get(key) {
                        return this._map[key];
                    },
                    set: function set(key, val) {
                        this._map[key] = val;
                    },
                    has: function has(key) {
                        return this._map[key] !== undefined;
                    },
                    "delete": function get(key) {
                        delete this._map[key];
                    },
                    size: function() {
                        return Object.keys(this._map).length;
                    }
                };
                return Map;
            })(),
            Set: (function() {
                function Set() {
                    this._map = Object.create(null);
                }
                Set.prototype = {
                    isNative: false,
                    add: function set(key) {
                        this._map[key] = true;
                    },
                    has: function has(key) {
                        return this._map[key] === true;
                    },
                    "delete": function get(key) {
                        delete this._map[key];
                    },
                    size: function() {
                        return Object.keys(this._map).length;
                    }
                };
                return Set;
            })(),
            WeakMap: (function() { // TODO: clean this up
                function WeakMap() {
                    var keys = [],
                        values = [];

                    function del(key) {
                        if (has(key)) {
                            keys.splice(i, 1);
                            values.splice(i, 1);
                        }
                        return -1 < i;
                    }

                    function get(key, d3fault) {
                        return has(key) ? values[i] : d3fault;
                    }

                    function has(key) {
                        i = indexOf.call(keys, key);
                        return -1 < i;
                    }

                    function set(key, value) {
                        if (has(key)) {
                            values[i] = value;
                        } else {
                            values[keys.push(key) - 1] = value;
                        }
                    }
                    return create(WeakMapPrototype, {
                        isNative: {
                            value: false
                        },
                        "delete": {
                            value: del
                        },
                        del: {
                            value: del
                        },
                        get: {
                            value: get
                        },
                        has: {
                            value: has
                        },
                        set: {
                            value: set
                        }
                    });
                }

                function WeakMapInstance() {}
                var Object = win.Object,
                    WeakMapPrototype = WeakMap.prototype,
                    create = Object.create,
                    indexOf = [].indexOf,
                    i;
                // used to follow FF behavior where WeakMap.prototype is WeakMap itself
                WeakMap.prototype = 
                    WeakMapInstance.prototype = 
                    WeakMapPrototype = 
                    new WeakMap();
                return WeakMap;
            })()
        });
    },

    /**
     * Patching cheap DHTML effects with super-simplistic polyfills.
     * TODO: use MessageChannel pending moz bug#677638
     * @see http://www.nonblocking.io/2011/06/windownexttick.html
     * @param [Window} win
     */
    _effects: function(win) {
        this._extend(win, {
            requestAnimationFrame: (function() {
                var func =
                    win.requestAnimationFrame ||
                    win.webkitRequestAnimationFrame ||
                    win.mozRequestAnimationFrame ||
                    win.oRequestAnimationFrame ||
                    win.msRequestAnimationFrame ||
                    (function() {
                        var lastTime = 0;
                        return function(callback, element) {
                            var currTime = new Date().getTime();
                            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                            var id = window.setTimeout(function() {
                                    callback(currTime + timeToCall);
                                },
                                timeToCall);
                            lastTime = currTime + timeToCall;
                            return id;
                        };
                    }());
                return func;
            })(),
            cancelAnimationFrame: (function() {
                return (
                    win.cancelAnimationFrame ||
                    win.webkitCancelAnimationFrame ||
                    win.mozCancelAnimationFrame ||
                    win.oCancelAnimationFrame ||
                    win.msCancelAnimationFrame ||
                    clearTimeout
                );
            }()),
            setImmediate: (function() {
                var list = [],
                    handle = 1;
                var name = "spiritual:emulated:setimmediate";
                win.addEventListener("message", function(e) {
                    if (e.data === name && list.length) {
                        list.shift().apply(win);
                        e.stopPropagation();
                    }
                }, false);
                return function emulated(func) {
                    list.push(func);
                    win.postMessage(name, "*");
                    return handle++;
                };
            })()
        });
    },

    /**
     * Alias methods plus IE and Safari mobile patches.
     * @param {Window} win
     */
    _extras: function(win) {
        this._extend(win.Map.prototype, {
            del: function del(key) {
                return this["delete"](key);
            }
        });
        this._extend(win.Set.prototype, {
            del: function del(key) {
                return this["delete"](key);
            }
        });
        this._extend(win.console, {
            debug: win.console.log
        });
        this._extend(XMLHttpRequest.prototype, {
            overrideMimeType: function() {}
        });
        this._extend(win.XMLHttpRequest, {
            UNSENT: 0,
            OPENED: 1,
            HEADERS_RECEIVED: 2,
            LOADING: 3,
            DONE: 4
        });
    }
};



/**
 * TODO: Totally clean up *a lot* of stuff, but at least 'gui' is now a real 
 * {gui.Namespace} and Spiritual can even run in a version without spirits (!)
 */
(function scoped() {

    /**
     * Collect all the  namespaces.
     * @type {Array<gui.Namespace>}
     */
    var namespaces = [];

    /**
     * Namespace concept of kinds.
     * @param {String} ns
     * @param @optional {object} members
     */
    function Namespace(ns, members) {
        namespaces.push(this);
        this.$ns = ns;
        if (members) {
            Object.keys(members).forEach(function(key) {
                Object.defineProperty(this, key,
                    Object.getOwnPropertyDescriptor(members, key)
                );
            }, this);
        }
    }

    Namespace.prototype = {

        /**
         * Namespace string.
         * @type {String}
         */
        $ns: null,

        /**
         * Identification.
         * @returns {String}
         */
        toString: function() {
            return "[namespace " + this.$ns + "]";
        },

        /**
         * Compute classnames for class-type members.
         * @returns {gui.Namespace}
         */
        spacename: function() {
            this._spacename(this, this.$ns);
            return this;
        },

        /**
         * Name members recursively.
         * @param {object|function} o
         * @param {String} name
         */
        _spacename: function(o, name) {
            gui.Object.each(o, function(key, value) {
                if (key !== "$superclass" && gui.Type.isConstructor(value)) {
                    if (value.$classname === gui.Class.ANONYMOUS) {
                        Object.defineProperty(value, '$classname', {
                            value: name + "." + key,
                            enumerable: true,
                            writable: false
                        });
                        this._spacename(value, name + "." + key);
                    }
                }
            }, this);
        }
    };

    /** 
     * TODO: comment required to explain this stunt
     */
    var constants = {};
    Object.keys(gui).forEach(function(key) {
        constants[key] = gui[key];
    });



    /**
     * TODO: comment even more required!
     */
    window.gui = new Namespace('gui', {

        /**
         * Export this thing as {gui.Namespace}.
         * @type {constructor}
         */
        Namespace: Namespace,

        /**
         * Uniquely identifies this instance of `gui.Spiritual`
         * knowing that other instances may exist in iframes.
         * @type {String}
         */
        $contextid: null,

        /**
         * Usually the window object. Occasionally a web worker scope.
         * @type {GlobalScope}
         */
        context: null,

        /**
         * Context window (if not in a worker).
         * @type {Window}
         */
        window: null,

        /**
         * Context document (if not in a worker).
         * @type {Document}
         */
        document: null,

        /**
         * Spirit management mode. Matches "robot" or "human".
         * @type {String}
         */
        mode: "robot",

        /**
         * Automatically run on DOMContentLoaded?
         * If set to false, run using kickstart().
         * @TODO: rename this to something
         * @type {boolean}
         */
        autostart: true,

        /**
         * Running inside an iframe?
         * @type {boolean}
         */
        hosted: false,

        /**
         * This instance was portalled into this context by a {gui.Spiritul} instance in the hosting iframe?
         * If true, members of the 'gui' namespace (spirits) might have been loaded in an ancestor context.
         * @see {gui.Spiritual#_portal}
         * @type {Boolean}
         */
        portalled: false,

        /**
         * Cross domain origin of containing iframe if:
         *
         * 1. We are loaded inside a {gui.IframeSpirit}
         * 2. Containing document is on an external host
         * @type {String} eg. `http://parenthost.com:8888`
         */
        xhost: null,

        /**
         * Flipped by the {gui.Guide}.
         * @type {boolean}
         */
        initialized: false,

        /**
         * Flipped by the {gui.Guide} after initial spiritualization (on DOMContentLoaded).
         * @type {boolean}
         */
        spiritualized: false,

        /**
         * Magic attributes to trigger spirit association and configuration.
         * By default we support "gui" but you may prefer to use "data-gui".
         */
        attributes: ["gui"], // @TODO: move from proto to constructor?

        /**
         * Window is unloading?
         * @type {boolean}
         */
        unloading: false,

        /**
         * Identification.
         * @returns {String}
         *
        toString: function() {
            return "[namespace gui]";
        },
        */

        /**
         * Channel spirits on startup.
         * Called by the {gui.Guide}
         * @see {gui.Guide}
         */
        start: function() {
            this._oninit();
            this._gone = true;
            this._then = new gui.Then();
            //this._experimental();
            if (this._todochannels) {
                this._channelAll(this._todochannels);
                this._todochannels = null;
            }
            if (!this._pingpong) {
                this._spinatkrampe();
                this._then.now();
            }
            return this._then;
        },

        /**
         * Kickstart Spiritual manuallay. Use this if you somehow
         * load Spiritual after DOMContentLoaded event has fired.
         */
        kickstart: function() {
            switch (document.readyState) {
                case "interactive":
                case "complete":
                    gui.Broadcast.dispatchGlobal(gui.BROADCAST_KICKSTART);
                    break;
            }
        },

        /**
         * Get spirit for argument.
         * TODO: argument expected to be an `$instanceid` for now.
         * TODO: fuzzy resolver to accept elements and queryselectors
         * @param {String|Element} arg
         * @returns {gui.Spirit}
         */
        get: function(arg) {
            var spirit, element, doc = document;
            switch (gui.Type.of(arg)) {
                case "string":
                    if (gui.KeyMaster.isKey(arg)) {
                        spirit = this._spirits.inside[arg];
                    }
                    if (!spirit) {
                        try {
                            element = doc.querySelector(arg) || doc.querySelector('#' + arg);
                        } catch (badselector) {

                        } finally {
                            spirit = element ? element.spirit : null;
                        }
                    }
                    break;
                case "function":
                    var sp, spirits = this._spirits.inside;
                    if (gui.Type.isSpiritConstructor(arg)) {
                        Object.keys(this._spirits.inside).some(function(key) {
                            if (((sp = spirits[key]).constructor === arg)) {
                                spirit = sp;
                                return true;
                            }
                        });
                    }
                    break;
                default:
                    if (gui.Type.isElement(arg)) {
                        spirit = arg.spirit || null;
                    } else {
                        throw new TypeError('gui.get(' + arg + ')');
                    }
                    break;
            }
            return spirit || null;
        },

        /**
         * @param @optional {function} action
         * @param @optional {object} thisp
         * @returns {boolean} True when ready already
         */
        init: function(action, thisp) {
            var is = this.initialized;
            if (arguments.length) {
                if (is) {
                    action.call(thisp);
                } else {
                    this._oninits = this._oninits || [];
                    this._oninits.push(function() {
                        if (gui.debug) {
                            try {
                                action.call(thisp);
                            } catch (exception) {
                                console.error(action.toString());
                                throw exception;
                            }
                        } else {
                            action.call(thisp);
                        }
                    });
                }
            }
            return is;
        },

        /**
         * Call function upon everything spiritualized.
         * TODO: support `onready` object handler
         * @param @optional {function} action
         * @param @optional {object} thisp
         * @returns {boolean} True when ready already
         */
        ready: function(action, thisp) {
            var is = this.spiritualized;
            if (arguments.length) {
                if (is) {
                    action.call(thisp);
                } else {
                    this._onreadys = this._onreadys || [];
                    this._onreadys.push(function() {
                        if (gui.debug) {
                            try {
                                action.call(thisp);
                            } catch (exception) {
                                console.error(action.toString());
                                throw exception;
                            }
                        } else {
                            action.call(thisp);
                        }
                    });
                }
            }
            return is;
        },

        /**
         * @TODO
         */
        getAll: function(arg) {
            console.error("TODO: gui.getAll");
        },

        /**
         * Possess element and descendants.
         * TODO: Jump detached spirit if matching id (!)
         * @param {Element} target
         */
        spiritualize: function(target) {
            gui.Guide.$spiritualize(target || document);
        },

        /**
         * Possess descendants.
         * @param {Element|gui.Spirit} target
         */
        spiritualizeSub: function(target) {
            gui.Guide.$spiritualizeSub(target || document);
        },

        /**
         * Possess one element non-crawling.
         * @param {Element|gui.Spirit} target
         */
        spiritualizeOne: function(target) {
            gui.Guide.$spiritualizeOne(target || document);
        },

        /**
         * Dispell spirits from element and descendants.
         * @param {Element|gui.Spirit} target
         */
        materialize: function(target) {
            gui.Guide.$materialize(target || document);
        },

        /**
         * Dispell spirits for descendants.
         * @param {Element|gui.Spirit} target
         */
        materializeSub: function(target) {
            gui.Guide.$materializeSub(target || document);
        },

        /**
         * Dispell one spirit non-crawling.
         * @param {Element|gui.Spirit} target
         */
        materializeOne: function(target) {
            gui.Guide.$materializeOne(target || document);
        },

        /**
         * Don't materialize and spiritualize during given operation.
         * @param {funtion} operation
         */
        suspend: function(operation) {
            return gui.Observer.suspend(function() {
                return gui.Guide.suspend(operation);
            });
        },

        /**
         * Register module.
         * @param {String} name
         * @param {object} module
         * @returns {object}
         */
        module: function(name, module) {
            if (!gui.Type.isString(name)) {
                throw new Error("Module requires a name");
            } else {
                module = this._modules[name] = new(
                    gui.Module.extend(name, module)
                )(this.context);
            }
            return module;
        },

        /**
         * Has module registered?
         * @param {String} name Module name
         * @returns {boolean}
         */
        hasModule: function(name) {
            return gui.Type.isDefined(this._modules[name]);
        },

        /**
         * TODO!
         * @param {string} name
         * @returns {gui.Module}
         */
        getModule: function(name) {
            console.error('TODO: gui.getModule(name)');
        },

        /**
         * Channel spirits to CSS selectors.
         * @param {String} select CSS selector
         * @param {function|String} klass Constructor or name
         */
        channel: function() {
            switch (gui.Type.of(arguments[0])) {
                case 'string':
                    this._channelOne.apply(this, arguments);
                    break;
                case 'array':
                    this._channelAll.apply(this, arguments);
                    break;
            }
        },

        channels: function() {
            console.error('Deprecated API is deprecated: gui.channels()');
        },

        /**
         * Has channels?
         * @returns {boolean}
         */
        hasChannels: function() {
            return this._channels && gui._channels.length;
        },

        namespaces: function() {
            return namespaces.map(function(ns) {
                return ns.$ns;
            });
        },

        spacenames: function() {
            namespaces.forEach(function(ns) {
                ns.spacename();
            });
        },

        /**
         * Declare namespace in given context. Optionally add members.
         * @param {String} ns
         * @param {Map<String,object>} members
         * @returns {gui.Namespace}
         */
        namespace: function(ns, members) {
            var no, spaces = this._spaces;
            if (gui.Type.isString(ns)) {
                no = gui.Object.lookup(ns);
                if (!no) {
                    no = new gui.Namespace(ns);
                    no = gui.Object.assert(ns, no);
                    spaces.push(ns);
                }
            } else {
                throw new TypeError("Expected a namespace string");
            }
            return gui.Object.extend(no, members || {});
        },

        /**
         * Get Spirit constructor for element.
         *
         * 1. Test for element `gui` attribute(s)
         * 2. Test if element matches selectors
         * @param {Element} element
         * @returns {function} Spirit constructor
         */
        evaluate: function(elm) {
            var res = null;
            if (elm.nodeType === Node.ELEMENT_NODE) {
                var doc = elm.ownerDocument;
                var win = doc.defaultView;
                if (win.gui) {
                    if (win.gui.attributes.every(function(fix) {
                        res = this._evaluateinline(elm, win, fix);
                        return res === null;
                    }, this)) {
                        if (gui.hasChannels()) {
                            win.gui._channels.every(function(def) {
                                var select = def[0];
                                var spirit = def[1];
                                if (gui.CSSPlugin.matches(elm, select)) {
                                    res = spirit;
                                }
                                return res === null;
                            }, this);
                        }
                    }
                }
            }
            return res;
        },

        /**
         * Broadcast something globally. Events will be wrapped in an EventSummary.
         * @param {String} message gui.BROADCAST_MOUSECLICK or similar
         * @param @optional {object} arg This could well be a MouseEvent
         */
        broadcastGlobal: function(msg, arg) {
            if (gui.Type.isEvent(arg)) {
                arg = new gui.EventSummary(arg);
            }
            gui.Broadcast.dispatchGlobal(msg, arg);
        },

        /**
         * Log channels to console.
         * TODO: deprecate this (create gui.Developer).
         */
        debugchannels: function() {
            var out = location.toString();
            this._channels.forEach(function(channel) {
                out += "\n" + channel[0] + " : " + channel[1];
            });
            console.log(out + "\n\n");
        },

        /**
         * Stop tracking the spirit.
         * @param {gui.Spirit} spirit
         */
        destruct: function(spirit) {
            var all = this._spirits;
            var key = spirit.$instanceid;
            delete all.inside[key];
            delete all.outside[key];
            this._jensen(spirit);
        },


        // Internal ..................................................................

        /**
         * Register spirit inside a main document.
         * Evaluate new arrivals after 4 millisec.
         * TODO: move? rename?
         * @param {gui.Spirit} spirit
         */
        inside: function(spirit) {
            var all = this._spirits;
            var key = spirit.$instanceid;
            if (!all.inside[key]) {
                if (all.outside[key]) {
                    delete all.outside[key];
                }
                all.inside[key] = spirit;
                all.incoming.push(spirit);
                gui.Tick.dispatch(gui.$TICK_INSIDE, 4, this.$contextid);
            }
        },

        /**
         * Register spirit outside document. This schedules the spirit
         * for destruction unless reinserted somewhere else (and soon).
         * TODO: move? rename?
         * @param {gui.Spirit} spirit
         */
        outside: function(spirit) {
            var all = this._spirits;
            var key = spirit.$instanceid;
            if (!all.outside[key]) {
                if (all.inside[key]) {
                    delete all.inside[key];
                    this._jensen(spirit);
                }
                all.outside[key] = spirit;
                gui.Tick.dispatch(gui.$TICK_OUTSIDE, 0, this.$contextid);
            }
        },

        _jensen: function(spirit) {
            var incoming = this._spirits.incoming;
            if (incoming.length) {
                var i = incoming.indexOf(spirit);
                if (i > -1) {
                    gui.Array.remove(incoming, i);
                }
            }
        },

        /**
         * Handle tick.
         * @param {gui.Tick} tick
         */
        ontick: function(tick) {
            var spirits;
            switch (tick.type) {
                case gui.$TICK_INSIDE:
                    gui.Guide.$goasync(this._spirits.incoming);
                    this._spirits.incoming = [];
                    break;
                case gui.$TICK_OUTSIDE:
                    spirits = gui.Object.each(this._spirits.outside, function(key, spirit) {
                        return spirit;
                    });
                    /*
                     * TODO: make sure that this happens onexit (but not here)
                    spirits.forEach ( function ( spirit ) {
                        gui.Spirit.$exit ( spirit );
                    });
                    */
                    spirits.forEach(function(spirit) {
                        gui.Spirit.$destruct(spirit);
                    });
                    spirits.forEach(function(spirit) {
                        gui.Spirit.$dispose(spirit);
                    });
                    this._spirits.outside = Object.create(null);
                    break;
            }
        },

        /**
         * Instigate shutdown procedure. This usually happens on `window.unload` but
         * may have to be invoked manually in Chrome packaged apps (pending a fix for
         * https://code.google.com/p/chromium/issues/detail?id=167824).
         */
        $shutdown: function() {
            this.unloading = true;
            if(gui.hasModule('spirits@wunderbyte.com')) {
                gui.Guide.$shutdown();
            }
        },


        // Private ...................................................................

        /**
         * Lisitng CSS selectors associated to Spirit constructors.
         * Order is important: First spirit to match selector is it.
         * Note that each window maintains a version of gui._channels.
         * @type {Array<Array<String,function>>}
         */
        _channels: null,

        /**
         * Cache Spirits resolved by lookup of "gui" attribute.
         * @type {Map<String,function>}
         */
        _inlines: null,

        /**
         * Spaceous.
         */
        _spaces: null,

        /**
         * Flipped to `true` after `go()`
         * @type {boolean}
         */
        _gone: false,

        /**
         * @type {Array<object>}
         */
        _todochannels: null,

        /**
         * Yet another comment.
         * @type {Map<String,object>}
         */
        _modules: null,

        /**
         * Tracking spirits by $instanceid (detached
         * spirits are subject to impending destruction).
         * @type {Map<String,Map<String,gui.Spirit>>}
         */
        _spirits: null,

        /**
         * @type {Array<function>}
         */
        _oninits: null,

        /**
         * @type {Array<function>}
         */
        _onreadys: null,

        /**
         * TODO: rename this and cleanup big time.
         * @param {Window} win
         */
        _initializeAllTheThings: function(context) {
            // observe unloading except in chrome apps
            var c = window.chrome;
            if (!(c && c.app && c.runtime)) {
                window.addEventListener('unload', this, true);
            }
            // patching features
            gui.SpiritualAid.polyfill(context);
            // public setup
            this.context = context;
            this.window = context.document ? context : null;
            //this.document = context.document || null;
            this.hosted = this.window && this.window !== this.window.parent;
            this.$contextid = gui.KeyMaster.generateKey();
            // private setup
            this._inlines = Object.create(null);
            this._modules = Object.create(null);
            this._arrivals = Object.create(null);
            this._channels = [];
            this._spaces = ["gui"];
            this._spirits = {
                incoming: [], // spirits just entered the DOM (some milliseconds ago)
                inside: Object.create(null), // spirits positioned in page DOM ("entered" and "attached")
                outside: Object.create(null) // spirits removed from page DOM (currently "detached")
            };

            // TODO: get rid of this stuff!
            if (this.hosted) {
                this.xhost = "*";
            }
        },

        /**
         * Channel spirits to CSS selectors.
         * @param {String} select CSS selector
         * @param {function|String} klass Constructor or name
         */
        _channelOne: function(select, klass) {
            var spirit;
            if (this._gone) {
                if (typeof klass === "string") {
                    spirit = gui.Object.lookup(klass);
                } else {
                    spirit = klass;
                }
                if (!gui.debug || gui.Type.isSpiritConstructor(spirit)) {
                    this._channels.unshift([select, spirit]);
                } else {
                    console.error('Bad spirit for selector "' + select + '": ' + spirit);
                }
            } else { // wait for method ready to invoke.
                this._todochannels = this._todochannels || [];
                this._todochannels.push([select, klass]);
            }
        },

        _channelAll: function(channels) {
            if (this._gone) {
                channels.forEach(function(c) {
                    this._channelOne(c[0], c[1]);
                }, this);
            } else {
                // TODO: the 'reverse()' should really not be done here, but in 
                // the condition above, however, that screws it up, now think!!!
                this._todochannels = this._todochannels || [];
                this._todochannels = this._todochannels.concat(channels.reverse());
            }
        },

        /**
         * @TODO: clean this up please.
         * @param {Event} e
         */
        handleEvent: function(e) {
            switch (e.type) {
                case "unload":
                    this.$shutdown();
                    break;
                case "message":
                    var parent = this.window.parent;
                    if (e.source === parent && this._gotponged(e.data)) {
                        this.window.removeEventListener("message", this);
                    }
                    break;
            }
        },

        /**
         * Got ponged with a hostname? If yes, kickstart the stuff.
         * @param {String} msg
         * @returns {boolean}
         */
        _gotponged: function(msg) {
            var pat = "spiritual-pong:";
            var loc = this.window.location;
            var org = loc.origin || loc.protocol + "//" + loc.host;
            if (typeof(msg) === "string") {
                if (msg.startsWith(pat)) {
                    var host = msg.slice(pat.length);
                    if (host !== org) {
                        this.xhost = host;
                    }
                    this._spinatkrampe();
                    this._pingpong = false;
                    if (this._then) {
                        this._then.now();
                    }
                    return true;
                }
            }
            return false;
        },

        /**
         * Test for spirit assigned using HTML inline attribute.
         * Special test for "[" accounts for {gui.Spirit#$debug}
         * @param {Element} elm
         * @param {Window} win
         * @param {String} fix
         * @returns {function} Spirit constructor
         */
        _evaluateinline: function(elm, win, fix) {
            var res = null;
            var att = elm.getAttribute(fix);
            if (gui.Type.isString(att) && !att.startsWith("[")) {
                if (att !== "") {
                    res = win.gui._inlines[att];
                    if (!gui.Type.isDefined(res)) {
                        res = gui.Object.lookup(att, win);
                    }
                    if (res) {
                        win.gui._inlines[att] = res;
                    } else {
                        console.error(att + " is not defined.");
                    }
                } else {
                    res = false; // strange return value implies no spirit for empty string
                }
            }
            return res;
        },

        /**
         * TODO: this stuff can probably be killed!
         * Reference local objects in remote window
         * context while collecting channel indexes.
         * @param {object} internal This gui.Spiritual instance
         * @param {object} external New gui.Spiritual instance
         * @param {Array<object>} channels
         * @returns {Array<number>}
         */
        _index: function(internal, external, channels) {
            var indexes = [];

            function index(def) {
                switch (def) {
                    case "$contextid":
                    case "context":
                        // must be kept unique in each window context
                        break;
                    default:
                        var thing = external[def] = internal[def];
                        if (gui.Type.isSpiritConstructor(thing)) {
                            if (thing.portals) {
                                channels.forEach(function(channel, index) {
                                    if (channel[1] === thing) {
                                        indexes.push(index);
                                    }
                                });
                            }
                        }
                        break;
                }
            }
            for (var def in internal) {
                if (!this.constructor.prototype.hasOwnProperty(def)) {
                    if (!def.startsWith("_")) {
                        index(def);
                    }
                }
            }
            return indexes;
        },


        // Work in progress ..........................................................

        /**
         * Called by the {gui.Guide} when document was initially spiritualized.
         */
        $onready: function() {
            this.spiritualized = true;
            this._onready();
        },

        _onready: function() {
            var list = this._onreadys;
            if (list) {
                while (list.length) {
                    list.shift()();
                }
                this._onreadys = null;
            }
        },

        /**
         * Called by the {gui.Guide} when document was initially spiritualized.
         */
        _oninit: function() {
            this.initialized = true;
            var list = this._oninits;
            if (list) {
                while (list.length) {
                    list.shift()();
                }
                this._oninits = null;
            }
        },
        
        /**
         * Hail Lucifer.
         */
        _spinatkrampe: function() {
            gui.Tick.add([gui.$TICK_INSIDE, gui.$TICK_OUTSIDE], this, this.$contextid);
        }
    });

    /** 
     * TODO: comment required to explain this stunt
     */
    Object.keys(constants).forEach(function(key) {
        gui[key] = constants[key];
    });

    window.gui._initializeAllTheThings(window);

}());



/**
 * Working with objects.
 */
gui.Object = {

    /**
     * Object.create with default property descriptors.
     * @see http://wiki.ecmascript.org/doku.php?id=strawman:define_properties_operator
     * @param {object} proto
     * @param {object} props
     */
    create: function(proto, props) {
        var resolved = {};
        Object.keys(props).forEach(function(prop) {
            resolved[prop] = {
                value: props[prop],
                writable: true,
                enumerable: true,
                configurable: true
            };
        });
        return Object.create(proto, resolved);
    },

    /**
     * Extend target with source properties *excluding* prototype stuff.
     * Optional parameter 'loose' to skips properties already declared.
     * TODO: bypass mixin?
     * @param {object} target
     * @param {object} source
     * @param @optional {boolean} loose Skip properties already declared
     * @returns {object}
     */
    extend: function(target, source, loose) {
        var hiding = this._hiding;
        if (gui.Type.isObject(source)) {
            Object.keys(source).forEach(function(key) {
                if (!loose || !gui.Type.isDefined(target[key])) {
                    var desc = Object.getOwnPropertyDescriptor(source, key);
                    desc = hiding ? gui.Object._hide(desc) : desc;
                    Object.defineProperty(target, key, desc);
                }
            }, this);
        } else {
            throw new TypeError("Expected object, got " + gui.Type.of(source));
        }
        return target;
    },

    /**
     * Extend target with source properties,
     * skipping everything already declared.
     * @param {object} target
     * @param {object} source
     * @returns {object}
     */
    extendmissing: function(target, source) {
        return this.extend(target, source, true);
    },

    /**
     * Copy object.
     * @returns {object}
     */
    copy: function(source) {
        try {
            return this.extend({}, source);
        } catch (exception) {
            throw new TypeError("Could not object-copy " + gui.Type.of(source));
        }
    },

    /**
     * Call function for each own key in object (exluding the prototype stuff)
     * with key and value as arguments. Returns array of function call results.
     * Function results that are `undefined` get's filtered out of this list.
     * @param {object} object
     * @param {function} func
     * @param @optional {object} thisp
     */
    each: function(object, func, thisp) {
        return Object.keys(object).map(function(key) {
            return func.call(thisp, key, object[key]);
        }).filter(function(result) {
            return result !== undefined;
        });
    },

    /**
     * Call function for all properties in object (including prototype stuff)
     * with key and value as arguments. Returns array of function call results.
     * @param {object} object
     * @param {function} func
     * @param @optional {object} thisp
     */
    all: function(object, func, thisp) {
        var res = [];
        for (var key in object) {
            res.push(func.call(thisp, key, object[key]));
        }
        return res.filter(function(result) {
            return result !== undefined;
        });
    },

    /**
     * Create new object by passing all property
     * names and values through a resolver call.
     * Eliminate values that map to `undefined`.
     * @param {object} source
     * @param {function} domap
     * @param @optional {object} thisp
     * @returns {object}
     */
    map: function(source, domap, thisp) {
        var result = {},
            mapping;
        this.each(source, function(key, value) {
            mapping = domap.call(thisp, key, value);
            if (mapping !== undefined) {
                result[key] = mapping;
            }
        });
        return result;
    },

    /**
     * Lookup object for string of type "my.ns.Thing" in given context or this window.
     * @param {String} opath Object path eg. "my.ns.Thing"
     * @param @optional {Window} context
     * @returns {object}
     */
    lookup: function(opath, context) {
        var result, struct = context || self;
        if (gui.Type.isString(opath)) {
            if (!opath.contains(".")) {
                result = struct[opath];
            } else {
                var parts = opath.split(".");
                parts.every(function(part) {
                    struct = struct[part];
                    return gui.Type.isDefined(struct);
                });
                result = struct;
            }
        } else {
            throw new TypeError("Expected string, got " + gui.Type.of(opath));
        }
        return result;
    },

    /**
     * Update property of object in given context based on string input.
     * TODO: Rename "declare"
     * @param {String} opath Object path eg. "my.ns.Thing.name"
     * @param {object} value Property value eg. `"Johnson` or"` `[]`
     * @param @optional {Window|object} context
     * @returns {object}
     */
    assert: function(opath, value, context) {
        var prop, struct = context || self;
        if (opath.contains(".")) {
            var parts = opath.split(".");
            prop = parts.pop();
            parts.forEach(function(part) {
                struct = struct[part] || (struct[part] = {});
            });
        } else {
            prop = opath;
        }
        if (struct) {
            struct[prop] = value;
        }
        return value;
    },

    /**
     * List names of invocable methods *including* prototype stuff.
     * @return {Array<String>}
     */
    methods: function(object) {
        var name, value, desc, obj = object,
            result = [];
        for (name in object) {
            // make sure that we don't poke any getter type properties...
            while (!(desc = Object.getOwnPropertyDescriptor(obj, name))) {
                obj = Object.getPrototypeOf(obj);
            }
            if (typeof desc.value === 'function') {
                value = object[name];
                if (gui.Type.isMethod(value)) {
                    result.push(name);
                }
            }
        }
        return result;
    },

    /**
     * List names of invocable methods *excluding* prototype stuff.
     * @return {Array<String>}
     */
    ownmethods: function(object) {
        return Object.keys(object).filter(function(key) {
            return gui.Type.isMethod(object[key]);
        }).map(function(key) {
            return key;
        });
    },

    /**
     * List names of non-method properties *including* prototype stuff.
     * @return {Array<String>}
     */
    nonmethods: function(object) {
        var result = [];
        for (var def in object) {
            if (!gui.Type.isFunction(object[def])) {
                result.push(def);
            }
        }
        return result;
    },

    /**
     * Bind the "this" keyword for all public instance methods.
     * Stuff descending from the prototype chain is ignored.
     * TODO: does this belong here?
     * @param {object} object
     * @returns {object}
     */
    bindall: function(object) {
        var methods = Array.prototype.slice.call(arguments).slice(1);
        if (!methods.length) {
            methods = gui.Object.ownmethods(object).filter(function(name) {
                return name[0] !== "_"; // exclude private methods
            });
        }
        methods.forEach(function(name) {
            object[name] = object[name].bind(object);
        });
        return object;
    },

    /**
     * Sugar for creating non-enumerable function properties (methods).
     * To be be used in combination with `gui.Object.extend` for effect.
     * `mymethod : gui.Object.hidden ( function () {})'
     * @param {function} method
     * @return {function}
     */
    hidden: function(method) {
        gui.Object._hiding = true;
        method.$hidden = true;
        return method;
    },


    // Private ...................................................................

    /**
     * Hiding any methods from inspection?
     * Otherwise economize a function call.
     * @see {edb.Object#extend}
     * @type {boolean}
     */
    _hiding: false,

    /**
     * Modify method descriptor to hide from inspection.
     * Do note that the method may still be called upon.
     * @param {object} desc
     * @returns {object}
     */
    _hide: function(desc) {
        if (desc.value && gui.Type.isFunction(desc.value)) {
            if (desc.value.$hidden && desc.configurable) {
                desc.enumerable = false;
            }
        }
        return desc;
    }
};



/**
 * Type checking studio. All checks are string based.
 */
gui.Type = {

    /**
     * Get type of argument. Note that response may differ between user agents.
     * @see  http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator
     * @param {object} o
     * @returns {String}
     */
    of: function(o) {
        var type = ({}).toString.call(o).match(this._typeexp)[1].toLowerCase();
        if (type === "domwindow" && String(typeof o) === "undefined") {
            type = "undefined"; // some kind of degenerate bug in Safari on iPad
        }
        return type;
    },

    /**
     * Is object defined?
     * TODO: unlimited arguments support
     * @param {object} o
     * @returns {boolean}
     */
    isDefined: function(o) {
        return this.of(o) !== "undefined";
    },

    /**
     * Is complex type?
     * @param {object} o
     * @returns {boolean}
     */
    isComplex: function(o) {
        switch (this.of(o)) {
            case "undefined":
            case "boolean":
            case "number":
            case "string":
            case "null":
                return false;
        }
        return true;
    },

    /**
     * Is Window object?
     * @param {object} o
     * @returns {boolean}
     */
    isWindow: function(o) {
        return o && o.document && o.location && o.alert && o.setInterval;
    },

    /**
     * Is Event object?
     * @pram {object} o
     * @returns {boolean}
     */
    isEvent: function(o) {
        return this.of(o).endsWith("event") && this.isDefined(o.type);
    },

    /**
     * Is DOM element?
     * @param {object} o
     * @returns {boolean}
     */
    isElement: function(o) {
        return this.of(o).endsWith('element') && o.nodeType === Node.ELEMENT_NODE;
    },

    /**
     * Is most likely a method?
     * @param {object} o
     * @return {boolean}
     */
    isMethod: function(o) {
        return o && this.isFunction(o) && !this.isConstructor(o) &&
            !String(o).contains("[native code]"); // hotfix 'Array' and 'Object' ...
    },

    /**
     * Is spirit instance?
     * @returns {boolean}
     */
    isSpirit: function(o) {
        return o && o instanceof gui.Spirit;
    },

    /**
     * Is function fit to be invoked via the "new" operator?
     * We assume so if the prototype reveals any properties.
     * @param {function} what
     * @returns {boolean}
     */
    isConstructor: function(what) {
        return this.isFunction(what) &&
            this.isObject(what.prototype) &&
            Object.keys(what.prototype).length;
    },

    /**
     * Is {gui.Class} constructor?
     */
    isGuiClass: function(what) {
        return this.isConstructor(what) && what.$classname;
    },

    /**
     * Is constructor for a Spirit?
     * TODO: Why can't isConstructor be used here?
     * TODO: something more reliable than "summon".
     * @param {function} what
     * @returns {boolean}
     */
    isSpiritConstructor: function(what) {
        return this.isFunction(what) && this.isFunction(what.summon); // lousy
    },

    /**
     * Something appears to be something array-like?
     * @param {object} what
     * @returns {boolean}
     */
    isArrayLike: function(what) {
        return '0' in what && !this.isArray(what);
    },

    /**
     * Autocast string to an inferred type. "123" will
     * return a number, "false" will return a boolean.
     * @param {String} string
     * @returns {object}
     */
    cast: function(string) {
        var result = String(string);
        switch (result) {
            case "null":
                result = null;
                break;
            case "true":
            case "false":
                result = (result === "true");
                break;
            default:
                if (String(parseInt(result, 10)) === result) {
                    result = parseInt(result, 10);
                } else if (String(parseFloat(result)) === result) {
                    result = parseFloat(result);
                }
                break;
        }
        return result;
    },


    // Private ...................................................................

    /**
     * Match "Array" in "[object Array]" and so on.
     * @type {RegExp}
     */
    _typeexp: /\s([a-zA-Z]+)/

};

/**
 * Generate methods for isArray, isFunction, isBoolean etc.
 * TODO: can we do an "isError" here?
 */
(function generatecode() {
    [ "array",
        "function",
        "object",
        "string",
        "number",
        "boolean",
        "null",
        "arguments",
        "file"
    ].forEach(function(type) {
        this["is" + type[0].toUpperCase() + type.slice(1)] = function is(o) {
            return this.of(o) === type;
        };
    }, this);
}).call(gui.Type);

/**
 * Bind the "this" keyword for all methods.
 */
gui.Object.bindall(gui.Type);



/**
 * Working with arrays.
 */
gui.Array = {

    /**
     * Initialize fresh array with a variable number of
     * arguments regardless of number or type of argument.
     * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
     * @returns {Array}
     */
    of: (function() {
        return (Array.of) || function() {
            return Array.prototype.slice.call(arguments);
        };
    }()),

    /**
     * Converts a single argument that is an array-like
     * object or list into a fresh array.
     * https://gist.github.com/rwaldron/1074126
     * @param {object} arg
     * @returns {Array}
     */
    from: (function() {
        return (Array.from) || function(arg) {
            var array = [];
            var object = Object(arg);
            var len = object.length >>> 0;
            var i = 0;
            while (i < len) {
                if (i in object) {
                    array[i] = object[i];
                }
                i++;
            }
            return array;
        };
    })(),

    /**
     * Resolve single argument into an array with one or more
     * entries with special handling of single string argument:
     *
     * 1. Strings to be split at spaces into an array
     * 3. Arrays are converted to a similar but fresh array
     * 2. Array-like objects transformed into real arrays.
     * 3. Other objects are pushed into a one entry array.
     *
     * @param {object} arg
     * @returns {Array} Always return an array
     */
    make: function(arg) {
        switch (gui.Type.of(arg)) {
            case "string":
                return arg.split(" ");
            case "array":
                return this.from(arg);
            default:
                if (gui.Type.isArrayLike(arg)) {
                    return this.from(arg);
                } else {
                    return [arg];
                }
        }
    },

    /**
     * Remove array member(s) by index (given
     * numbers) or reference (given elsewhat).
     * @see http://ejohn.org/blog/javascript-array-remove/#comment-296114
     * TODO: Handle strings and handle the `to` argument
     * @param {Array} array
     * @param {number|object} from
     * @param {number|object} to
     * @returns {number} new length
     */
    remove: function(array, from, to) {
        if (isNaN(from)) {
            return this.remove(array,
                array.indexOf(from),
                array.indexOf(to)
            );
        } else {
            array.splice(from, !to || 1 + to - from + (!(to < 0 ^ from >= 0) &&
                (to < 0 || -1) * array.length));
            return array.length;
        }
    }
};



/**
 * Function argument type checking studio.
 */
gui.Arguments = {

    /**
     * Forgiving arguments matcher.
     * Ignores action if no match.
     */
    provided: function( /* type1, type2, type3... */ ) {
        var types = gui.Array.from(arguments);
        return function(action) {
            return function() {
                if (gui.Arguments._match(arguments, types)) {
                    return action.apply(this, arguments);
                }
            };
        };
    },

    /**
     * Revengeful arguments validator.
     * Throws an exception if no match.
     */
    confirmed: function( /* type1, type2, type3... */ ) {
        var types = gui.Array.from(arguments);
        return function(action) {
            return function() {
                if (gui.Arguments._validate(arguments, types)) {
                    return action.apply(this, arguments);
                } else {
                    gui.Arguments._abort(this);
                }
            };
        };
    },


    // Private ...................................................................

    /**
     * Validating mode?
     * @type {boolean}
     */
    _validating: false,

    /**
     * Error repporting.
     * @type {Array<String>}
     */
    _bugsummary: null,

    /**
     * Use this to check the runtime signature of a function call:
     * gui.Arguments.match ( arguments, "string", "number" );
     * Note that some args may be omitted and still pass the test,
     * eg. the example would pass if only a single string was given.
     * Note that `gui.Type.of` may return different xbrowser results
     * for certain exotic objects. Use the pipe char to compensate:
     * gui.Arguments.match ( arguments, "window|domwindow" );
     * @returns {boolean}
     */
    _match: function(args, types) {
        return types.every(function(type, index) {
            return this._matches(type, args[index], index);
        }, this);
    },

    /**
     * Strict type-checking facility to throw exceptions on failure.
     * TODO: at some point, return true unless in developement mode.
     * @returns {boolean}
     */
    _validate: function(args, types) {
        this._validating = true;
        var is = this._match(args, types);
        this._validating = false;
        return is;
    },

    /**
     * Extract expected type of (optional) argument.
     * @param {string} xpect
     * @param {boolean} optional
     */
    _xtract: function(xpect, optional) {
        return optional ? xpect.slice(1, -1) : xpect;
    },

    /**
     * Check if argument matches expected type.
     * @param {string} xpect
     * @param {object} arg
     * @param {number} index
     * @returns {boolean}
     */
    _matches: function(xpect, arg, index) {
        var needs = !xpect.startsWith("(");
        var split = this._xtract(xpect, !needs).split("|");
        var input = gui.Type.of(arg);
        var match = (xpect === "*" ||
            (xpect === 'node' && arg && arg.nodeType) || 
            (xpect === 'element' && arg && arg.nodeType === Node.ELEMENT_NODE) || 
            (xpect === 'spirit' && arg && arg.$instanceid && arg.element) || 
            (!needs && input === "undefined") ||
            (!needs && split.indexOf("*") > -1) ||
            split.indexOf(input) > -1);
        if (!match && this._validating) {
            if (input === "string") {
                arg = '"' + arg + '"';
            }
            this._bugsummary = [index, xpect, input, arg];
        }
        return match;
    },

    /**
     * Throw exception.
     * @TODO: Rig up to report offended methods name.
     * @param {object} that
     * @param {Array<String>} report
     */
    _abort: function(that) {
        var summ = this._bugsummary;
        var name = that.constructor.$classname || String(that);
        console.error([
            "Bad argument " + summ.shift(),
            "for " + name + ":",
            "Expected " + summ.shift() + ",",
            "got " + summ.shift() + ":",
            summ.shift()
        ].join(" "));
    }
};



/**
 * Working with functions.
 */
gui.Function = {

    /**
     * Create named function. This may not be the most optimized thing to compile.
     * @see https://mail.mozilla.org/pipermail/es-discuss/2009-March/008954.html
     * @see http://wiki.ecmascript.org/doku.php?id=strawman:name_property_of_functions
     * @param @optional {String} name
     * @param @optional {Array<String>} params
     * @param @optional {String} body
     * @param @optional {Window} context
     * @returns {function}
     */
    create: function(name, params, body, context) {
        var F = context ? context.Function : Function;
        name = this.safename(name);
        params = params ? params.join(",") : "";
        body = body || "";
        return new F(
            "return function " + name + " ( " + params + " ) {" + body + "}"
        )();
    },

    /**
     * Decorate object method before.
     * @param {object} target
     * @param {String} name
     * @param {function} decorator
     * @returns {object}
     */
    decorateBefore: gui.Arguments.confirmed("object|function", "string", "function")(
        function(target, name, decorator) {
            return this._decorate("before", target, name, decorator);
        }
    ),

    /**
     * Decorate object method after.
     * @param {object} target
     * @param {String} name
     * @param {function} decorator
     * @returns {object}
     */
    decorateAfter: gui.Arguments.confirmed("object|function", "string", "function")(
        function(target, name, decorator) {
            return this._decorate("after", target, name, decorator);
        }
    ),

    /**
     * TODO: Decorate object method around.
     * @param {object} target
     * @param {String} name
     * @param {function} decorator
     * @returns {object}
     */
    decorateAround: function() {
        throw new Error("TODO");
    },

    /**
     * Strip namespaces from name to create valid function name.
     * TODO: Return a safe name no matter what has been input.
     * @param {String} name
     * @return {String}
     */
    safename: function(name) {
        if (name && name.contains(".")) {
            name = name.split(".").pop();
        }
        return name || "";
    },


    // Private ...................................................................

    /**
     * Decorate object method
     * @param {String} position
     * @param {object|function} target
     * @param {String} name
     * @param {function} decorator
     * @returns {object}
     */
    _decorate: function(position, target, name, decorator) {
        target[name] = gui.Combo[position](decorator)(target[name]);
        return target;
    }
    
};



/**
 * Namespace concept of kinds.
 * @param {String} ns
 * @param {Window|WorkerScope} context
 */
gui.NamespaceXXX = function Namespace(ns, context) {
    gui.NamespaceXXX._spaces.push(this);
    this.$context = context;
    this.$ns = ns;
};

gui.NamespaceXXX.prototype = {

    /**
     * @deprecated
     * Members may be portalled into subframes via the 'gui.portal' method?
     * @type {boolean}
     */
    portals: false,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[namespace " + this.$ns + "]";
    },

    /**
     * Compute classnames for class-type members.
     * @returns {gui.NamespaceXXX}
     */
    spacename: function() {
        this._spacename(this, this.$ns);
        return this;
    },

    /**
     * Name members recursively.
     * @TODO: Recurse on object values to name deeply nested?
     * @param {object|function} o
     * @param {String} name
     */
    _spacename: function(o, name) {
        gui.Object.each(o, function(key, value) {
            if (key !== "$superclass" && gui.Type.isConstructor(value)) {
                if (value.$classname === gui.Class.ANONYMOUS) {
                    Object.defineProperty(value, '$classname', {
                        value: name + "." + key,
                        enumerable: true,
                        writable: false
                    });
                    this._spacename(value, name + "." + key);
                }
            }
        }, this);
    },


    // Privileged ................................................................

    /**
     * Namespace string.
     * @type {String}
     */
    $ns: null,

    /**
     * Declaration context.
     * @type {Window|WorkerScope}
     */
    $context: null
};

/**
 * TODO: Figure out if we can somehow make `gui` into a real {gui.NamespaceXXX}.
 * @type {Array<gui.NamespaceXXX>}
 */
gui.NamespaceXXX._spaces = [];

/**
 *
 */
gui.NamespaceXXX.spacenames = function() {
    this._spaces.forEach(function(ns) {
        ns.spacename();
    });
};



/**
 * This fellow allow us to create a newable constructor that can be "subclassed" via an extend method.
 * Instances of the "class" may use a special `_super` method to override members of the "superclass".
 * TODO: Evaluate static stuff first so that proto can declare vals as static props
 * TODO: Check if static stuff shadows recurring static (vice versa) and warn about it.
 * TODO: It's possible for a prototype to be a prototype, investigate this inception
 * TODO: Assign uppercase properties as constants
 */
gui.Class = {

    /**
     * Create constructor. Use method `extend` on
     * the constructor to subclass further.
     * @param @optional {String} name
     * @param {object} proto Base prototype
     * @param {object} protos Prototype extensions
     * @param {object} recurring Constructor and subconstructor extensions
     * @param {object} statics Constructor extensions
     * @returns {function}
     */
    create: function() {
        var b = this._breakdown_base(arguments);
        var C = this._createclass(null, b.proto, b.name);
        gui.Object.extend(C.prototype, b.protos);
        gui.Object.extend(C, b.statics);
        gui.Property.extendall(b.protos, C.prototype);
        if (b.recurring) {
            gui.Object.each(b.recurring, function(key, val) {
                var desc = Object.getOwnPropertyDescriptor(C, key);
                if (!desc || desc.writable) {
                    C[key] = C.$recurring[key] = val;
                }
            });
        }
        return C;
    },

    /**
     * Break down class constructor arguments. We want to make the string (naming)
     * argument optional, but we still want to keep is as first argument, so the
     * other arguments must be identified by whether or not it's present.
     * @param {Arguments} args
     * @returns {object}
     */
    breakdown: function(args) {
        return this._breakdown_subs(args);
    },


    // Privileged ................................................................

    /**
     * The `this` keyword around here points to the instance via `apply`.
     * @param {object} instance
     * @param {Arguments} arg
     */
    $constructor: function() {
        var constructor = this.$onconstruct || this.onconstruct;
        var nonenumprop = gui.Property.nonenumerable;
        var returnvalue = this;
        window.Object.defineProperties(this, {
            "$instanceid": nonenumprop({
                value: gui.KeyMaster.generateKey()
            }),
            displayName: nonenumprop({
                value: this.constructor.displayName,
                writable: true
            })
        });
        if (gui.Type.isFunction(constructor)) {
            returnvalue = constructor.apply(this, arguments);
        }
        return returnvalue || this;
    },


    // Private ...................................................................

    /**
     * Mapping classes to keys.
     * @type {Map<String,gui.Class>}
     */
    _classes: Object.create(null),

    /**
     * Nameless name.
     * @type {String}
     */
    ANONYMOUS: "Anonymous",

    /**
     * TODO: Memoize this!
     * Self-executing function creates a string property _BODY
     * which we can as constructor body for classes. The `$name`
     * will be substituted for the class name. Note that if
     * called without the `new` keyword, the function acts
     * as a shortcut the the MyClass.extend method (against
     * convention, which is to silently imply the `new` keyword).
     * @type {String}
     */
    _BODY: (function($name) {
        var body = $name.toString().trim();
        return body.slice(body.indexOf("{") + 1, -1);
    }(
        function $name() {
            if (this instanceof $name) {
                return gui.Class.$constructor.apply(this, arguments);
            } else {
                return $name.extend.apply($name, arguments);
            }
        }
    )),

    /**
     * Breakdown arguments for base exemplar only (has one extra argument).
     * TODO: Something in gui.Arguments instead.
     * @see {gui.Class#breakdown}
     * @param {Arguments} args
     * @returns {object}
     */
    _breakdown_base: function(args) {
        var named = gui.Type.isString(args[0]);
        return {
            name: named ? args[0] : null,
            proto: args[named ? 1 : 0] || Object.create(null),
            protos: args[named ? 2 : 1] || Object.create(null),
            recurring: args[named ? 3 : 2] || Object.create(null),
            statics: args[named ? 4 : 3] || Object.create(null)
        };
    },

    /**
     * Break down class constructor arguments. We want to make the string (naming)
     * argument optional, but we still want to keep is as first argument, so the
     * other arguments must be identified by whether or not it's present.
     * TODO: Something in gui.Arguments instead.
     * @param {Arguments} args
     * @returns {object}
     */
    _breakdown_subs: function(args) {
        var named = gui.Type.isString(args[0]);
        return {
            name: named ? args[0] : null,
            protos: args[named ? 1 : 0] || Object.create(null),
            recurring: args[named ? 2 : 1] || Object.create(null),
            statics: args[named ? 3 : 2] || Object.create(null)
        };
    },

    /**
     * TODO: comments here!
     * @param {object} proto Prototype of superconstructor
     * @param {String} name Constructor name (for debug).
     * @returns {function}
     */
    _createclass: function(SuperC, proto, name) {
        name = name || gui.Class.ANONYMOUS;
        // TODO: this in devmode if and when we might know the name beforehand
        // C = gui.Function.create ( name, null, this._namedbody ( name ));
        var C = function $Class() {
            if (this instanceof $Class) {
                return gui.Class.$constructor.apply(this, arguments);
            } else {
                return $Class.extend.apply($Class, arguments);
            }
        };
        C.$classid = gui.KeyMaster.generateKey("class");
        C.prototype = Object.create(proto || null);
        C.prototype.constructor = C;
        C = this._internals(C, SuperC);
        C = this._interface(C);
        C = this._classname(C, name);
        return C;
    },

    /**
     * Create subclass for given class.
     * @param {funciton} SuperC
     * @param {Object} args
     * @return {function}
     */
    _createsubclass: function(SuperC, args) {
        args = this.breakdown(args);
        SuperC.$super = SuperC.$super || new gui.Super(SuperC);
        return this._extend_fister(
            SuperC,
            args.protos,
            args.recurring,
            args.statics,
            args.name
        );
    },

    /**
     * Create subclass constructor.
     * @param {object} SuperC super constructor
     * @param {object} protos Prototype extensions
     * @param {object} recurring Constructor and subconstructor extensions
     * @param {object} statics Constructor extensions
     * @param {String} generated display name (for development)
     * @returns {function} Constructor
     */
    _extend_fister: function(SuperC, protos, recurring, statics, name) {
        var C = this._createclass(SuperC, SuperC.prototype, name);
        gui.Object.extend(C, statics);
        gui.Object.extend(C.$recurring, recurring);
        gui.Object.each(C.$recurring, function(key, val) {
            var desc = Object.getOwnPropertyDescriptor(C, key);
            if (!desc || desc.writable) {
                C[key] = val;
            }
        });
        gui.Property.extendall(protos, C.prototype);
        gui.Super.support(SuperC, C, protos);
        C = this._classname(C, name);
        return C;
    },

    /**
     * Setup framework internal propeties.
     * @param {function} C
     * @param @optional {function} superclass
     * @param @optional {Map<String,object>} recurring
     * @returns {function}
     */
    _internals: function(C, SuperC) {
        C.$super = null;
        C.$subclasses = [];
        C.$superclass = SuperC || null;
        C.$recurring = SuperC ? gui.Object.copy(SuperC.$recurring) : Object.create(null);
        if (SuperC) {
            SuperC.$subclasses.push(C);
        }
        return C;
    },

    /**
     * Setup standard static methods for extension, mixin and instance checking.
     * @param {function} C
     * @returns {function}
     */
    _interface: function(C) {
        ["extend", "mixin", "is"].forEach(function(method) {
            C[method] = this[method];
        }, this);
        return C;
    },

    /**
     * Assign toString() return value to function constructor and instance object.
     * TODO: validate unique name
     * @param {constructor} C
     * @param {String} name
     * @returns {function}
     */
    _classname: function(C, name) {
        /*
         * At this point the $classname is a writable property, it will
         * become non-writable after we call {gui.Namespace#spacenames}.
         */
        C.$classname = name || gui.Class.ANONYMOUS;
        Object.defineProperty(C.prototype, '$classname', {
            enumerable: false,
            configurable: true,
            get: function() {
                return this.constructor.$classname;
            }
        });
        C.toString = function() {
            return "[function " + this.$classname + "]";
        };
        C.prototype.toString = function() {
            return "[object " + this.constructor.$classname + "]";
        };
        return C;
    },

    /**
     * Compute constructor body for class of given name.
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    _namedbody: function(name) {
        return this._BODY.replace(
            new RegExp("\\$name", "gm"),
            gui.Function.safename(name)
        );
    }

    /**
     * This might do something in the profiler. Not much luck with stack traces.
     * @see http://www.alertdebugging.com/2009/04/29/building-a-better-javascript-profiler-with-webkit/
     * @see https://code.google.com/p/chromium/issues/detail?id=17356
     * @param {function} C
     * @returns {function}
     *
    _profiling : function ( C ) {
        var name = C.name || gui.Class.ANONYMOUS;
        [ C, C.prototype ].forEach ( function ( thing ) {
            gui.Object.each ( thing, function ( key, value ) {
                if ( gui.Type.isMethod ( value )) {
                    this._displayname ( value, name + "." + key );
                }
            }, this );
        }, this );
        return C;
    },
    */
};


// Class members ...............................................................

gui.Object.extend(gui.Class, {

    /**
     * Create subclass. To be called on the class constructor: MyClass.extend()
     * @param @optional {String} name
     * @param {object} proto Base prototype
     * @param {object} protos Prototype methods and properties
     * @param {object} recurring Constructor and subconstructor extensions
     * @param {object} statics Constructor extensions
     * @returns {function} Constructor
     */
    extend: function() { // protos, recurring, statics 
        return gui.Class._createsubclass(this, arguments);
    },

    /**
     * Mixin something.
     * @param {object} proto
     * @param {object} recurring
     * @param {object} statics
     * @returns {function}
     */
    mixin: function(proto, recurring, statics) {
        Array.forEach(arguments, function(mixins, i) {
            if (mixins) {
                gui.Object.each(mixins, function(name, value) {
                    if (i === 0) {
                        this.prototype[name] = value;
                        gui.Class.descendantsAndSelf(this, function(C) {
                            if (C.$super) {
                                gui.Super.generateStub(C.$super, C.prototype, name);
                            }
                        });
                    } else {
                        gui.Class.descendantsAndSelf(this, function(C) {
                            C.$recurring[name] = value;
                            C[name] = value;
                        });
                    }
                }, this);
            }
        }, this);
        return this;
    },

    /**
     * Is instance of this?
     * @param {object} object
     * @returns {boolean}
     */
    is: function(object) {
        return gui.Type.isObject(object) && (object instanceof this);
    },

    /**
     * Deprecated API.
     */
    isInstance: function() {
        console.error("Deprecated API is derecated");
    }

});


// Class navigation ............................................................

gui.Object.extend(gui.Class, {

    /**
     * Return superclass. If action is provided, return an array of the results
     * of executing the action for each subclass with the subclass as argument.
     * @param {function} C constructor
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @returns {Array<gui.Class|object>}
     */
    children: function(C, action, thisp) {
        var results = [];
        action = action || gui.Combo.identity;
        C.$subclasses.forEach(function(sub) {
            results.push(action.call(thisp, sub));
        }, thisp);
        return results;
    },

    /**
     * Apply action recursively to all derived subclasses of given class.
     * Returns an array of accumulated results. If no action is provided,
     * returns array of descendant sublasses.
     * @param {function} C constructor
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @param @internal {Array<gui.Class|object>} results
     * @returns {Array<gui.Class|object>}
     */
    descendants: function(C, action, thisp, results) {
        results = results || [];
        action = action || gui.Combo.identity;
        C.$subclasses.forEach(function(sub) {
            results.push(action.call(thisp, sub));
            gui.Class.descendants(sub, action, thisp, results);
        }, thisp);
        return results;
    },

    /**
     * Return descendant classes and class itself. If action is provided, return array of the results
     * of executing the action for each descendant class and class itself with the class as argument.
     * @param {function} C constructor
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @returns {Array<gui.Class|object>}
     */
    descendantsAndSelf: function(C, action, thisp) {
        var results = [];
        action = action || gui.Combo.identity;
        results.push(action.call(thisp, C));
        return this.descendants(C, action, thisp, results);
    },

    /**
     * Return superclass. If action is provided, return the result
     * of executing the action with the superclass as argument.
     * @param {function} C constructor
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @returns {gui.Class|object}
     */
    parent: function(C, action, thisp) {
        if (C && C.$superclass) {
            action = action || gui.Combo.identity;
            return action.call(thisp, C.$superclass);
        }
        return null;
    },

    /**
     * Return ancestor classes. If action is provided, return array of the results
     * of executing the action for each ancestor class with the class as argument.
     * @param {function} C constructor
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @param @internal {<gui.Class|object>} results
     * @returns {Array<gui.Class|object>}
     */
    ancestors: function(C, action, thisp, results) {
        results = results || [];
        action = action || gui.Combo.identity;
        if (C.$superclass) {
            results.push(action.call(thisp, C.$superclass));
            gui.Class.ancestors(C.$superclass, action, thisp, results);
        }
        return results;
    },

    /**
     * Return ancestor classes and class itself. If action is provided, return array of the results
     * of executing the action for each ancestor class and class itself with the class as argument.
     * @param {function} C constructor
     * @param @optional {function} action Takes the class as argument
     * @param @optional {object} thisp
     * @returns {Array<<gui.Class|object>>}
     */
    ancestorsAndSelf: function(C, action, thisp) {
        var results = [];
        action = action || gui.Combo.identity;
        results.push(action.call(thisp, C));
        return this.ancestors(C, action, thisp, results);
    },

    /**
     * Return ancestor classes, descendant classes and class itself. If action is
     * provided, return array of the results of executing the action for each
     * related class and class itself with the class as argument.
     * @param {constructor} C
     * @param @optional {function} action Takes the class as argument
     * @param @optional {object} thisp
     * @returns {Array<<gui.Class|object>>}
     */
    family: function(C, action, thisp) {
        var results = this.ancestorsAndSelf(C).concat(this.descendants(C));
        if (action) {
            results = results.map(function(C) {
                return action.call(thisp, C);
            });
        }
        return results;
    }

});



/**
 * Working with properties.
 */
gui.Property = {

    /**
     * Clone properties from source to target.
     * @param {object} source
     * @param {object} target
     * @returns {object}
     */
    extendall: function(source, target) {
        Object.keys(source).forEach(function(key) {
            this.extend(source, target, key);
        }, this);
        return target;
    },

    /**
     * Copy property from source to target. Main feature is that it
     * will be setup to a property accessor (getter/setter) provided:
     *
     * 1) The property value is an object
     * 2) It has (only) one or both properties "getter" and "setter"
     * 3) These are both functions
     */
    extend: function(source, target, key) {
        var desc = Object.getOwnPropertyDescriptor(source, key);
        desc = this._accessor(target, key, desc);
        Object.defineProperty(target, key, desc);
        return target;
    },

    /**
     * Provide sugar for non-enumerable propety descriptors.
     * Omit "writable" since accessors must not define that.
     * @param {object} desc
     * @returns {object}
     */
    nonenumerable: function(desc) {
        return gui.Object.extendmissing({
            configurable: true,
            enumerable: false
        }, desc);
    },

    /**
     * Create getter/setter for object assuming enumerable and configurable.
     * @param {object} object The property owner
     * @param {string} key The property name
     * @param {object} def An object with methods "get" and/or "set"
     * @returns {object}
     */
    accessor: function(object, key, def) {
        if (this._isaccessor(def)) {
            return Object.defineProperty(object, key, {
                enumerable: true,
                configurable: true,
                get: def.getter || this._NOGETTER,
                set: def.setter || this._NOSETTER
            });
        } else {
            throw new TypeError("Expected getter and/or setter method");
        }
    },


    // Private ...................................................................

    /**
     * Object is getter-setter definition?
     * @param {object} obj
     * @returns {boolean}
     */
    _isaccessor: function(obj) {
        return Object.keys(obj).every(function(key) {
            var is = false;
            switch (key) {
                case "getter":
                case "setter":
                    is = gui.Type.isFunction(obj[key]);
                    break;
            }
            return is;
        });
    },

    /**
     * Copy single property to function prototype.
     * @param {object} proto
     * @param {String} key
     * @param {object} desc
     * @returns {object}
     */
    _accessor: function(proto, key, desc) {
        var val = desc.value;
        if (gui.Type.isObject(val)) {
            if (val.getter || val.setter) {
                if (this._isactive(val)) {
                    desc = this._activeaccessor(proto, key, val);
                }
            }
        }
        return desc;
    },

    /**
     * Object is getter-setter definition?
     * @param {object} obj
     * @returns {boolean}
     */
    _isactive: function(obj) {
        return Object.keys(obj).every(function(key) {
            var is = false;
            switch (key) {
                case "getter":
                case "setter":
                    is = gui.Type.isFunction(obj[key]);
                    break;
            }
            return is;
        });
    },

    /**
     * Compute property descriptor for getter-setter
     * type definition and assign it to the prototype.
     * @param {object} proto
     * @param {String} key
     * @param {object} def
     * @returns {defect}
     */
    _activeaccessor: function(proto, key, def) {
        var desc;
        ["getter", "setter"].forEach(function(name, set) {
            while (proto && proto[key] && !gui.Type.isDefined(def[name])) {
                proto = Object.getPrototypeOf(proto);
                desc = Object.getOwnPropertyDescriptor(proto, key);
                if (desc) {
                    def[name] = desc[set ? "set" : "get"];
                }
            }
        });
        return {
            enumerable: true,
            configurable: true,
            get: def.getter || this._NOGETTER,
            set: def.setter || this._NOSETTER
        };
    },

    /**
     * Bad getter.
     */
    _NOGETTER: function() {
        throw new Error("Getting a property that has only a setter");
    },

    /**
     * Bad setter.
     */
    _NOSETTER: function() {
        throw new Error("Setting a property that has only a getter");
    }
};

/**
 * Bind the "this" keyword for all public methods.
 */
gui.Object.bindall(gui.Property);



/**
 * Checks an object for required methods and properties.
 */
gui.Interface = {

    /**
     * Check object interface. Throw exception on fail.
     * @param {object} interfais
     * @param {object} osbject
     * @returns {boolean}
     */
    validate: function(interfais, object) {
        var is = true;
        var expected = interfais.toString();
        var type = gui.Type.of(object);
        switch (type) {
            case "null":
            case "string":
            case "number":
            case "boolean":
            case "undefined":
                throw new Error("Expected " + expected + ", got " + type + ": " + object);
            default:
                try {
                    var missing = null,
                        t = null;
                    is = Object.keys(interfais).every(function(name) {
                        missing = name;
                        t = gui.Type.of(interfais[name]);
                        return gui.Type.of(object[name]) === t;
                    });
                    if (!is) {
                        throw new Error("Expected " + expected + ". A required " + type + " \"" + missing + "\" is missing");
                    }
                } catch (exception) {
                    throw new Error("Expected " + expected);
                }
                break;
        }
        return is;
    }
};



/**
 * From Raganwalds "Method Combinators".
 * @see https://github.com/raganwald/method-combinators/blob/master/README-JS.md
 * @see https://github.com/raganwald/homoiconic/blob/master/2012/09/precondition-and-postcondition.md
 */
gui.Combo = {

    /**
     * Decorate function before.
     * @param {function} decoration
     * @returns {function}
     */
    before: function(decoration) {
        return function(base) {
            return function() {
                decoration.apply(this, arguments);
                return base.apply(this, arguments);
            };
        };
    },

    /**
     * Decorate function after.
     * @param {function} decoration
     * @returns {function}
     */
    after: function(decoration) {
        return function(base) {
            return function() {
                var result = base.apply(this, arguments);
                decoration.apply(this, arguments);
                return result;
            };
        };
    },

    /**
     * Decorate function around.
     * @param {function} decoration
     * @returns {function}
     */
    around: function(decoration) {
        var slice = [].slice;
        return function(base) {
            return function() {
                var argv, callback, result, that = this;
                argv = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                result = void 0;
                callback = function() {
                    return (result = base.apply(that, argv));
                };
                decoration.apply(this, [callback].concat(argv));
                return result;
            };
        };
    },

    /**
     * Decorate function provided with support for an otherwise operation.
     * @param {function} condition
     */
    provided: function(condition) {
        return function(base, otherwise) {
            return function() {
                if (condition.apply(this, arguments)) {
                    return base.apply(this, arguments);
                } else if (otherwise) {
                    return otherwise.apply(this, arguments);
                }
            };
        };
    },

    /**
     * Make function return `this` if otherwise it would return `undefined`.
     * Variant of the `fluent` combinator which would always returns `this`.
     * We use this extensively to ensure API consistancy, but we might remove 
     * it for a theoretical performance gain once we have a huge test suite.
     * @param {function} base
     * @returns {function}
     */
    chained: function(base) {
        return function() {
            var result = base.apply(this, arguments);
            return result === undefined ? this : result;
        };
    },

    /**
     * Simply output the input. Wonder what it could be.
     * @param {object} subject
     * @return {object}
     */
    identity: function(subject) {
        return subject;
    }

};



/**
 * Simplistic support for pseudokeyword 'this._super'.
 * @param {function} C
 */
gui.Super = function Super(C) {
    gui.Super.generateStubs(this, C.prototype);
};

gui.Super.prototype = Object.create(null);


// Static ......................................................................

gui.Object.extend(gui.Super, {

    /**
     * Class instance which is now invoking _super()
     * @type {gui.Class}
     */
    $subject: null,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[function gui.Super]";
    },

    /**
     * Declare all method stubs on {gui.Super} instance.
     * @param {gui.Super} suber
     * @param {object} proto
     */
    generateStubs: function(suber, proto) {
        gui.Object.methods(proto).forEach(function(name) {
            gui.Super.generateStub(suber, proto, name);
        }, this);
    },

    /**
     * Declare single method stub on {gui.Super} instance.
     * @param {gui.Super} suber
     * @param {object} proto
     * @param {String} name Method name
     */
    generateStub: function(suber, proto, name) {
        var func = suber[name] = function() {
            return proto[name].apply(gui.Super.$subject, arguments);
        };
        func.displayName = name;
    },

    /**
     * Transfer methods from protos to proto
     * while decorating for `_super` support.
     * @param {function} SuperC
     * @param {object} C
     * @param {object} protos
     */
    support: function(SuperC, C, protos) {
        var proto = C.prototype;
        var combo = this._decorator(SuperC);
        gui.Object.each(protos, function(key, base) {
            if (gui.Type.isMethod(base)) {
                if (key !== "$of") { // .................................... hotfix!!!
                    proto[key] = combo(base);
                    if (gui.debug) {
                        proto[key].toString = function() {
                            var original = base.toString().replace(/\t/g, "  ");
                            return gui.Super._DISCLAIMER + original;
                        };
                    }
                }
            }
        }, this);
    },


    // Private static ............................................................

    /**
     * Prepended to the result of calling
     * toString() on a modified function.
     * @type {String}
     */
    _DISCLAIMER: "/**\n" +
        "  * Method was mutated by the framework. \n" +
        "  * This is an approximation of the code. \n" +
        "  */\n",

    /**
     * Excuses.
     * @type {String}
     */
    _ERROR: "" +
        "Lost 'this' in call to 'this._super'.",

    /**
     * Get tricky decorator.
     * @param {function} SuperC
     * @returns {function}
     */
    _decorator: function(SuperC) {
        return function(base) {
            return function supercall() {
                return gui.Super._supercall(this, base, arguments, SuperC);
            };
        };
    },

    /**
     * Attempt to apply base method of superclass to instance.
     * Fails on async execution given the fishy setup we have.
     * @param {object} that
     * @param {function} base
     * @param {Arguments} args
     * @param {function} SuperC
     * @returns {object}
     */
    _supercall: function(that, base, args, SuperC) {
        var res, sub = gui.Super.$subject;
        if (that) {
            gui.Super.$subject = that;
            that._super = SuperC.$super;
            res = base.apply(that, args);
            gui.Super.$subject = sub;
        } else {
            throw new ReferenceError(gui.Super._ERROR);
        }
        return res;
    }

});



/**
 * Something that has position.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
gui.Position = function(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

gui.Position.prototype = {

    /**
     * X position.
     * @type {number}
     */
    x: 0,

    /**
     * Y position.
     * @type {number}
     */
    y: 0,

    /**
     * Z position.
     * @type {number}
     */
    z: 0,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Position]";
    },

    /**
     * Clone position.
     * @returns {gui.Position}
     */
    clone: function() {
        return new gui.Position(this.x, this.y, this.z);
    }
};


// Static ......................................................................

/**
 * Compare two positions.
 * @param {gui.Position} p1
 * @param {gui.Position} p2
 * @return {boolean}
 */
gui.Position.isEqual = function(p1, p2) {
    return (p1.x === p2.x) && (p1.y === p2.y);
};



/**
 * Something that has 2D width and height.
 * @param {number} w
 * @param {number} h
 */
gui.Dimension = function(w, h) {
    this.w = w || 0;
    this.h = h || 0;
};

gui.Dimension.prototype = {

    /**
     * Width.
     * @type {number}
     */
    w: 0,

    /**
     * Height.
     * @type {number}
     */
    h: 0,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Dimension]";
    }
};


// Static ......................................................................

/**
 * Compare two dimensions.
 * @param {gui.Dimension} dim1
 * @param {gui.Dimension} dim2
 * @return {boolean}
 */
gui.Dimension.isEqual = function(dim1, dim2) {
    return (dim1.w === dim2.w) && (dim1.h === dim2.h);
};



/**
 * Something that has 2D position and width and height.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
gui.Geometry = function(x, y, w, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
};

gui.Geometry.prototype = {

    /**
     * X position.
     * @type {number}
     */
    x: 0,

    /**
     * Y position.
     * @type {number}
     */
    y: 0,

    /**
     * Width.
     * @type {number}
     */
    w: 0,

    /**
     * Height.
     * @type {number}
     */
    h: 0,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Geometry]";
    },

    /**
     * Intersects another (2D) geometry?
     * @param {gui.Geometry} geo
     */
    hitTest: function(geo) {
        return gui.Geometry.hitTest(this, geo);
    }
};


// Static ......................................................................

/**
 * Compare two geometries.
 * @param {gui.Geometry} geo1
 * @param {gui.Geometry} geo2
 * @returns {boolean}
 */
gui.Geometry.isEqual = function(geo1, geo2) {
    return (
        (geo1.x === geo2.x) &&
        (geo1.y === geo2.y) &&
        (geo1.w === geo2.w) &&
        (geo1.h === geo2.h)
    );
};

/**
 * Hittest two geometries.
 * @param {gui.Geometry} geo1
 * @param {gui.Geometry} geo2
 * @returns {boolean}
 */
gui.Geometry.hitTest = function(geo1, geo2) {
    function x(g1, g2) {
        return g1.x >= g2.x && g1.x <= g2.x + g2.w;
    }

    function y(g1, g2) {
        return g1.y >= g2.y && g1.y <= g2.y + g2.h;
    }
    var hitx = x(geo1, geo2) || x(geo2, geo1);
    var hity = y(geo1, geo2) || y(geo2, geo1);
    return hitx && hity;
};



/**
 * Encapsulates a callback for future use.
 * TODO: mimic DOM Futures to some degree.
 * @param @optional {function} callback
 * @param @optional {object} thisp
 */
gui.Then = function Then(callback, thisp) {
    if (callback) {
        this.then(callback, thisp);
    }
};

gui.Then.prototype = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Then]";
    },

    /**
     * Setup callback with optional this-pointer.
     * @param {function} callback
     * @param @optional {object} pointer
     */
    then: function(callback, thisp) {
        this._callback = callback ? callback : null;
        this._pointer = thisp ? thisp : null;
        if (this._now) {
            this.now();
        }
    },

    /**
     * Callback with optional this-pointer.
     * @returns {object}
     */
    now: function() {
        var c = this._callback;
        var p = this._pointer;
        if (c) {
            this.then(null, null);
            c.apply(p, arguments);
        } else {
            this._now = true;
        }
    },


    // Private ...................................................................

    /**
     * Callback to execute.
     * @type {function}
     */
    _callback: null,

    /**
     * "this" keyword in callback.
     * @type {object}
     */
    _pointer: null,

    /**
     * Execute as soon as callback gets delivered?
     * @type {boolean}
     */
    _now: false

};



/**
 * Parsing markup strings to DOM nodes.
 */
gui.HTMLParser = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.HTMLParser]";
    },

    /**
     * Parse to element.
     * @param {String} markup
     * @param @optional {Document} targetdoc
     * @returns {Node}
     */
    parse: function(markup, targetdoc) {
        return this.parseAll(markup, targetdoc)[0] || null;
    },

    /**
     * Parse to array of one or more elements.
     * @param {String} markup
     * @param @optional {Document} targetdoc
     * @returns {Array<Element>}
     */
    parseAll: function(markup, targetdoc) {
        return this.parseToNodes(markup, targetdoc).filter(function(node) {
            return node.nodeType === Node.ELEMENT_NODE;
        });
    },

    /**
     * Parse to node.
     * @param {String} markup
     * @param @optional {Document} targetdoc
     * @returns {Node}
     */
    parseToNode: function(markup, targetdoc) {
        return this.parseToNodes(markup, targetdoc)[0] || null;
    },

    /**
     * Parse to array of one or more nodes.
     * @param {String} markup
     * @param @optional {Document} targetdoc
     * @returns {Array<Node>}
     */
    parseToNodes: function(markup, targetdoc) {
        var elm, doc = this._document ||
            (this._document = document.implementation.createHTMLDocument(""));
        return gui.Guide.suspend(function() {
            doc.body.innerHTML = this._insaneitize(markup);
            elm = doc.querySelector("." + this._classname) || doc.body;
            return Array.map(elm.childNodes, function(node) {
                return (targetdoc || document).importNode(node, true);
            });
        }, this);
    },

    /**
     * Parse to document. Bear in mind that the
     * document.defaultView of this thing is null.
     * @TODO: Use DOMParser for text/html supporters
     * @param {String} markup
     * @returns {HTMLDocument}
     */
    parseToDocument: function(markup) {
        markup = markup || "";
        return gui.Guide.suspend(function() {
            var doc = document.implementation.createHTMLDocument("");
            if (markup.toLowerCase().contains("<!doctype")) {
                try {
                    doc.documentElement.innerHTML = markup;
                } catch (ie9exception) {
                    doc = new ActiveXObject("htmlfile");
                    doc.open();
                    doc.write(markup);
                    doc.close();
                }
            } else {
                doc.body.innerHTML = markup;
            }
            return doc;
        });
    },


    // Private ...................................................................

    /**
     * Classname for obscure wrapping containers.
     * @type {String}
     */
    _classname: "_gui-htmlparser",

    /**
     * Match comments.
     * @type {RegExp}
     */
    _comments: /<!--[\s\S]*?-->/g,

    /**
     * Match first tag.
     * @type {RegExp}
     */
    _firsttag: /^<([a-z]+)/i,

    /**
     * Recycled for parseToNodes operations.
     * TODO: Create on first demand
     * @type {HTMLDocument}
     */
    _document: null,

    /**
     * Some elements must be created in obscure markup
     * structures in order to be rendered correctly.
     * @param {String} markup
     * @returns {String}
     */
    _insaneitize: function(markup) {
        var match, fix;
        markup = markup.trim().replace(this._comments, "");
        if ((match = markup.match(this._firsttag))) {
            if ((fix = this._fixes[match[1]])) {
                markup = fix.
                replace("${class}", this._classname).
                replace("${markup}", markup);
            }
        }
        return markup;
    },

    /**
     * Mapping tag names to miminum viable tag structure.
     * @see https://github.com/petermichaux/arbutus
     * TODO: "without the option in the next line, the
     * parsed option will always be selected."
     * @type {Map<String,String>}
     */
    _fixes: (function() {
        var map = {
            'td': '<table><tbody><tr class="${class}">${markup}</tr></tbody></table>',
            'tr': '<table><tbody class="${class}">${markup}</tbody></table>',
            'tbody': '<table class="${class}">${markup}</table>',
            'col': '<table><colgroup class="${class}">${markup}</colgroup></table>',
            'option': '<select class="${class}"><option>a</option>${markup}</select>'
        };
        map["th"] = map["td"]; // duplicate fixes.
        ["thead", "tfoot", "caption", "colgroup"].forEach(function(tag) {
            map[tag] = map["tbody"];
        });
        return map;
    }())
};



/**
 * We load a text file from the server. This might be used instead
 * of a XMLHttpRequest to cache the result and save repeated lookups.
 * TODO: custom protocol handlers to load from localstorage
 * TODO: perhaps rename to TextLoader or something...
 */
gui.FileLoader = gui.Class.create(Object.prototype, {

    /**
     * Construction time again.
     * @param {Document} doc
     */
    onconstruct: function(doc) {
        this._cache = gui.FileLoader._cache;
        this._document = doc;
    },

    /**
     * Load file as text/plain and serve to callback.
     * @param {String} src Relative to document URL
     * @param {function} callback
     * @param @optional {object} thisp
     */
    load: function(src, callback, thisp) {
        var url = new gui.URL(this._document, src);
        if (this._cache.has(url.location)) {
            this._cached(url, callback, thisp);
        } else {
            this._request(url, callback, thisp);
        }
    },

    /**
     * Handle loaded file.
     * @param {String} text
     * @param {gui.URL} url
     * @param {function} callback
     * @param @optional {object} thisp
     */
    onload: function(text, url, callback, thisp) {
        callback.call(thisp, text);
    },


    // Private ...................................................................

    /**
     * Cached is shared between all instances of gui.FileLoader.
     * @see {gui.FileLoader#_cache}
     * @type {Map<String,String>}
     */
    _cache: null,

    /**
     * File address resolved relative to this document.
     * @type {Document}
     */
    _document: null,

    /**
     * Request external file while blocking subsequent similar request.
     * @param {gui.URL} url
     * @param {function} callback
     * @param @optional {object} thisp
     */
    _request: function(url, callback, thisp) {
        this._cache.set(url.location, null);
        new gui.Request(url.href).acceptText().get().then(function(status, text) {
            this.onload(text, url, callback, thisp);
            this._cache.set(url.location, text);
            gui.FileLoader.unqueue(url.location);
        }, this);
    },

    /**
     * Hello.
     * @param {gui.URL} url
     * @param {Map<String,String>} cache
     * @param {function} callback
     * @param @optional {object} thisp
     */
    _cached: function(url, callback, thisp) {
        var cached = this._cache.get(url.location);
        if (cached !== null) { // note that null type is important
            this.onload(cached, url, callback, thisp);
        } else {
            var that = this;
            gui.FileLoader.queue(url.location, function(text) {
                that.onload(text, url, callback, thisp);
            });
        }
    },


    // Privileged ................................................................

    /**
     * Secret constructor.
     * @param {gui.Spirit} spirit
     * @param {Window} window
     * @param {function} handler
     */
    $onconstruct: function(doc) {
        if (doc && doc.nodeType === Node.DOCUMENT_NODE) {
            this.onconstruct(doc);
        } else {
            throw new TypeError("Document expected");
        }
    }


}, {}, { // Static .............................................................

    /**
     * Cache previously retrieved files, mapping URL to file text.
     * @type {Map<String,String>}
     */
    _cache: new Map(),

    /**
     * Queue handlers for identical requests, mapping URL to function.
     * @type {Array<String,function>}
     */
    _queue: new Map(),

    /**
     * Queue onload handler for identical request.
     * @param {String}
     */
    queue: function(src, action) {
        this._queue[src] = this._queue[src] || [];
        this._queue[src].push(action);
    },

    /**
     * Execute queued onload handlers.
     * @param {String} src
     */
    unqueue: function(src) {
        var text = this._cache.get(src);
        if (this._queue[src]) {
            while (this._queue[src][0]) {
                this._queue[src].shift()(text);
            }
        }
    }
});



/**
 * Blob file loader. Work in progress.
 * TODO: Fail fast in IE9
 * TODO: loadStyleSheet method
 */
gui.BlobLoader = {

    /**
     * Identification.
     * @returns {string}
     */
    toString: function() {
        return "[object gui.BlobLoader]";
    },

    /**
     * Mount blob with given content type from base64 encoded string.
     * http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @param {string} b64data
     * @param {string} contentType
     * @param @optional {number} sliceSize
     * @returns {Blob}
     */
    base64toBlob: function(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, {
            type: contentType
        });
    },

    /**
     * Mount blob with given content type from (unencoded) string.
     * @param {string} b64data
     * @param {string} contentType
     * @returns {Blob}
     */
    stringToBlob: function(string, contentType) {
        return new Blob([string], {
            type: contentType
        });
    },

    /**
     * Load script into document from given source code.
     * Note: An apparent bug in Firefox prevents the
     * onload from firing inside sandboxed iframes :/
     * @param {Document} doc
     * @param {String} source
     * @returns {gui.Then}
     */
    loadScript: function(doc, source) {
        var then = new gui.Then();
        var blob = this.stringToBlob(source, "text/javascript");
        var script = doc.createElement("script");
        script.src = this._URL.createObjectURL(blob);
        var head = doc.querySelector("head");
        gui.Observer.suspend(function() {
            head.appendChild(script);
        });
        script.onload = function() { // broken in firefox sandbox :/
            then.now();
        };
        return then;
    },

    // Private ...................................................................

    /**
     * Weirdo URL object.
     * @type {URL}
     */
    _URL: (window.URL || window.webkitURL)

};



/**
 * Provides convenient access to an events originating
 * window, document and spirit of the document element.
 * TODO: Fire this onmousemove only if has listeners!
 * @param {Event} e
 */
gui.EventSummary = function(e) {
    this._construct(e);
};

gui.EventSummary.prototype = {

    /**
     * The event itself.
     * @type {Event}
     */
    event: null,

    /**
     * Originating window.
     * @type {Window}
     */
    window: null,

    /**
     * Originating document.
     * @type {Document}
     */
    document: null,

    /**
     * Spirit of the root element (the HTML element) in originating document.
     * @type {gui.DocumentSpirit}
     */
    documentspirit: null,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.EventSummary]";
    },


    // Private ...................................................................

    /**
     * Breakdown event argument into more manegable properties
     * (this method illustrates the need for en event summary).
     * @param {Event} e
     * @returns {object}
     */
    _construct: function(e) {
        var win = null,
            doc = null,
            target = e.target,
            type = target.nodeType;
        if (gui.Type.isDefined(type)) {
            doc = (type === Node.DOCUMENT_NODE ? target : target.ownerDocument);
            win = doc.defaultView;
        } else {
            win = target;
            doc = win.document;
        }
        this.event = e;
        this.window = win;
        this.document = doc;
        this.documentspirit = doc.documentElement.spirit;
    }
};



/**
 * Crawling the DOM ascending or descending.
 * TODO: method <code>descendSub</code> to skip start element (and something similar for ascend)
 * @param @optional {String} type
 */
gui.Crawler = gui.Class.create(Object.prototype, {

    /**
     * Identifies crawler. TODO: spirit support for this!
     * @type {String}
     */
    type: null,

    /**
     * Direction "ascending" or "descending".
     * @type {String}
     */
    direction: null,

    /**
     * @type {Boolean}
     */
    global: false,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Crawler]";
    },

    /**
     * Constructor.
     * @param {String} type
     */
    onconstruct: function(type) {
        this.type = type || null;
    },

    /**
     * Crawl DOM ascending.
     * @param {Element|gui.Spirit} start
     * @param {object} handler
     */
    ascend: function(start, handler) {
        this.direction = gui.Crawler.ASCENDING;
        var win, elm = start instanceof gui.Spirit ? start.element : start;
        do {
            if (elm.nodeType === Node.DOCUMENT_NODE) {
                if (this.global) {
                    win = elm.defaultView;
                    if (win.gui.hosted) { // win.parent !== win
                        /*
                         * @TODO: iframed document might have navigated elsewhere, stamp this in localstorage
                         * @TODO: sit down and wonder if localstorage is even available in sandboxed iframes...
                         */
                        if (win.gui.xhost) {
                            elm = null;
                            if (gui.Type.isFunction(handler.transcend)) {
                                handler.transcend(win.parent, win.gui.xhost, win.gui.$contextid);
                            }
                        } else {
                            elm = win.frameElement;
                        }
                    } else {
                        elm = null;
                    }
                } else {
                    elm = null;
                }
            }
            if (elm) {
                var directive = this._handleElement(elm, handler);
                switch (directive) {
                    case gui.Crawler.STOP:
                        elm = null;
                        break;
                    default:
                        elm = elm.parentNode;
                        break;
                }
            }
        } while (elm);
    },

    /**
     * Crawl DOM ascending, transcend into ancestor frames.
     * @param {Element|gui.Spirit} start
     * @param {object} handler
     */
    ascendGlobal: function(start, handler) {
        this.global = true;
        this.ascend(start, handler);
        this.global = false;
    },

    /**
     * Crawl DOM descending.
     * @param {object} start Spirit or Element
     * @param {object} handler
     * @param @optional {object} arg @TODO: is this even supported?
     */
    descend: function(start, handler, arg) {
        this.direction = gui.Crawler.DESCENDING;
        var elm = start instanceof gui.Spirit ? start.element : start;
        if (elm.nodeType === Node.DOCUMENT_NODE) {
            elm = elm.documentElement;
        }
        this._descend(elm, handler, arg, true);
    },

    /**
     * Crawl DOM descending, transcend into iframes.
     * @param {object} start Spirit or Element
     * @param {object} handler
     * @param @optional {object} arg @TODO: is this even supported?
     */
    descendGlobal: function(start, handler, arg) {
        this.global = true;
        this.descend(start, handler, arg);
        this.global = false;
    },


    // Private ...................................................................

    /**
     * Iterate descending.
     * @param {Element} elm
     * @param {object} handler
     * @param {boolean} start
     */
    _descend: function(elm, handler, arg, start) {
        var win, spirit, directive = this._handleElement(elm, handler, arg);
        switch (directive) {
            case gui.Crawler.CONTINUE:
            case gui.Crawler.SKIP_CHILDREN:
                if (directive !== gui.Crawler.SKIP_CHILDREN) {
                    if (elm.childElementCount) {
                        this._descend(elm.firstElementChild, handler, arg, false);
                    } else if (this.global && elm.localName === "iframe") {
                        if ((spirit = elm.spirit) && (spirit instanceof gui.IframeSpirit)) {
                            win = elm.ownerDocument.defaultView;
                            if (gui.Type.isFunction(handler.transcend)) {
                                handler.transcend(
                                    spirit.contentWindow, 
                                    spirit.xguest, 
                                    spirit.$instanceid
                                );
                            }
                        }
                    }
                }
                if (!start) {
                    var next = elm.nextElementSibling;
                    if (next !== null) {
                        this._descend(next, handler, arg, false);
                    }
                }
                break;
        }
    },

    /**
     * Handle element. Invoked by both ascending and descending crawler.
     * @param {Element} element
     * @param {object} handler
     * @returns {number} directive
     */
    _handleElement: function(element, handler, arg) {
        var directive = gui.Crawler.CONTINUE;
        var spirit = element.spirit;
        if (spirit) {
            directive = spirit.oncrawler(this);
        }
        if (!directive) {
            if (handler) {
                if (gui.Type.isFunction(handler.handleElement)) {
                    directive = handler.handleElement(element, arg);
                }
                if (directive !== gui.Crawler.STOP) {
                    if (spirit && gui.Type.isFunction(handler.handleSpirit)) {
                        directive = this._handleSpirit(spirit, handler);
                    }
                }
            }
        }
        if (!directive) {
            directive = gui.Crawler.CONTINUE;
        }
        return directive;
    },

    /**
     * Handle Spirit.
     * @param {Spirit} spirit
     * @param {object} handler
     * @returns {number}
     */
    _handleSpirit: function(spirit, handler) {
        return handler.handleSpirit(spirit);
    }


}, {}, { // Static .............................................................

    ASCENDING: "ascending",
    DESCENDING: "descending",
    CONTINUE: 0,
    STOP: 1,
    SKIP: 2, // @TODO: support this
    SKIP_CHILDREN: 4

});



/**
 * Simplistic XMLHttpRequest wrapper.
 * @param @optional {String} url
 * @param @optional {Document} doc Resolve URL relative to given document location.
 */
gui.Request = function Request(url, doc) {
    this._headers = {
        "Accept": "application/json"
    };
    if (url) {
        this.url(url, doc);
    }
};

/**
 * @using {gui.Combo.chained}
 */
gui.Request.prototype = (function using(chained) {

    return {

        /**
         * Set request address.
         * @param {String} url
         * @param @optional {Document} doc Resolve URL relative to this document
         */
        url: chained(function(url, doc) {
            this._url = doc ? new gui.URL(doc, url).href : url;
        }),

        /**
         * Convert to synchronous request.
         */
        sync: chained(function() {
            this._async = false;
        }),

        /**
         * Convert to asynchronous request.
         */
        async: chained(function() {
            this._async = true;
        }),

        /**
         * Expected response type. Sets the accept header and formats
         * callback result accordingly (eg. as JSON object, XML document)
         * @param {String} mimetype
         * @returns {gui.Request}
         */
        accept: chained(function(mimetype) {
            this._headers.Accept = mimetype;
        }),

        /**
         * Expect JSON response.
         * @returns {gui.Request}
         */
        acceptJSON: chained(function() {
            this.accept("application/json");
        }),

        /**
         * Expect XML response.
         * @returns {gui.Request}
         */
        acceptXML: chained(function() {
            this.accept("text/xml");
        }),

        /**
         * Expect text response.
         * @returns {gui.Request}
         */
        acceptText: chained(function() {
            this.accept("text/plain");
        }),

        /**
         * Format response to this type.
         * @param {String} mimetype
         * @returns {gui.Request}
         */
        format: chained(function(mimetype) {
            this._format = mimetype;
        }),

        /**
         * Override mimetype to fit accept.
         * @returns {gui.Request}
         */
        override: chained(function(doit) {
            this._override = doit || true;
        }),

        /**
         * Append request headers.
         * @param {Map<String,String>} headers
         * @returns {gui.Request}
         */
        headers: chained(function(headers) {
            if (gui.Type.isObject(headers)) {
                gui.Object.each(headers, function(name, value) {
                    this._headers[name] = String(value);
                }, this);
            } else {
                throw new TypeError("Object expected");
            }
        }),


        // Private ...................................................................................

        /**
         * @type {boolean}
         */
        _async: true,

        /**
         * @type {String}
         */
        _url: null,

        /**
         * Default request type. Defaults to JSON.
         * @type {String}
         */
        _format: "application/json",

        /**
         * Override response mimetype?
         * @type {String}
         */
        _override: false,

        /**
         * Request headers.
         * @type {Map<String,String}
         */
        _headers: null,

        /**
         * Do the XMLHttpRequest.
         * TODO: http://mathiasbynens.be/notes/xhr-responsetype-json
         * @param {String} method
         * @param {object} payload
         * @param {function} callback
         */
        _request: function(method, payload, callback) {
            var that = this,
                request = new XMLHttpRequest();
            var xtarget = gui.URL.external(this._url, document);
            if (xtarget && window.XDomainRequest) {
                request = new window.XDomainRequest(); // @TODO: test this thing!
            }
            request.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE) {
                    var data = that._response(this.responseText);
                    callback(this.status, data, this.responseText);
                }
            };
            if (this._override) {
                request.overrideMimeType(this._headers.Accept);
            }
            request.open(method.toUpperCase(), this._url, true);
            if (!xtarget) { // headers not used xdomain per spec
                gui.Object.each(this._headers, function(name, value) {
                    request.setRequestHeader(name, value, false);
                });
            }
            request.send(payload);
        },

        /**
         * Parse response to expected type.
         * @param {String} text
         * @returns {object}
         */
        _response: function(text) {
            var result = text;
            try {
                switch (this._headers.Accept) {
                    case "application/json":
                        result = JSON.parse(text);
                        break;
                    case "text/xml":
                        result = new DOMParser().parseFromString(text, "text/xml");
                        break;
                }
            } catch (exception) {
                if (gui.debug) {
                    console.error(
                        this._headers.Accept + " dysfunction at " + this._url
                    );
                }
            }
            return result;
        }
    };

}(gui.Combo.chained));

/**
 * Generating methods for GET PUT POST DELETE.
 * @param @optional {object} payload
 */
["get", "post", "put", "delete"].forEach(function(method) {
    gui.Request.prototype[method] = function(payload) {
        if (gui.Type.isFunction(payload)) {
            throw new Error("Deprecated: gui.Request returns a gui.Then");
        }
        var then = new gui.Then();
        payload = method === "get" ? null : payload;
        this._request(method, payload, function(status, data, text) {
            then.now(status, data, text);
        });
        return then;
    };
});



/**
 * Base constructor for all plugins.
 * TODO: "context" should be required in constructor (sandbox scenario)
 */
gui.Plugin = gui.Class.create(Object.prototype, {

    /**
     * Associated spirit.
     * @type {gui.Spirit}
     */
    spirit: null,

    /**
     * Plugins may be designed to work without an associated spirit.
     * In that case, an external entity might need to define this.
     * @type {Global} Typically identical to this.spirit.window
     */
    context: null,

    /**
     * Construct
     */
    onconstruct: function() {},

    /**
     * Destruct.
     */
    ondestruct: function() {},

    /**
     * Implements DOM2 EventListener (native event handling).
     * We forwards the event to method 'onevent' IF that has
     * been specified on the plugin.
     * @param {Event} e
     */
    handleEvent: function(e) {
        if (gui.Type.isFunction(this.onevent)) {
            this.onevent(e);
        }
    },


    // Privileged ................................................................

    $destructed: false,

    /**
     * Secret constructor. Called before `onconstruct`.
     * @param {gui.Spirit} spirit
     */
    $onconstruct: function(spirit) {
        this.spirit = spirit || null;
        this.context = spirit ? spirit.window : null; // web worker scenario
        this.onconstruct();
    },

    /**
     * Secret destructor. Called after `ondestruct`.
     */
    $ondestruct: function() {}


}, { // Xstatic ................................................................

    /**
     * Construct only when requested?
     * @type {boolean}
     */
    lazy: true,

    /**
     * Plugins don't infuse.
     */
    infuse: function() {
        throw new Error(
            'Plugins must use the "extend" method and not "infuse".'
        );
    }


}, { // Static .................................................................

    /**
     * Lazy plugins are newed up only when needed. We'll create an
     * accessor for the prefix that will instantiate the plugin and
     * create a new accesor to return it. To detect if a plugin
     * has been instantiated, check with {gui.LifePlugin#plugins},
     * a hashmap that maps prefixes to a boolean status.
     * @param {gui.Spirit} spirit
     * @param {String} prefix
     * @param {function} Plugin
     */
    $prepare: function(spirit, prefix, Plugin) {
        Object.defineProperty(spirit, prefix, {
            enumerable: true,
            configurable: true,
            get: function() {
                var plugin = new Plugin(this);
                this.life.plugins[prefix] = true;
                gui.Plugin.$assign(spirit, prefix, plugin);
                return plugin;
            }
        });
    },

    /**
     * Assign plugin to prefix in such a clever way
     * that it cannot accidentally be overwritten.
     * TODO: Importantly handle 'force' parameter when overriding a plugin!
     * @param {gui.Spirit} spirit
     * @param {String} prefix
     * @param {gui.Plugin} plugin
     */
    $assign: function(spirit, prefix, plugin) {
        Object.defineProperty(spirit, prefix, {
            enumerable: true,
            configurable: true,
            get: function() {
                return plugin;
            },
            set: function() {
                throw new Error(
                    'The property name "' + prefix + '" is reserved for the ' +
                    plugin.$classname + ' and cannot be redefined.' // note about 'force'!
                );
            }
        });
    }


});



/**
 * Spirit action.
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Combo#chained} chained
 */
gui.Action = (function using(confirmed, chained) {

    if(gui.hosted) { // relay actions from parent frame.
        addEventListener('message', function(e) {
            if(e.source === parent) {
                gui.Action.$maybeDescendGlobal(e.data);
            }
        });
    }

    return gui.Class.create(Object.prototype, {

        /**
         * From who or where the action was dispatched.
         * @type {Node|gui.Spirit}
         */
        target: null,

        /**
         * Action type eg. "save-button-clicked".
         * @type {String}
         */
        type: null,

        /**
         * Optional data of any type.
         * This might be undefined.
         * @type {object}
         */
        data: null,

        /**
         * Is travelling up or down? Matches "ascend" or "descend".
         * @type {String}
         */
        direction: null,

        /**
         * Traverse iframe boundaries?
         * @type {boolean}
         */
        global: false,

        /**
         * Is action consumed?
         * TODO: rename 'consumed'
         * @type {boolean}
         */
        isConsumed: false,

        /**
         * Is action cancelled?
         * TODO: rename 'cancelled'
         * @type {boolean}
         */
        isCancelled: false,

        /**
         * Spirit who (potentially) consumed the action.
         * @type {gui.Spirit}
         */
        consumer: null,

        /**
         * Used when posting actions xdomain. Matches an iframespirit key.
         * TODO: rename this to something else (now that action has $instanceid).
         * @type {String}
         */
        instanceid: null,

        /**
         * Connstruct from JSON.
         * @param {object} json
         */
        onconstruct: function(json) {
            gui.Object.extend(this, json);
        },

        /**
         * Block further ascend.
         * @param @optional {gui.Spirit} consumer
         */
        consume: function(consumer) {
            this.isConsumed = true;
            this.consumer = consumer;
        },

        /**
         * Consume and cancel the event. Note that it is
         * up to the dispatcher to honour cancellation.
         * @param @optional {gui.Spirit} consumer
         */
        cancel: function(consumer) {
            this.isCancelled = true;
            this.consume(consumer);
        }


    }, {}, { // Static ...........................................................


        DESCEND : 'descend',
        ASCEND : 'ascend',

        /**
         * Action handler interface.
         */
        IActionHandler: {
            onaction: function(a) {},
            toString: function() {
                return '[interface ActionHandler]';
            }
        },

        /**
         * Don't use just yet! (pending WeakMaps)
         * @param {string|Array<string>} type
         * @param {object} handler Implements `onaction`
         * @param @optional {String} sig
         * @returns {constructor}
         */
        add: confirmed('node', 'array|string', 'object|function')(
            chained(function(elm, type, handler) {
                this._listen(true, elm, type, handler, false);
            })),

        /**
         * Don't use just yet! (pending WeakMaps)
         * @param {string|Array<string>} type
         * @param {object} handler
         * @param @optional {String} sig
         * @returns {constructor}
         */
        remove: confirmed('node', 'array|string', 'object|function')(
            chained(function(node, type, handler) {
                this._listen(false, node, type, handler, false);
            })),

        /**
         * Don't use just yet! (pending WeakMaps)
         * @param {string|Array<string>} type
         * @param {object} handler Implements `onaction`
         * @returns {constructor}
         */
        addGlobal: confirmed('node', 'array|string', 'object|function')(
            chained(function(node, type, handler) {
                this._listen(true, node, type, handler, true);
            })),

        /**
         * Don't use just yet! (pending WeakMaps)
         * @param {string|Array<string>} type
         * @param {object} handler
         * @returns {constructor}
         */
        removeGlobal: confirmed('node', 'array|string', 'object|function')(
            chained(function(node, type, handler) {
                this._listen(false, node, type, handler, true);
            })),

        /**
         *
         */
        dispatch: function(target, type, data) {
            return this.ascend(target, type, data);
        },

        /**
         *
         */
        ascend: function(target, type, data) {
            return this._dispatch(target, type, data, gui.Action.ASCEND, false);
        },

        /**
         *
         */
        descend: function(target, type, data) {
            return this._dispatch(target, type, data, gui.Action.DESCEND, false);
        },

        /**
         *
         */
        dispatchGlobal: function(target, type, data) {
            return this.ascendGlobal(target, type, data);
        },

        /**
         *
         */
        ascendGlobal: function(target, type, data) {
            return this._dispatch(target, type, data, gui.Action.ASCEND, true);
        },

        /**
         *
         */
        descendGlobal: function(target, type, data) {
            return this._dispatch(target, type, data, gui.Action.DESCEND, true);
        },

        /**
         * Encode action to be posted xdomain.
         * @param {gui.Action} a
         * @param @optional {String} key Associates dispatching document
         *        to the hosting iframespirit (ascending action scenario)
         * @returns {String}
         */
        stringify: function(a, key) {
            var prefix = "spiritual-action:";
            return prefix + (function() {
                a.target = null;
                a.data = (function(d) {
                        if (gui.Type.isComplex(d)) {
                            if (gui.Type.isFunction(d.stringify)) {
                                d = d.stringify();
                            } else {
                                try {
                                    JSON.stringify(d);
                                } catch (jsonexception) {
                                    d = null;
                                }
                            }
                        }
                        return d;
                    }(a.data));
                    a.instanceid = key || null;
                    return JSON.stringify(a);
                }());
        },

        /**
         * Parse string to {gui.Action}.
         * @param {string} msg
         * @returns {gui.Action}
         */
        parse: function(msg) {
            var prefix = "spiritual-action:";
            if (msg.startsWith(prefix)) {
                return new gui.Action(
                    JSON.parse(msg.split(prefix)[1])
                );
            }
            return null;
        },


        // Privileged static .......................................................

        /**
         * Parse postmessage from parent into descending action in this window?
         * @param {string} postmessage
         */
        $maybeDescendGlobal: function(postmessage) {
            var data = postmessage, action, root, handlers;
            if(gui.Type.isString(data) && data.startsWith("spiritual-action:")) {
                action = gui.Action.parse(data);
                if (action.direction === gui.Action.DESCEND) {
                    // Hotfix for actions in nospirit scenario
                    // TODO: rething this pending WeakMaps...
                    if((handlers = this._globals[action.type])) {
                        handlers.slice().forEach(function(handler) {
                            handler.onaction(action);
                        });
                    }
                    if ((root = gui.get('html'))) {
                        root.action.$handleownaction = true;
                        root.action.descendGlobal(
                            action.type,
                            action.data
                        );
                    }
                }
            }
        },


        // Private static ..........................................................

        /**
         *
         */
        _globals: {},

        /**
         *
         */
        _locals: {},

        /**
         * 
         */
        _listen: function(add, node, type, handler, global) {
            if(node.nodeType === Node.DOCUMENT_NODE) {
                var map = global ? this._globals : this._locals;
                var handlers = map[type];
                var ok = gui.Action.IActionHandler;
                if (gui.Interface.validate(ok, handler)) {
                    gui.Array.make(type).forEach(function(t) {
                        if(add) {
                            if(!handlers) {
                                handlers = map[type] = [];
                            }
                            if(handlers.indexOf(handler) === -1) {
                                handlers.push(handler);
                            }
                        } else if(handlers) {
                            if(gui.Array.remove(handlers, handler) === 0) {
                                delete map[type];
                            }
                        }
                    });
                }
            } else { // elements support pending WeakMap
                throw new TypeError('Document node expected');
            }
        },

        /**
         * Dispatch action. The dispatching spirit will not `onaction()` its own action.
         * TODO: Measure performance against https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
         * TODO: Class-like thing to carry all these scoped methods...
         * TODO: support custom `gui.Action` as an argument
         * TODO: common ancestor class for action, broadcast etc?
         * @param {gui.Spirit|Element} target
         * @param {String} type
         * @param @optional {object} data
         * @param @optional {String} direction
         * @param @optional {boolean} global
         * @returns {gui.Action}
         */
        _dispatch: function dispatch(target, type, data, direction, global) {

            // TODO: encapsulate this
            var action = new gui.Action({
                target: target,
                type: type,
                data: data,
                direction: direction || gui.Action.ASCEND,
                global: global || false
            });

            var crawler = new gui.Crawler(gui.CRAWLER_ACTION);
            crawler.global = action.global || false;
            crawler[action.direction](target, {
                /*
                 * Evaluate action for spirit.
                 * @param {gui.Spirit} spirit
                 */
                handleSpirit: function(spirit) {
                    var directive = gui.Crawler.CONTINUE;
                    if (spirit.action.contains(type)) {
                        spirit.action.$onaction(action);
                        if (action.isConsumed) {
                            directive = gui.Crawler.STOP;
                            action.consumer = spirit;
                        }
                    }
                    return directive;
                },
                
                /*
                 * Teleport action across domains.
                 * @see {gui.IframeSpirit}
                 * @param {Window} win Remote window
                 * @param {String} uri target origin
                 * @param {String} key Spiritkey of xdomain IframeSpirit (who will relay the action)
                 */
                transcend: function(win, uri, key) {
                    var msg = gui.Action.stringify(action, key);
                    win.postMessage(msg, "*"); // uri
                }
            });
            return action;
        }

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/** 
 * Broadcast.
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.Broadcast = (function using(confirmed, chained) {

    window.addEventListener('message', function(e) {
        if(gui.Type.isString(e.data)) {
            if(e.data.startsWith('spiritual-broadcast:')) {
                gui.Broadcast.$maybeBroadcastGlobal(e.data);
            }
        }
    });

    return gui.Class.create(Object.prototype, {

        /**
         * Broadcast target.
         * @type {gui.Spirit}
         */
        target: null,

        /**
         * Broadcast type.
         * @type {String}
         */
        type: null,

        /**
         * Broadcast data.
         * @type {object}
         */
        data: null,

        /**
         * Global broadcast?
         * @type {boolean}
         */
        global: false,

        /**
         * Signature of dispatching context.
         * Unimportant for global broadcasts.
         * @type {String}
         */
        $contextid: null,

        /**
         * Experimental...
         * TODO: Still used?
         * @type {Array<String>}
         */
        $contextids: null,

        /**
         * Constructor.
         * @param {Map<String,object>} defs
         */
        $onconstruct: function(defs) {
            gui.Object.extend(this, defs);
            this.$contextids = this.$contextids || [];
        }


    }, {}, { // Static ...........................................................


        /**
         * Broadcast handler interface.
         */
        IBroadcastHandler: {
            onbroadcast: function(b) {},
            toString: function() {
                return '[interface BroadcastHandler]';
            }
        },

        /**
         * @type {gui.Spirit}
         */
        $target: null,

        /**
         * TODO: Ths can be deprecated now(?)
         * Tracking global handlers (mapping broadcast types to list of handlers).
         * @type {Map<String,<Array<object>>}
         */
        _globals: Object.create(null),

        /**
         * TODO: Ths can be deprecated now!
         * Tracking local handlers (mapping gui.$contextids
         * to broadcast types to list of handlers).
         * @type {Map<String,Map<String,Array<object>>>}
         */
        _locals: Object.create(null),

        /**
         * mapcribe handler to message.
         * @param {object} message String or array of strings
         * @param {object} handler Implements `onbroadcast`
         * @param @optional {String} sig
         * @returns {function}
         */
        add: chained(function(message, handler, sig) {
            this._add(message, handler, sig || gui.$contextid);
        }),

        /**
         * Unmapcribe handler from broadcast.
         * @param {object} message String or array of strings
         * @param {object} handler
         * @param @optional {String} sig
         * @returns {function}
         */
        remove: chained(function(message, handler, sig) {
            this._remove(message, handler, sig || gui.$contextid);
        }),

        /**
         * mapcribe handler to message globally.
         * @param {object} message String or array of strings
         * @param {object} handler Implements `onbroadcast`
         * @returns {function}
         */
        addGlobal: chained(function(message, handler) {
            this._add(message, handler);
        }),

        /**
         * Unmapcribe handler from global broadcast.
         * @param {object} message String or array of strings
         * @param {object} handler
         * @returns {function}
         */
        removeGlobal: chained(function(message, handler) {
            this._remove(message, handler);
        }),

        /**
         * Publish broadcast in specific window scope (defaults to this window)
         * TODO: queue for incoming dispatch (finish current message first).
         * @param {Spirit} target
         * @param {String} type
         * @param {object} data
         * @param {String} contextid
         * @returns {gui.Broadcast}
         */
        dispatch: function(type, data) {
            if (gui.Type.isString(type)) {
                return this._dispatch({
                    type: type,
                    data: data,
                    global: false
                });
            } else {
                console.error('The "target" argument (the first argument) of gui.Broadcast.dispatch is deprecated');
                this.dispatch(arguments[1], arguments[2]);
            }
        },

        /**
         * Dispatch broadcast in global scope (all windows).
         * TODO: queue for incoming dispatch (finish current first).
         * TODO: Handle remote domain iframes ;)
         * @param {Spirit} target
         * @param {String} type
         * @param {object} data
         * @returns {gui.Broadcast}
         */
        dispatchGlobal: function(type, data) {
            if (gui.Type.isString(type)) {
                return this._dispatch({
                    type: type,
                    data: data,
                    global: true,
                    $contextid: gui.$contextid
                });
            } else {
                console.error('The "target" argument (the first argument) of gui.Broadcast.dispatchGlobal is deprecated');
                return this.dispatchGlobal(arguments[1], arguments[2]);
            }
        },

        /**
         * Encode broadcast to be posted xdomain.
         * @param {gui.Broacast} b
         * @returns {String}
         */
        stringify: function(b) {
            var prefix = "spiritual-broadcast:";
            return prefix + (function() {
                b.target = null;
                b.data = (function(d) {
                    if (gui.Type.isComplex(d)) {
                        if (gui.Type.isFunction(d.stringify)) {
                            d = d.stringify();
                        } else {
                            try {
                                JSON.stringify(d); // @TODO: think mcfly - how come not d = JSON.stringify????
                            } catch (jsonexception) {
                                d = null;
                            }
                        }
                    }
                    return d;
                }(b.data));
                return JSON.stringify(b);
            }());
        },

        /**
         * Decode broadcast posted from xdomain and return a broadcast-like object.
         * @param {String} msg
         * @returns {object}
         */
        parse: function(msg) {
            var prefix = "spiritual-broadcast:";
            if (msg.startsWith(prefix)) {
                return JSON.parse(msg.split(prefix)[1]);
            }
        },


        // Privileged static .......................................................

        /**
         * Parse postmessage into broadcast in this window? 
         * Broadcasts propagate over-agressively, so perhaps 
         * the broadcast has already bypassed this context.
         * @param {string} postmessage
         */
        $maybeBroadcastGlobal: function(postmessage) {
            var b = gui.Broadcast.parse(postmessage);
            if(b.$contextids.indexOf(gui.$contextid) === -1) {
                gui.Broadcast._dispatch(b);
            }
        },


        // Private .................................................................

        /**
         * Subscribe handler to message(s).
         * @param {Array<string>|string} type
         * @param {object|function} handler Implements `onbroadcast`
         * @param @optional {String} sig
         */
        _add: confirmed("array|string", "object|function", "(string)")(
            function(type, handler, sig) {
                var interfais = gui.Broadcast.IBroadcastHandler;
                if (true || gui.Interface.validate(interfais, handler)) {
                    if (gui.Type.isArray(type)) {
                        type.forEach(function(t) {
                            this._add(t, handler, sig);
                        }, this);
                    } else {
                        var map;
                        if (sig) {
                            map = this._locals[sig];
                            if (!map) {
                                map = this._locals[sig] = Object.create(null);
                            }
                        } else {
                            map = this._globals;
                        }
                        if (!map[type]) {
                            map[type] = [];
                        }
                        var array = map[type];
                        if (array.indexOf(handler) === -1) {
                            array.push(handler);
                        }
                    }
                }
            }
        ),

        /**
         * Hello.
         * @param {object} message String or array of strings
         * @param {object} handler
         * @param @optional {String} sig
         */
        _remove: function(message, handler, sig) {
            var interfais = gui.Broadcast.IBroadcastHandler;
            if (true || gui.Interface.validate(interfais, handler)) {
                if (gui.Type.isArray(message)) {
                    message.forEach(function(msg) {
                        this._remove(msg, handler, sig);
                    }, this);
                } else {
                    var index, array = (function(locals, globals) {
                        if (sig) {
                            if (locals[sig]) {
                                return locals[sig][message];
                            }
                        } else {
                            return globals[message];
                        }
                    }(this._locals, this._globals));
                    if (array) {
                        index = array.indexOf(handler);
                        if (index > -1) {
                            gui.Array.remove(array, index);
                        }
                    }
                }
            }
        },

        /**
         * Dispatch broadcast.
         * @param {gui.Broadcast|Map<String,object>} b
         */
        _dispatch: function(b) {
            var map = b.global ? this._globals : this._locals[gui.$contextid];
            if (gui.hasModule('spirits@wunderbyte.com')) {
                if(!gui.spiritualized) {
                    if(b.type !== gui.BROADCAST_WILL_SPIRITUALIZE) {
                        // console.warn('TODO: cache "' + b.type + '"" until spiritualized');
                    }
                }
            }
            if (this.$target) {
                if (!b.global) {
                    b.target = this.$target;
                }
                this.$target = null;
            }
            if (b instanceof gui.Broadcast === false) {
                b = new gui.Broadcast(b);
            }
            if (map) {
                var handlers = map[b.type];
                if (handlers) {
                    handlers.slice().forEach(function(handler) {
                        handler.onbroadcast(b);
                    });
                }
            }
            if (b.global) {
                this._propagate(b);
            }
            return b;
        },

        /**
         * Propagate broadcast xframe.
         *
         * 1. Propagate descending
         * 2. Propagate ascending
         * TODO: Don't post to universal domain "*"
         * @param {gui.Broadcast} b
         */
        _propagate: function(b) {
            var postmessage = (function stamp() {
                b.$contextids.push(gui.$contextid);
                return gui.Broadcast.stringify(b);
            }());
            this._propagateDown(postmessage);
            this._propagateUp(postmessage, b.type);
        },

        /**
         * Propagate broadcast to sub documents.
         * @param {string} postmessage
         */
        _propagateDown: function(postmessage) {
            var iframes = document.querySelectorAll("iframe");
            Array.forEach(iframes, function(iframe) {
                iframe.contentWindow.postMessage(postmessage, '*');
            });
        },

        /**
         * Propagate broadcast to parent document.
         * @param {string} postmessage
         */
        _propagateUp: function(postmessage) {
            if (window !== top) {
                parent.postMessage(postmessage, "*");
            }
        }

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/** 
 * Ticks are used for timed events.
 * TODO: Tick.push
 * @using {gui.Arguments#confirmed}
 */
(function using(confirmed) {

    /**
     * @param {String} type
     */
    gui.Tick = function(type) {
        this.type = type;
    };

    gui.Tick.prototype = {

        /**
         * Tick type.
         * @type {String}
         */
        type: null,

        /**
         * Identification.
         * @returns {String}
         */
        toString: function() {
            return "[object gui.Tick]";
        }
    };


    // Static ....................................................................

    gui.Object.extend(gui.Tick, {

        /**
         * Identification.
         * @returns {String}
         */
        toString: function() {
            return "[function gui.Tick]";
        },

        /**
         * Add handler for tick.
         * TODO: Sig argument is deprecated...
         * @param {object} type String or array of strings
         * @param {object} handler
         * @param @optional {boolean} one Remove handler after on tick of this type?
         * @returns {function}
         */
        add: confirmed("string|array", "object|function", "(string)")(
            function(type, handler, sig) {
                return this._add(type, handler, false, sig || gui.$contextid);
            }
        ),

        /**
         * Remove handler for tick.
         * @param {object} type String or array of strings
         * @param {object} handler
         * @returns {function}
         */
        remove: confirmed("string|array", "object|function", "(string)")(
            function(type, handler, sig) {
                return this._remove(type, handler, sig || gui.$contextid);
            }
        ),

        /**
         * Add auto-removing handler for tick.
         * @param {object} type String or array of strings
         * @param {object} handler
         * @returns {function}
         */
        one: confirmed("string|array", "object|function", "(string)")(
            function(type, handler, sig) {
                return this._add(type, handler, true, sig || gui.$contextid);
            }
        ),

        /**
         * Schedule action for next available execution stack.
         * @TODO: deprecate setImmedate polyfix and do the fix here
         * @param {function} action
         * @param @optional {object} thisp
         */
        next: function(action, thisp) {
            setImmediate(function() {
                action.call(thisp);
            });
        },

        /**
         * Schedule action for next animation frame.
         * @TODO: deprecate requestAnimationFrame polyfix and do the fix here
         * @param {function} action
         * @param @optional {object} thisp
         * returns {number}
         */
        nextFrame: function(action, thisp) {
            return requestAnimationFrame(function(timestamp) {
                action.call(thisp, timestamp);
            });
        },

        /**
         * Cancel animation frame by index.
         * @param {number} n
         */
        cancelFrame: function(n) {
            window.cancelAnimationFrame(n);
        },

        /**
         * Set a timeout.
         * @param {function} action
         * @param @optional {number} time Default to something like 4ms
         * @param @optional {object} thisp
         * returns {number}
         */
        time: confirmed('function', '(number)', '(function|object)')(
            function(action, time, thisp) {
                return setTimeout(function() {
                    action.call(thisp);
                }, time);
            }
        ),

        /**
         * Cancel timeout by index.
         * @param {number} n
         */
        cancelTime: function(n) {
            clearTimeout(n);
        },

        /**
         * Start repeated tick of given type.
         * @param {string} type Tick type
         * @param {ITickHandler} handler
         * @param @optional {number} time Time in milliseconds
         * @returns {function}
         */
        start: confirmed("string", "(number)")(
            function(type, time) {
                var map = this._intervals;
                if (!map[type]) {
                    var tick = new gui.Tick(type);
                    map[type] = setInterval(function() {
                        this._doit(tick);
                    }.bind(this), time || 0);
                }
            }
        ),

        /**
         * Stop repeated tick of given type.
         * @param {String} type Tick type
         * @returns {function}
         */
        stop: confirmed("string")(
            function(type) {
                var map = this._intervals;
                var id = map[type];
                if (id) {
                    clearInterval(id);
                    delete map[type];
                }
            }
        ),

        /**
         * Dispatch tick now or in specified time. Omit time to
         * dispatch now. Zero resolves to next available thread.
         * @param {String} type
         * @param @optional {number} time
         * @returns {gui.Tick}
         */
        dispatch: function(type, time, sig) {
            return this._dispatch(type, time, sig || gui.$contextid);
        },
        

        // Private static ..........................................................

        /**
         * Comment goes here.
         */
        _intervals: Object.create(null),

        /**
         * Return of the comment.
         */
        _tempname: {
            types: Object.create(null),
            handlers: Object.create(null)
        },

        /**
         * Hello.
         */
        _add: function(type, handler, one, sig) {
            if (gui.Type.isArray(type)) {
                type.forEach(function(t) {
                    this._add(t, handler, one, sig);
                }, this);
            } else {
                var list, index;
                var map = this._tempname;
                list = map.handlers[type];
                if (!list) {
                    list = map.handlers[type] = [];
                }
                index = list.indexOf(handler);
                if (index < 0) {
                    index = list.push(handler) - 1;
                }
                /*
                 * @TODO
                 * Adding a property to an array will
                 * make it slower in Firefox. Fit it!
                 */
                if (one) {
                    list._one = list._one || Object.create(null);
                    list._one[index] = true;
                }
            }
            return this;
        },

        /**
         * Hello.
         */
        _remove: function(type, handler, sig) {
            if (gui.Type.isArray(type)) {
                type.forEach(function(t) {
                    this.remove(t, handler, sig);
                }, this);
            } else {
                var map = this._tempname;
                var list = map.handlers[type];
                if (list) {
                    var index = list.indexOf(handler);
                    if (gui.Array.remove(list, index) === 0) {
                        delete map.handlers[type];
                    }
                }
            }
            return this;
        },

        /**
         * Dispatch tick sooner or later.
         * @param {String} type
         * @param @optional {number} time
         * @param @optional {String} sig
         */
        _dispatch: function(type, time, sig) {
            var map = this._tempname;
            var types = map.types;
            var tick = new gui.Tick(type);
            time = time || 0;
            if (!types[type]) { // !!!!!!!!!!!!!!!!!!!!!!!
                types[type] = true;
                var that = this,
                    id = null;
                if (!time) {
                    id = setImmediate(function() {
                        delete types[type];
                        that._doit(tick);
                    });
                } else {
                    id = setTimeout(function() {
                        delete types[type];
                        that._doit(tick);
                    }, time);
                }
            }
            return tick;
        },

        /**
         * Tick now.
         * TODO: figure out how destructed spirits should 
         * behave while we loop through handlers
         * @param {gui.Tick} tick
         */
        _doit: function(tick) {
            var list = this._tempname.handlers[tick.type];
            if (list) {
                list.slice().forEach(function(handler) {
                    handler.ontick(tick);
                });
            }
        }

    });

}(gui.Arguments.confirmed));



/**
 * Questionable browser identity and feature detection.
 * @TODO Load earlier by not using gui.Broadcast
 * @TODO Lazycompute properties when requested.
 */
gui.Client = (function() {

    var agent = navigator.userAgent.toLowerCase();

    /**
     * Supports CSS feature?
     * @param {String} feature
     * @returns {boolean}
     */
    function supports(feature) {
        var root = document.documentElement;
        var fixt = feature[0].toUpperCase() + feature.substring(1);
        return !["", "Webkit", "Moz", "O", "ms"].every(function(prefix) {
            return root.style[prefix ? prefix + fixt : feature] === undefined;
        });
    }

    function Client() {
        this.isExplorer = agent.contains("msie") || agent.contains("trident");
        this.isExplorer9 = this.isExplorer && agent.contains("msie 9"); // @TODO feature detect something
        this.isOpera = agent.contains("opera");
        this.isWebKit = agent.contains("webkit");
        this.isChrome = this.isWebKit && agent.contains("chrome");
        this.isSafari = this.isWebKit && !this.isChrome && agent.contains("safari");
        this.isGecko = !this.isWebKit && !this.isOpera && agent.contains("gecko");
        this.isChromeApp = (window.chrome && window.chrome.app && window.chrome.app.runtime) ? true : false;

        /**
         * Agent is one of "webkit" "firefox" "opera" "explorer"
         * @type {String}
         */
        this.agent = (function() {
            var agent = "explorer";
            if (this.isWebKit) {
                agent = "webkit";
            } else if (this.isGecko) {
                agent = "gecko";
            } else if (this.isOpera) {
                agent = "opera";
            }
            return agent;
        }).call(this);

        /**
         * System is one of "linux" "osx" "ios" "windows" "windowsmobile" "haiku"
         */
        this.system = (function() {
            var os = null;
            ["window mobile", "windows", "ipad", "iphone", "haiku", "os x", "linux"].every(function(test) {
                if (agent.contains(test)) {
                    if (test.match(/ipad|iphone/)) {
                        os = "ios";
                    } else {
                        os = test.replace(/ /g, ""); // no spaces
                    }
                }
                return os === null;
            });
            return os;
        })();

        /**
         * Has touch support? Note that desktop Chrome has this.
         * @TODO Investigate this in desktop IE10.
         * @type {boolean}
         */
        this.hasTouch = (window.ontouchstart !== undefined || this.isChrome);

        /**
         * Has native pointer events? Seems to work best if we hardcode `false`.
         * @TODO: feature detect somewhing
         * @type {boolean}
         */
        this.hasPointers = false; // ( this.isExplorer && !this.isExplorer9 );

        /**
         * Supports file blob?
         * @type {boolean}
         */
        this.hasBlob = (window.Blob && (window.URL || window.webkitURL));

        /**
         * Supports the History API?
         * @type {boolean}
         */
        this.hasHistory = (window.history && window.history.pushState) ? true : false;

        /**
         * Is mobile device? Not to be confused with this.hasTouch
         * @TODO rename to isTouchDevice or something :/
         * @type {boolean}
         */
        this.isMobile = (function() {
            var shortlist = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone"];
            return !shortlist.every(function(system) {
                return !agent.contains(system);
            });
        }());

        /**
         * Supports CSS transitions?
         * @type {boolean}
         */
        this.hasTransitions = supports("transition");

        /**
         * Supports CSS transforms?
         * @type {boolean}
         */
        this.hasTransforms = supports("transform");

        /**
         * Supports CSS animations?
         * @type {boolean}
         */
        this.hasAnimations = supports("animationName");

        /**
         * Supports CSS 3D transform? (note https://bugzilla.mozilla.org/show_bug.cgi?id=677173)
         * @type {boolean}
         */
        this.has3D = supports("perspective");

        /**
         * Supports flexible box module?
         * @type {boolean}
         */
        this.hasFlex = supports("flex");

        /**
         * Temp...
         */
        Object.defineProperty(this, 'hasFlexBox', {
            get: function() {
                console.error('Depracated API is deprecated: hasFlexBox >> hasFlex');
            }
        });

        /**
         * Supports requestAnimationFrame somewhat natively?
         * @type {boolean}
         */
        this.hasAnimationFrame = (function() {
            var win = window;
            return (
                win.requestAnimationFrame ||
                win.webkitRequestAnimationFrame ||
                win.mozRequestAnimationFrame ||
                win.msRequestAnimationFrame ||
                win.oRequestAnimationFrame
            ) ? true : false;
        })();

        /**
         * Supports HTMLTemplateElement?
         * @type {boolean}
         */
        this.hasTemplates = (function(template) {
            return 'content' in template ? true : false;
        }(document.createElement('template')));

        /**
         * Supports HTML imports?
         * @type {boolean}
         */
        this.hasImports = (function(link) {
            return 'import' in link ? true : false;
        }(document.createElement('link')));

        /**
         * Supports MutationObserver feature?
         * @type {boolean}
         */
        this.hasMutations = (function() {
            return !["", "WebKit", "Moz", "O", "Ms"].every(function(vendor) {
                return !gui.Type.isDefined(window[vendor + "MutationObserver"]);
            });
        })();

        /**
         * Time in milliseconds after window.onload before we can reliably measure
         * document height. We could in theory discriminate between browsers here,
         * but we won't. WebKit sucks more at this and Safari on iOS is dead to me.
         * @see https://code.google.com/p/chromium/issues/detail?id=35980
         * @TODO Now Firefox started to suck really bad. What to do?
         * @type {number}
         */
        this.STABLETIME = 200;

        /**
         * Browsers disagree on the primary scrolling element.
         * Is it document.body or document.documentElement?
         * @see https://code.google.com/p/chromium/issues/detail?id=2891
         * @type {HTMLElement}
         */
        this.scrollRoot = null;

        /**
         * Scrollbar default span in pixels.
         * Note that this is zero on mobiles.
         * @type {number}
         */
        this.scrollBarSize = 0;

        /**
         * Supports position fixed?
         * @type {boolean}
         */
        this.hasPositionFixed = false;

        /**
         * Before we start any spirits:
         *
         * - What is the scroll root? (@todo DEPRECATED nowadays always documentElement!)
         * - Supports position fixed?
         * @param {gui.Broadcast} b
         */
        this.onbroadcast = function(b) {
            var type = gui.BROADCAST_WILL_SPIRITUALIZE;
            if (b.type === type) {
                gui.Broadcast.removeGlobal(type, this);
                extras.call(this);
            }
        };

        /**
         * @TODO Probably move this out of here?
         */

        function extras() {
            if(!gui.CSSPlugin) {
                return; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            }
            var win = window,
                doc = document,
                html = doc.documentElement,
                body = doc.body,
                root = null;
            // make sure window is scrollable
            var temp = body.appendChild(
                gui.CSSPlugin.style(doc.createElement("div"), {
                    position: "absolute",
                    height: "10px",
                    width: "10px",
                    top: "100%"
                })
            );
            // what element will get scrolled?
            win.scrollBy(0, 10);
            root = html.scrollTop ? html : body;
            this.scrollRoot = root;
            // supports position fixed?
            gui.CSSPlugin.style(temp, {
                position: "fixed",
                top: "10px"
            });
            // restore scroll when finished
            var has = temp.getBoundingClientRect().top === 10;
            this.hasPositionFixed = has;
            body.removeChild(temp);
            win.scrollBy(0, -10);
            // compute scrollbar size
            var inner = gui.CSSPlugin.style(document.createElement("p"), {
                width: "100%",
                height: "200px"
            });
            var outer = gui.CSSPlugin.style(document.createElement("div"), {
                position: "absolute",
                top: "0",
                left: "0",
                visibility: "hidden",
                width: "200px",
                height: "150px",
                overflow: "hidden"
            });
            outer.appendChild(inner);
            html.appendChild(outer);
            var w1 = inner.offsetWidth;
            outer.style.overflow = "scroll";
            var w2 = inner.offsetWidth;
            if (w1 === w2) {
                w2 = outer.clientWidth;
            }
            html.removeChild(outer);
            this.scrollBarSize = w1 - w2;

            /*
             * Temp hotfix for IE...
             */
            if (this.isExplorer) {
                this.scrollBarSize = 17; // wat
            }
        }
    }

    return new Client();

}());

/**
 * Hm.
 */
(function waitfordom() {
    gui.Broadcast.addGlobal(gui.BROADCAST_WILL_SPIRITUALIZE, gui.Client);
})();



/**
 * Where spirits go to be garbage collected. Not for public
 * consumption: Please dispose of spirits via the {gui.Guide}.
 * TODO: Refactor (rename) into general purpose trahscan thing.
 * @see {gui.Guide#materialize}
 * @see {gui.Guide#materializeOne}
 * @see {gui.Guide#materializeSub}
 */
gui.GreatSpirit = {

    /**
     * To identify our exception in a try-catch scenario, look for
     * this string in the *beginning* of the exception message
     * since sometimes we might append additional information.
     * @type {String}
     */
    DENIAL: "Attempt to handle destructed object",

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.GreatSpirit]";
    },

    /**
     * Nukefication moved to next tick. This will minimize chaos,
     * but does imply that for the duration of this tick, methods
     * might be called on spirits that don't exist in the DOM.
     * @TODO: Flag for this behavior (defaulting to off)?
     */
    ontick: function(t) {
        if (t.type === gui.$TICK_DESTRUCT) {
            if (window.gui) { // hotfix IE window unloaded scenario...
                this._nukemnow();
            }
        }
    },


    // Privileged ................................................................

    /**
     * Schedule to nuke the spirit.
     * @param {gui.Spirit} spirit
     */
    $meet: function(spirit) {
        if (gui.unloading) {
            this.$nuke(spirit);
        } else {
            this._spirits.push(spirit);
            gui.Tick.dispatch(gui.$TICK_DESTRUCT);
        }
    },

    /**
     * Nuke that spirit.
     *
     * - Nuke lazy plugins so that we don't accidentally instantiate them
     * - Destruct remaining plugins, saving the {gui.Life} plugin for last
     * - Replace all properties with an accessor to throw an exception
     *
     * @param {gui.Spirit} spirit
     */
    $nuke: function(spirit) {
        var prefixes = [],
            plugins = spirit.life.plugins;
        gui.Object.each(plugins, function(prefix, instantiated) {
            if (instantiated) {
                if (prefix !== "life") {
                    prefixes.push(prefix);
                }
            } else {
                Object.defineProperty(spirit, prefix, {
                    enumerable: true,
                    configurable: true,
                    get: function() {},
                    set: function() {}
                });
            }
        });
        plugins = prefixes.map(function(key) {
            return spirit[key];
        }, this);
        if (!gui.unloading) {
            this.$nukeplugins(plugins, false);
            gui.Tick.next(function() { // TODO: organize this at some point...
                this.$nukeplugins(plugins, true);
                this.$nukeelement(spirit);
                this.$nukeallofit(spirit);
            }, this);
        }
    },

    /**
     * Nuke plugins in three steps to minimize access violations.
     * @param {gui.Spirit} spirit
     * @param {Array<String>} prefixes
     * @param {boolean} nuke
     */
    $nukeplugins: function(plugins, nuke) {
        if (nuke) {
            plugins.forEach(function(plugin) {
                this.$nukeallofit(plugin);
            }, this);
        } else {
            plugins.map(function(plugin) {
                plugin.ondestruct();
                return plugin;
            }).forEach(function(plugin) {
                plugin.$ondestruct();
            });
        }
    },

    /**
     * Unreference spirit associated element.
     * Explorer may deny permission in frames.
     * @TODO: Is IE exception still relevant?
     */
    $nukeelement: function(spirit) {
        try {
            spirit.element.spirit = null;
        } catch (denied) {}
    },

    /**
     * Replace own properties with an accessor to throw an exception.
     * In 'gui.debug' mode we replace all props, not just own props,
     * so that we may fail fast on attempt to handle destructed spirit.
     * @TODO: keep track of non-enumerables and nuke those as well :/
     * @param {object} thing
     */
    $nukeallofit: function(thing) {
        var nativeprops = Object.prototype;
        if (!gui.unloading && !thing.$destructed) {
            thing.$destructed = true;
            for (var prop in thing) {
                if (thing.hasOwnProperty(prop) || gui.debug) {
                    if (nativeprops[prop] === undefined) {
                        if (prop !== '$destructed') {
                            var desc = Object.getOwnPropertyDescriptor(thing, prop);
                            if (!desc || desc.configurable) {
                                if (gui.debug) {
                                    this._definePropertyItentified(thing, prop);
                                } else {
                                    Object.defineProperty(thing, prop, this.DENIED);
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * User to access property post destruction,
     * report that the spirit was terminated.
     */
    DENIED: {
        enumerable: true,
        configurable: true,
        get: function() {
            gui.GreatSpirit.DENY();
        },
        set: function() {
            gui.GreatSpirit.DENY();
        }
    },

    /**
     * Obscure mechanism to include the whole stacktrace in the error message
     * because some kind of Selenium WebDriver can't print stack traces...
     * @see https://gist.github.com/jay3sh/1158940
     * @param @optional {String} message
     */
    DENY: function(message) {
        var stack, e = new Error(
            gui.GreatSpirit.DENIAL + (message ? ": " + message : "")
        );
        if (!gui.Client.isExplorer && (stack = e.stack)) {
            if (gui.Client.isWebKit) {
                stack = stack.replace(/^[^\(]+?[\n$]/gm, "").
                replace(/^\s+at\s+/gm, "").
                replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@").
                split("\n");
            } else {
                stack = stack.split("\n");
            }
            stack.shift();
            stack.shift(); // @TODO: shift one more now?
            console.warn(e.message + "\n" + stack);
        } else {
            console.warn(e.message);
        }
    },


    // Private ...................................................................

    /**
     * Spirits scheduled for destruction.
     * @type {Array<gui.Spirit>}
     */
    _spirits: [],

    /**
     * In debug mode, throw a more qualified "attempt to handle destructed spirit"
     * @param {object} thing
     * @param {String} prop
     */
    _definePropertyItentified: function(thing, prop) {
        Object.defineProperty(thing, prop, {
            enumerable: true,
            configurable: true,
            get: function() {
                gui.GreatSpirit.DENY(thing);
            },
            set: function() {
                gui.GreatSpirit.DENY(thing);
            }
        });
    },

    /**
     * Nuke spirits now.
     */
    _nukemnow: function() {
        var spirit, spirits = this._spirits.slice();
        if (window.gui) { // hotfix IE window unloaded scenario...
            while ((spirit = spirits.shift())) {
                this.$nuke(spirit);
            }
            this._spirits = [];
        }
    }

};

gui.Tick.add(gui.$TICK_DESTRUCT, gui.GreatSpirit);



/**
 * This thing does most of what the {gui.DocumentSpirit} used
 * to do, only now it will work without any spirits whatsoever. 
 * TODO: Setup for how to make a custom impl (subclass) of this.
 */
gui.Document = (function scoped() {

    /**
     * Dispatch global action to hosting document (if any).
     * This will most likely get picked up by the containing
     * {gui.IframeSpirit} so that it knows what's going on.
     * @param {string} type
     * @param @optional {object} data
     */
    function doaction(type, data) {
        if (gui.hosted) {
            gui.Action.ascendGlobal(document, type, data);
        }
    }

    return gui.Class.create(Object.prototype, {

        /**
         * Setup loads of event listeners.
         */
        onconstruct: function() {
            var that = this, add = function(target, events, capture) {
                events.split(' ').forEach(function(type) {
                    target.addEventListener(type, that, capture);
                });
            };
            add(document, 'DOMContentLoaded');
            add(document, 'click mousedown mouseup', true);
            add(window, 'load hashchange');
            if (!gui.hosted) {
                add(window, 'resize orientationchange');
            }
            if (document.readyState === "complete") { // TODO: IE cornercase?
                if (!this._loaded) {
                    this._ondom();
                    this._onload();
                }
            }
        },

        /**
         * Handle event.
         * @param {Event} e
         */
        handleEvent: function(e) {
            switch (e.type) {
                case "click":
                case "mousedown":
                case "mouseup":
                    this._onmouseevent(e);
                    break;
                case "orientationchange":
                    this._onrotate();
                    break;
                case "resize":
                    this._onresize();
                    break;
                case "DOMContentLoaded":
                    this._ondom();
                    if (!gui.hasModule("spirits@wunderbyte.com")) {
                        (function cleanthisup() {
                            gui._oninit();
                            gui.$onready();
                        }());
                    }
                    break;
                case "load":
                    this._onload();
                    break;
                case "hashchange":
                    this._onhashchange();
                    break;
            }
        },


        // Private ...................................................................

        /**
         * Window loaded?
         * @type {boolean}
         */
        _loaded: false,

        /**
         * DOMContentLoaded?
         * @type {boolean}
         */
        _domloaded: true,

        /**
         * Resize-end timeout id.
         * @type {number}
         */
        _timeout: -1,

        /**
         * TODO: broadcast from here to trigger the {gui.Guide}
         *
         * 1. Name all namespace members (toString methods and such)
         * 2. Resolve META tags that may configure namespaces properties
         * 3. Dispatch `DOMContentLoaded` event to hosting document
         */
        _ondom: function() {
            this._domloaded = true;
            gui.spacenames();
            this._metatags(gui.namespaces());
            doaction(gui.ACTION_DOC_ONDOMCONTENT, location.href);
        },

        /**
         * Dispatch `load` event to hosting document.
         */
        _onload: function() {
            if (!this._loaded) {
                this._loaded = true;
                if (gui.hosted) {
                    doaction(gui.ACTION_DOC_ONLOAD, location.href);
                }
            }
        },

        /**
         * Dispatch `unload` event to hosting document.
         */
        _onunload: function() {
            if (!this._domloaded) {
                this._domloaded = true;
                if (gui.hosted) {
                    doaction(gui.ACTION_DOC_UNLOAD, location.href);
                }
            }
        },

        /**
         * Dispatch `hashchange` status to hosting document.
         */
        _onhashchange: function() {
            if (gui.hosted) {
                doaction(gui.ACTION_DOC_ONHASH, location.hash);
            }
        },

        /**
         * Dispatch global broadcasts on selected mouse events
         * (close that menu when the user clicks that iframe).
         * @param {Event} e
         */
        _onmouseevent: function(e) {
            gui.broadcastGlobal(({
                "click": gui.BROADCAST_MOUSECLICK,
                "mousedown": gui.BROADCAST_MOUSEDOWN,
                "mouseup": gui.BROADCAST_MOUSEUP
            })[e.type], gui.$contextid);
        },

        /**
         * Intensive resize procedures should subscribe
         * to the resize-end message as broadcasted here.
         */
        _onresize: function() {
            if (!gui.hosted) {
                clearTimeout(this._timeout);
                this._timeout = setTimeout(function() {
                    gui.broadcastGlobal(gui.BROADCAST_RESIZE_END);
                }, gui.TIMEOUT_RESIZE_END);
            }
        },

        /**
         * Device orientation changed.
         * TODO: gui.Device of some sorts?
         */
        _onrotate: function() {
            if (!gui.hosted) {
                gui.orientation = window.innerWidth > window.innerHeight ? 1 : 0;
                gui.broadcastGlobal(gui.BROADCAST_ORIENTATIONCHANGE, gui.orientation);
            }
        },

        /**
         * Resolve metatags that appear to 
         * configure stuff in namespaces.
         * @param {Array<string>} spaces
         */
        _metatags: function(spaces) {
            var prop, def, metas = document.querySelectorAll('meta[name][content]');
            Array.forEach(metas, function(meta) {
                prop = meta.getAttribute('name');
                spaces.forEach(function(ns) {
                    if (prop.startsWith(ns + '.')) {
                        def = gui.Object.lookup(prop);
                        if (gui.Type.isDefined(def)) {
                            gui.Object.assert(prop,
                                gui.Type.cast(meta.getAttribute('content'))
                            );
                        } else {
                            console.error('No definition for "' + prop + '"');
                        }
                    }
                });
            });
        }

    });

}());

/**
 * TODO: This elsehow, but in a way that allows the
 * gui.Document implementation to be configurable.
 */
(function temphackingit() {
    gui.document = new gui.Document();
}());



/**
 * Base constructor for all spirits.
 * TODO: Implement `dispose` method.
 */
gui.Spirit = gui.Class.create(Object.prototype, {

    /**
     * Unique key for this spirit instance.
     * @TODO: Uppercase to imply read-only.
     * @type {String}
     */
    $instanceid: null,

    /**
     * Matches the property `$contextid` of the local `gui` object.
     * TODO: rename this property
     * TODO: perhapse deprecate?
     * @type {String}
     */
    $contextid: null,

    /**
     * @type {boolean}
     */
    $destructed: false,

    /**
     * Spirit element.
     * @type {Element}
     */
    element: null,

    /**
     * Containing document.
     * @type {Document}
     */
    document: null,

    /**
     * Containing window.
     * @type {Window}
     */
    window: null,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Spirit]";
    },


    // Sync lifecycle ............................................................

    /**
     * You can safely overload or overwrite methods in the lifecycle section,
     * but you should always leave it to the {gui.Guide} to invoke them. 
     * Make sure to always call `this._super.method()` unless you really mean it.
     */

    /**
     * `onconstruct` gets called when the spirit is newed up. Spirit
     * element may not be positioned in the document DOM at this point.
     */
    onconstruct: function() {},

    /**
     * `onconfigure` gets callend immediately after construction. This
     * instructs the spirit to parse configuration attributes in markup.
     * @see {gui.ConfigPlugin}
     */
    onconfigure: function() {},

    /**
     * `onenter` gets called when the spirit element is first 
     * encounted in the page DOM. This is only called once in 
     * the lifecycle of a spirit (unlike `attach`, see below).
     */
    onenter: function() {},

    /**
     * `onattach` gets called whenever
     *
     * 1. The spirit element is attached to the document DOM by some guy
     * 2. The element is already in DOM when the page loads and the spirit 
     *    gets injected by the framework
     */
    onattach: function() {},

    /**
     * `onready` gets called (only once) when all descendant spirits 
     * are attached and ready. From a DOM tree perspective, this fires 
     * in reverse order, innermost first.
     */
    onready: function() {},

    /**
     * Experimental.
     */
    oninit: function() {},

    /**
     * `ondetach` gets callend whenever the spirit element is about to 
     * be detached from the DOM tree. Unless the element is appended 
     * somewhere else, this will schedule the spirit for destruction.
     */
    ondetach: function() {},

    /**
     * `onexit` gets if the spirit element has been *manually* detached 
     * and not re-attached in the same execution stack. Spirit is not 
     * positioned in the document DOM at this point.
     */
    onexit: function() {},

    /**
     * Invoked when spirit is about to be destroyed. Code your last wishes here.
     * Spirit element may not be positioned in the document DOM at this point.
     * @TODO: This method currently is NOT CALLED during window.unload, in
     * that case we skip directly to {gui.GreatSpirit}. Would be nice if the
     * spirit could eg. save stuff to localstorage at this point...
     */
    ondestruct: function() {},


    // Async lifecycle ...........................................................

    /**
     * Invoked some milliseconds after `onattach` to give the browser a repaint 
     * break. TODO: Should be evaluated after 'appendChild' to another position.
     */
    onasync: function() {},


    // Handlers ..................................................................

    /**	
     * Handle crawler (tell me more)
     * @param {gui.Crawler} crawler
     * @returns {number}
     */
    oncrawler: function(crawler) {},


    // Privileged ................................................................

    /**
     * Secret constructor invoked before `onconstruct`.
     * @param {Element} elm
     * @param {Document} doc
     * @param {Window} win
     * @param {String} sig
     */
    $onconstruct: function(elm, doc, win, sig) {
        this.element = elm;
        this.document = doc;
        this.window = win;
        this.$contextid = sig;
        gui.Spirit.$construct(this);
    },

    /**
     * Secret destructor invvoked after `ondestruct`.
     */
    $ondestruct: function() {},

    /**
     * Plug in the plugins. Lazy plugins will be newed up when needed.
     *
     * - {gui.LifePlugin} first
     * - {gui.ConfigPlugin} second
     * - bonus plugins galore
     *
     * @TODO: To preserve order, refactor plugins stack from object to array
     */
    $pluginplugins: function() {
        var Plugin, plugins = this.constructor.$plugins;
        this.life = new gui.LifePlugin(this);
        this.config = new gui.ConfigPlugin(this);
        Object.keys(plugins).filter(function(prefix) {
            return prefix !== "life" && prefix !== "config";
        }).sort().forEach(function(prefix) {
            Plugin = plugins[prefix];
            if ((this.life.plugins[prefix] = !Plugin.lazy)) {
                gui.Plugin.$assign(this, prefix, new Plugin(this));
            } else {
                gui.Plugin.$prepare(this, prefix, Plugin);
            }
        }, this);
    },

    /**
     * In debug mode, stamp the spirit constructor name onto the spirit element.
     * Square brackets indicate that the `gui` attribute was added by this method.
     * @param {boolean} constructing
     */
    $debug: function(constructing) {
        if (gui.debug) {
            var val, elm = this.element;
            var fix = gui.attributes[0]; // by default using `gui`
            if (constructing) {
                if (gui.attributes.every(function(f) {
                    return !elm.hasAttribute(f);
                })) {
                    val = "[" + this.constructor.$classname + "]";
                    elm.setAttribute(fix, val);
                }
            } else {
                val = elm.getAttribute(fix);
                if (val && val.startsWith("[")) {
                    elm.removeAttribute(fix);
                }
            }
        }
    }


}, { // Xstatic ................................................................

    /**
     * Portal spirit into iframes via the `gui.portal` method?
     * @see {ui#portal}
     * @type {boolean}
     */
    portals: true,

    /**
     * Create DOM element and associate gui.Spirit instance.
     * @param @optional {Document} doc
     * @returns {gui.Spirit}
     */
    summon: function(doc) {
        return this.possess((doc || document).createElement("div"));
    },

    /**
     * Associate gui.Spirit instance to DOM element.
     * @param {Element} element
     * @returns {gui.Spirit}
     */
    possess: function(element) {
        return gui.Guide.possess(element, this);
    },

    /**
     * Extends spirit and plugins (mutating plugins).
     * @TODO: validate that user isn't declaring non-primitives on the prototype 
     * @param {object} extension
     * @param {object} recurring
     * @param {object} statics
     * @returns {gui.Spirit}
     */
    extend: function() {
        var args = [],
            def, br = gui.Class.breakdown(arguments);
        ["name", "protos", "recurring", "statics"].forEach(function(key) {
            if ((def = br[key])) {
                args.push(def);
            }
        }, this);
        var C = gui.Class.extend.apply(this, args);
        C.$plugins = gui.Object.copy(this.$plugins);
        var b = gui.Class.breakdown(arguments);
        gui.Object.each(C.$plugins, function(prefix, plugin) {
            var def = b.protos[prefix];
            switch (gui.Type.of(def)) {
                case "object":
                    var mutant = plugin.extend(def);
                    C.plugin(prefix, mutant, true);
                    break;
                case "undefined":
                    break;
                default:
                    throw new TypeError(
                        C + ": Bad definition for " + prefix + ': ' + def
                    );
            }
        }, this);
        return C;
    },

    /**
     * Assign plugin to prefix, checking for naming collision. Prepared for
     * a scenario where spirits may have been declared before plugins load.
     * @param {String} prefix "att", "dom", "action", "event" etc
     * @param {function} plugin Constructor for plugin
     * @param @optional {boolean} override Disable collision detection
     */
    plugin: function(prefix, plugin, override) {
        var plugins = this.$plugins;
        var proto = this.prototype;
        if (!proto.hasOwnProperty(prefix) || proto.prefix === null || override) {
            if (!plugins[prefix] || override) {
                plugins[prefix] = plugin;
                proto.prefix = null;
                gui.Class.children(this, function(child) {
                    child.plugin(prefix, plugin, override); // recursing to descendants
                });
            }
        } else {
            console.error("Plugin naming crash in " + this + ": " + prefix);
        }
    },


    // Privileged ................................................................

    /**
     * Mapping plugin prefix to plugin constructor.
     * @type {Map<String,function>}
     */
    $plugins: Object.create(null)


}, { // Static .................................................................

    /**
     * Spirit construct gets called by the secret constructor `$onconstruct`.
     * @param {gui.Spirit} spirit
     */
    $construct: function(spirit) {
        spirit.$pluginplugins();
        spirit.$debug(true);
        spirit.life.constructed = true;
        spirit.onconstruct();
        spirit.life.dispatch(gui.LIFE_CONSTRUCT);
    },

    /**
     * Spirit configure.
     * @param {gui.Spirit} spirit
     */
    $configure: function(spirit) {
        spirit.config.configureall();
        spirit.life.configured = true;
        spirit.onconfigure();
        spirit.life.dispatch(gui.LIFE_CONFIGURE);
    },

    /**
     * Spirit enter.
     * @param {gui.Spirit} spirit
     */
    $enter: function(spirit) {
        spirit.window.gui.inside(spirit);
        spirit.life.entered = true;
        spirit.onenter();
        spirit.life.dispatch(gui.LIFE_ENTER);
    },

    /**
     * Spirit attach.
     * @param {gui.Spirit} spirit
     */
    $attach: function(spirit) {
        spirit.window.gui.inside(spirit);
        spirit.life.attached = true;
        spirit.onattach();
        spirit.life.dispatch(gui.LIFE_ATTACH);
    },

    /**
     * Spirit ready.
     * @param {gui.Spirit} spirit
     */
    $ready: function(spirit) {
        spirit.life.ready = true;
        spirit.onready();
        spirit.life.dispatch(gui.LIFE_READY);
    },

    /**
     * Spirit detach.
     * @param {gui.Spirit} spirit
     */
    $detach: function(spirit) {
        spirit.window.gui.outside(spirit);
        spirit.life.detached = true;
        spirit.life.visible = false;
        spirit.life.dispatch(gui.LIFE_DETACH);
        spirit.life.dispatch(gui.LIFE_INVISIBLE);
        spirit.ondetach();
    },

    /**
     * Spirit exit.
     * @param {gui.Spirit} spirit
     */
    $exit: function(spirit) {
        spirit.life.exited = true;
        spirit.life.dispatch(gui.LIFE_EXIT);
        spirit.onexit();
    },

    /**
     * Spirit async.
     * @TODO: This should be evaluated after `appendChild` to another position.
     * @param {gui.Spirit} spirit
     */
    $async: function(spirit) {
        spirit.life.async = true;
        spirit.onasync(); // TODO: life cycle stuff goes here
        spirit.life.dispatch(gui.LIFE_ASYNC);
    },

    /**
     * Spirit destruct.
     * @param {gui.Spirit} spirit
     */
    $destruct: function(spirit) {
        spirit.$debug(false);
        spirit.life.destructed = true;
        spirit.life.dispatch(gui.LIFE_DESTRUCT);
        spirit.ondestruct();
    },

    /**
     * Spirit dispose. This calls the secret destructor `$ondestruct`.
     * @see {gui.Spirit#$ondestruct}
     * @param {gui.Spirit} spirit
     */
    $dispose: function(spirit) {
        spirit.$ondestruct();
        spirit.$destructed = true;
        gui.destruct(spirit);
        gui.GreatSpirit.$meet(spirit);
    },

    /**
     * @TODO: Init that spirit (work in progress)
     * TODO: wait and done methods to support this
     * @param {gui.Spirit} spirit
     */
    $oninit: function(spirit) {
        spirit.life.initialized = true;
        spirit.life.dispatch("life-initialized");
        spirit.oninit();
    }

});



/**
 * Module base.
 */
gui.Module = gui.Class.create(Object.prototype, {

    /**
     * Plugins for all spirits.
     * @type {Map<String,gui.Plugin>}
     */
    plugin: null,

    /**
     * Mixins for all spirits.
     * @type {Map<String,function>}
     */
    mixin: null,

    /**
     * Channeling spirits to CSS selectors.
     * @type {Map<Array<Array<String,gui.Spirit>>}
     */
    channel: null,

    /**
     * Called immediately. Other modules may not be loaded yet.
     * @return {Window} context
     */
    oncontextinitialize: function(context) {},

    /**
     * Called before spirits kick in.
     * @return {Window} context
     */
    onbeforespiritualize: function(context) {},

    /**
     * Called after spirits kicked in.
     * @return {Window} context
     */
    onafterspiritualize: function(context) {},

    /**
     * TODO: support this
     * @param {Window} context
     */
    oncontextload: function(context) {},

    /**
     * TODO: support this
     * @param {Window} context
     */
    oncontextunload: function(context) {},


    // Secrets ........................................................

    /**
     * Secret constructor.
     *
     * 1. extend {gui.Spirit} with mixins
     * 2. inject plugins for (all) spirits
     * 3. channel spirits to CSS selectors
     * @param {Window} context
     */
    $onconstruct: function(context) {
        var base = context.gui.Spirit;
        ['channels', 'mixins', 'plugins'].forEach(function(x) {
            if (this[x]) {
                console.error('Deprecated API is deprecated: ' + x);
            }
        }, this);
        if (gui.Type.isObject(this.mixin)) {
            base.mixin(this.mixin);
        }
        if (gui.Type.isObject(this.plugin)) {
            gui.Object.each(this.plugin, function(prefix, plugin) {
                if (gui.Type.isDefined(plugin)) {
                    base.plugin(prefix, plugin);
                } else {
                    console.error("Undefined plugin for prefix: " + prefix);
                }
            });
        }
        if (gui.Type.isArray(this.channel)) {
            gui.channel(this.channel);
        }
        this.$setupcontext(context);
    },

    /**
     * Setup the context, once for every context the module has been portalled to.
     * @see {gui.Spiritual#portal}
     * @param {Window} context
     */
    $setupcontext: function(context) {
        var that = this;
        var msg1 = gui.BROADCAST_WILL_SPIRITUALIZE;
        var msg2 = gui.BROADCAST_DID_SPIRITUALIZE;
        if (this.oncontextinitialize) {
            this.oncontextinitialize(context);
        }
        gui.Broadcast.addGlobal([
            msg1,
            msg2
        ], {
            onbroadcast: function(b) {
                if (b.data === context.gui.$contextid) {
                    gui.Broadcast.removeGlobal(b.type, this);
                    switch (b.type) {
                        case msg1:
                            if (gui.Type.isFunction(that.onbeforespiritualize)) {
                                that.onbeforespiritualize(context);
                            }
                            break;
                        case msg2:
                            if (gui.Type.isFunction(that.onafterspiritualize)) {
                                that.onafterspiritualize(context);
                            }
                            break;
                    }
                }
            }
        });
    }

});



/**
 * Comment goes here.
 * @extends {gui.Plugin}
 */
gui.Tracker = gui.Plugin.extend({

    /**
     * Construction time.
     * @param {Spirit} spirit
     */
    onconstruct: function() {
        this._super.onconstruct();
        this._trackedtypes = Object.create(null);
        if (this.spirit) {
            this._sig = this.spirit.window.gui.$contextid;
        }
    },

    /**
     * Cleanup on destruction.
     */
    ondestruct: function() {
        this._super.ondestruct();
        gui.Object.each(this._trackedtypes, function(type, list) {
            list.slice().forEach(function(checks) {
                this._cleanup(type, checks);
            }, this);
        }, this);
    },

    /**
     * TODO: Toggle type(s).
     * @param {object} arg
     * @returns {gui.Tracker}
     */
    toggle: function(arg, checks) {
        console.error("TODO: SpiritTracker#toggle");
    },

    /**
     * Invokes `add` or `remove` according to first argument given.
     * The remaining arguments are applied to the method we invoke.
     * @param {boolean} on
     * @returns {gui.Tracker}
     */
    shift: function(on /*...rest */ ) {
        var rest = gui.Array.from(arguments).slice(1);
        if (on) {
            return this.add.apply(this, rest);
        } else {
            return this.remove.apply(this, rest);
        }
    },

    /**
     * Contains handlers for type(s)? Note that handlers might
     * assert criterias other than type in order to be invoked.
     * @param {object} arg
     * @returns {boolean}
     */
    contains: function(arg) {
        return gui.Array.make(arg).every(function(type) {
            return this._trackedtypes[type];
        }, this);
    },


    // Private .....................................................

    /**
     * Global mode? This doesn't nescessarily makes
     * sense for all {gui.Tracker} implementations.
     * @type {boolean}
     */
    _global: false,

    /**
     * Bookkeeping types and handlers.
     * @type {Map<String,Array<object>}
     */
    _trackedtypes: null,

    /**
     * Containing window's gui.$contextid.
     * @TODO: Get rid of it
     * @type {String}
     */
    _sig: null,

    /**
     * Execute operation in global mode. Note that sometimes it's still
     * needed to manually flip the '_global' flag back to 'false' in
     * order to avoid the mode leaking the into repeated (nested) calls.
     * @param {function} operation
     * @returns {object}
     */
    _globalize: function(operation) {
        this._global = true;
        var res = operation.call(this);
        this._global = false;
        return res;
    },

    /**
     * Can add type of given checks?
     * @param {String} type
     * @param {Array<object>} checks
     * @returns {boolean}
     */
    _addchecks: function(type, checks) {
        var result = false;
        var list = this._trackedtypes[type];
        if (!list) {
            list = this._trackedtypes[type] = [];
            result = true;
        } else {
            result = !this._haschecks(list, checks);
        }
        if (result && checks) {
            list.push(checks);
        }
        return result;
    },

    /**
     * Can remove type of given checks? If so, do it now.
     * @param {String} type
     * @param {Array<object>} checks
     * @returns {boolean}
     */
    _removechecks: function(type, checks) {
        var result = false;
        var list = this._trackedtypes[type];
        if (list) {
            var index = this._checksindex(list, checks);
            if (index > -1) {
                result = true;
                // TODO: this seems to not run when checks is none (undefined)!
                if (gui.Array.remove(list, index) === 0) {
                    delete this._trackedtypes[type];
                }
            }
        }
        return result;
    },

    /**
     * Has list for type AND given checks?
     * @param {String} type
     * @param {Array<object>} checks
     */
    _containschecks: function(type, checks) {
        var result = false;
        var list = this._trackedtypes[type];
        if (list) {
            result = !checks || this._haschecks(list, checks);
        }
        return result;
    },

    /**
     * Has checks indexed?
     * @param {Array<Array<object>>} list
     * @param {Array<object>} checks
     * @returns {boolean}
     */
    _haschecks: function(list, checks) {
        var result = !checks || false;
        if (!result) {
            list.every(function(a) {
                if (a.every(function(b, i) {
                    return b === checks[i];
                })) {
                    result = true;
                }
                return !result;
            });
        }
        return result;
    },

    /**
     * All checks removed?
     * @returns {boolean}
     */
    _hashandlers: function() {
        return Object.keys(this._trackedtypes).length > 0;
    },

    /**
     * Get index of checks.
     * @param {Array<Array<object>>} list
     * @param {Array<object>} checks
     * @returns {number}
     */
    _checksindex: function(list, checks) {
        var result = -1;
        list.every(function(a, index) {
            if (a.every(function(b, i) {
                return b === checks[i];
            })) {
                result = index;
            }
            return result === -1;
        });
        return result;
    },

    /**
     * Resolve single argument into array with one or more entries.
     * TODO: Deprecate this and simply use gui.Array#make
     * @param {Array<String>|String} arg
     * @returns {Array<String>}
     */
    _breakdown: function(arg) {
        return gui.Array.make(arg);
    },

    /**
     * Isolated for subclass to overwrite.
     * @param {String} type
     * @param {Array<object>} checks
     */
    _cleanup: function(type, checks) {
        if (this._removechecks(type, checks)) {
            // do cleanup here (perhaps overwrite all 
            // this to perform _removechecks elsewhere)
        }
    }

});



/** 
 * ActionPlugin.
 * @extends {gui.Tracker}
 * TODO: 'one' and 'oneGlobal' methods
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.ActionPlugin = (function using(confirmed, chained) {

    return gui.Tracker.extend({

        /**
         * Free slot for spirit to define any single type of action to dispatch.
         * @type {String}
         */
        type: null,

        /**
         * Free slot for spirit to define any single type of data to dispatch.
         * @type {Object}
         */
        data: null,

        /**
         * Add one or more action handlers.
         * @param {array|string} arg
         * @param @optional {object|function} handler
         * @returns {gui.ActionPlugin}
         */
        add: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.Action.IActionHandler, handler)) {
                    gui.Array.make(arg).forEach(function(type) {
                        this._addchecks(type, [handler, this._global]);
                    }, this);
                }
            })
        ),

        /**
         * Remove one or more action handlers.
         * @param {object} arg
         * @param @optional {object} handler
         * @returns {gui.ActionPlugin}
         */
        remove: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.Action.IActionHandler, handler)) {
                    gui.Array.make(arg).forEach(function(type) {
                        this._removechecks(type, [handler, this._global]);
                    }, this);
                }
            })
        ),

        /**
         * Add global action handler(s).
         * @param {object} arg
         * @param @optional {object} handler
         * @returns {gui.ActionPlugin}
         */
        addGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.add(arg, handler);
            });
        },

        /**
         * Remove global action handler(s).
         * @param {object} arg
         * @param @optional {object} handler
         * @returns {gui.ActionPlugin}
         */
        removeGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.remove(arg, handler);
            });
        },

        /**
         * Dispatch type(s) ascending by default.
         * @alias {gui.ActionPlugin#ascend}
         * @param {String} type
         * @param @optional {object} data
         * @param @optional {String} direction "ascend" or "descend"
         * @returns {gui.Action}
         *
        dispatch: confirmed("string", "(*)", "(string)")(
            function(type, data, direction) {
                var spirit = this.spirit;
                var global = this._global;
                this._global = false;
                direction = direction || "ascend";
                return gui.Action._dispatch(
                    spirit,
                    type,
                    data,
                    direction,
                    global
                );
            }
        ),

        /**
         * Dispatch type(s) ascending.
         * @alias {gui.ActionPlugin#dispatch}
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Action}
         *
        ascend: function(arg, data) {
            return this.dispatch(arg, data, "ascend");
        },

        /**
         * Dispatch type(s) descending.
         * @alias {gui.ActionPlugin#dispatch}
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Action}
         *
        descend: function(arg, data) {
            return this.dispatch(arg, data, "descend");
        },

        /**
         * Dispatch type(s) globally (ascending).
         * @param {object} arg
         * @param @optional {object} data
         * @param @optional {String} direction
         * @returns {gui.Action}
         *
        dispatchGlobal: function(arg, data) {
            return this._globalize(function() {
                return this.dispatch(arg, data);
            });
        },

        /**
         * Dispatch type(s) globally ascending.
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Action}
         *
        ascendGlobal: function(arg, data) {
            return this._globalize(function() {
                return this.ascend(arg, data);
            });
        },

        /**
         * Dispatch type(s) globally descending.
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Action}
         *
        descendGlobal: function(arg, data) {
            return this._globalize(function() {
                return this.descend(arg, data);
            });
        },
        */

        /**
         * Dispatch type(s) ascending.
         * @alias {gui.ActionPlugin#ascend}
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        dispatch: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.dispatch(this.spirit, type, data);
        }),

        /**
         * Dispatch type(s) ascending.
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        ascend: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.ascend(this.spirit, type, data);
        }),

        /**
         * Dispatch type(s) descending.
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        descend: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.descend(this.spirit, type, data);
        }),

        /**
         * Dispatch type(s) globally (ascending).
         * @alias {gui.ActionPlugin#ascendGlobal}
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        dispatchGlobal: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.dispatchGlobal(this.spirit, type, data);
        }),

        /**
         * Dispatch type(s) globally ascending.
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        ascendGlobal: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.ascendGlobal(this.spirit, type, data);
        }),

        /**
         * Dispatch type(s) globally descending.
         * @param {string} type
         * @param @optional {object} data
         * @returns {gui.Action}
         */
        descendGlobal: confirmed("string", "(*)")(function(type, data) {
            return gui.Action.descendGlobal(this.spirit, type, data);
        }),


        // Private .................................................................

        /**
         * Remove delegated handlers.
         * @overwrites {gui.Tracker#_cleanup}
         * @param {String} type
         * @param {Array<object>} checks
         */
        _cleanup: function(type, checks) {
            var handler = checks[0],
                global = checks[1];
            if (global) {
                this.removeGlobal(type, handler);
            } else {
                this.remove(type, handler);
            }
        },


        // Privileged ..............................................................

        /**
         * Flip to a mode where the spirit will handle it's own action. Corner case 
         * scenario: IframeSpirit watches an action while relaying the same action 
         * from another document context.
         * @type {boolean}
         */
        $handleownaction: false,

        /**
         * Handle action. If it matches listeners, the action will be
         * delegated to the spirit. Called by crawler in `gui.Action`.
         * @see {gui.Action#dispatch}
         * @param {gui.Action} action
         */
        $onaction: function(action) {
            var list = this._trackedtypes[action.type];
            if (list) {
                list.forEach(function(checks) {
                    var handler = checks[0];
                    var matches = checks[1] === action.global;
                    var hacking = handler === this.spirit && this.$handleownaction;
                    if (matches && (handler !== action.target || hacking)) {
                        handler.onaction(action);
                    }
                }, this);
            }
        }

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/**
 * Tracking broadcasts.
 * @extends {gui.Tracker}
 * @using {gui.Combo.chained}
 */
gui.BroadcastPlugin = (function using(chained, confirmed) {

    return gui.Tracker.extend({

        /**
         * Add one or more broadcast handlers.
         * @param {object} arg
         * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
         * @returns {gui.BroadcastPlugin}
         */
        add: confirmed("string|array")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                var sig = this._global ? null : this._sig;
                gui.Array.make(arg).forEach(function(type) {
                    if (this._addchecks(type, [handler, this._global])) {
                        if (this._global) {
                            gui.Broadcast.addGlobal(type, handler);
                        } else {
                            gui.Broadcast.add(type, handler, sig);
                        }
                    }
                }, this);
            })
        ),

        /**
         * Remove one or more broadcast handlers.
         * @param {object} arg
         * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
         * @returns {gui.BroadcastPlugin}
         */
        remove: confirmed("string|array")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                var sig = this._global ? null : this._sig;
                gui.Array.make(arg).forEach(function(type) {
                    if (this._removechecks(type, [handler, this._global])) {
                        if (this._global) {
                            gui.Broadcast.removeGlobal(type, handler);
                        } else {
                            gui.Broadcast.remove(type, handler, sig);
                        }
                    }
                }, this);
            })
        ),

        /**
         * Dispatch type(s).
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Broadcast}
         */
        dispatch: confirmed("string|array")(
            function(arg, data) {
                var result = null;
                var global = this._global;
                var sig = global ? null : this._sig;
                this._global = false;
                gui.Array.make(arg).forEach(function(type) {
                    gui.Broadcast.$target = this.spirit;
                    if (global) {
                        result = gui.Broadcast.dispatchGlobal(type, data);
                    } else {
                        result = gui.Broadcast.dispatch(type, data, sig);
                    }
                }, this);
                return result;
            }
        ),

        /**
         * Add handlers for global broadcast(s).
         * @param {object} arg
         * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
         * @returns {gui.BroadcastPlugin}
         */
        addGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.add(arg, handler);
            });
        },

        /**
         * Add handlers for global broadcast(s).
         * @param {object} arg
         * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
         * @returns {gui.BroadcastPlugin}
         */
        removeGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.remove(arg, handler);
            });
        },

        /**
         * @param {boolean} on
         * @param {object} arg
         * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
         */
        shiftGlobal: function(on, arg, handler) {
            return this._globalize(function() {
                return this.shift(on, arg, handler);
            });
        },

        /**
         * Dispatch type(s) globally.
         * @param {object} arg
         * @param @optional {object} data
         * @returns {gui.Broadcast}
         */
        dispatchGlobal: function(arg, data) {
            return this._globalize(function() {
                return this.dispatch(arg, data);
            });
        },
        

        // Private .................................................................

        /**
         * Remove delegated handlers.
         * @overwrites {gui.Tracker#_cleanup}
         * @param {String} type
         * @param {Array<object>} checks
         */
        _cleanup: function(type, checks) {
            var handler = checks[0],
                global = checks[1];
            if (global) {
                gui.Broadcast.removeGlobal(type, handler);
            } else {
                gui.Broadcast.remove(type, handler, this._sig);
            }
        }

    });

}(gui.Combo.chained, gui.Arguments.confirmed));



/**
 * Tracking timed events.
 * TODO: Global timed events.
 * @extends {gui.Tracker}
 * @using {gui.Combo.chained}
 */
gui.TickPlugin = (function using(chained) {

    return gui.Tracker.extend({

        /**
         * Add one or more tick handlers.
         * @param {object} arg
         * @param @optional {object} handler
         * @param @optional {boolean} one Remove handler after on tick of this type?
         * @returns {gui.TickPlugin}
         */
        add: chained(function(arg, handler, one) {
            handler = handler ? handler : this.spirit;
            if (gui.Interface.validate(gui.ITickHandler, handler)) {
                gui.Array.make(arg).forEach(function(type) {
                    if (this._addchecks(type, [handler, this._global])) {
                        this._add(type, handler, false);
                    }
                }, this);
            }
        }),

        /**
         * Remove one or more tick handlers.
         * @param {object} arg
         * @param @optional {object} handler implements
         *        ActionListener interface, defaults to spirit
         * @returns {gui.TickPlugin}
         */
        remove: chained(function(arg, handler) {
            handler = handler ? handler : this.spirit;
            if (gui.Interface.validate(gui.ITickHandler, handler)) {
                gui.Array.make(arg).forEach(function(type) {
                    if (this._removechecks(type, [handler, this._global])) {
                        this._remove(type, handler);
                    }
                }, this);
            }
        }),

        /**
         * Add handler for single tick of given type(s).
         * TODO: This on ALL trackers :)
         * @param {object} arg
         * @param @optional {object} handler
         * @returns {gui.TickPlugin}
         */
        one: chained(function(arg, handler) {
            this.add(arg, handler, true);
        }),

        /**
         * Execute action in next available tick.
         * TODO: Support cancellation
         * @param {function} action
         * @param @optional {object|function} thisp
         * @returns {gui.TickPlugin}
         */
        next: chained(function(action, thisp) {
            gui.Tick.next(action, thisp || this.spirit);
        }),

        /**
         * Execute action in next animation frame.
         * @param {function} action
         * @param @optional {object|function} thisp
         * @returns {gui.TickPlugin}
         * @returns {number}
         */
        nextFrame: function(action, thisp) {
            return gui.Tick.nextFrame(action, thisp || this.spirit);
        },

        /**
         * Cancel scheduled animation frame.
         * @param {number} n
         * @returns {gui.TickPlugin}
         */
        cancelFrame: chained(function(n) {
            gui.Tick.cancelFrame(n);
        }),

        /**
         * Schedule timeout.
         * @param {function} action
         * @param {number} time
         * @param @optional {object|function} thisp
         * @returns {number}
         */
        time: function(action, time, thisp) {
            return gui.Tick.time(action, time, thisp || this.spirit);
        },

        /**
         * Cancel scheduled timeout.
         * @param {number} n
         */
        cancelTime: chained(function(n) {
            gui.Tick.cancelTime(n);
        }),

        /**
         * Start tick of type.
         * @param {string} type
         */
        start: chained(function(type) {
            gui.Tick.start(type);
        }),

        /**
         * Stop tick of type. This will stop the tick for all
         * listeners, so perhaps you're looking for `remove`?
         * @param {string} type
         */
        stop: chained(function(type) {
            gui.Tick.stop(type);
        }),

        /**
         * Dispatch tick after given time.
         * @param {String} type
         * @param {number} time Milliseconds (zero is setImmediate)
         * @returns {gui.Tick}
         */
        dispatch: function(type, time) {
            return this._dispatch(type, time || 0);
        },


        // Private .................................................................

        /**
         * Global mode?
         * @type {boolean}
         */
        _global: false,

        /**
         * Add handler.
         * @param {String} type
         * @param {object|function} handler
         * @param {boolean} one
         */
        _add: function(type, handler, one) {
            var sig = this.spirit.$contextid;
            if (one) {
                if (this._global) {
                    gui.Tick.oneGlobal(type, handler);
                } else {
                    gui.Tick.one(type, handler, sig);
                }
            } else {
                if (this._global) {
                    gui.Tick.addGlobal(type, handler);
                } else {
                    gui.Tick.add(type, handler, sig);
                }
            }
        },

        /**
         * Remove handler.
         * @param {String} type
         * @param {object|function} handler
         */
        _remove: function(type, handler) {
            var sig = this.spirit.$contextid;
            if (this._global) {
                gui.Tick.removeGlobal(type, handler);
            } else {
                gui.Tick.remove(type, handler, sig);
            }
        },

        /**
         * Dispatch.
         * @param {String} type
         * @param @optional {number} time
         */
        _dispatch: function(type, time) {
            var tick, sig = this.spirit.$contextid;
            if (this._global) {
                tick = gui.Tick.dispatchGlobal(type, time);
            } else {
                tick = gui.Tick.dispatch(type, time, sig);
            }
            return tick;
        },

        /**
         * Remove delegated handlers.
         * @overwrites {gui.Tracker#_cleanup}
         * @param {String} type
         * @param {Array<object>} checks
         */
        _cleanup: function(type, checks) {
            var handler = checks[0];
            var bglobal = checks[1];
            if (this._remove(type, [handler])) {
                if (bglobal) {
                    gui.Tick.removeGlobal(type, handler);
                } else {
                    gui.Tick.remove(type, handler, this.$contextid);
                }
            }
        }
    });

}(gui.Combo.chained));



/**
 * Interface TickHandler.
 */
gui.ITickHandler = {

    /** 
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object ITickHandler]";
    },

    /**
     * Handle tick.
     * @param {gui.Tick} tick
     */
    ontick: function(tick) {}
};



/**
 * SpiritLife is a non-bubbling event type that covers the life cycle of a spirit.
 * @see {gui.LifePlugin}
 * @param {gui.Spirit} target
 * @param {String} type
 */
gui.Life = function Life(target, type) {
    this.target = target;
    this.type = type;
};

gui.Life.prototype = {

    /**
     * @type {gui.Spirit}
     */
    target: null,

    /**
     * @type {String}
     */
    type: null,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Life]";
    }
};



/**
 * Tracking spirit life cycle events.
 * TODO: Support optional data argument
 * @extends {gui.Tracker}
 */
gui.LifePlugin = gui.Tracker.extend({

    /**
     * Spirit is constructed? This is almost certainly true by
     * the time you address the spirit.
     * @type {boolean}
     */
    constructed: false,

    /**
     * Spirit is configured?
     * @type {boolean}
     */
    configured: false,

    /**
     * Is now or has ever been in page DOM?
     * @type {boolean}
     */
    entered: false,

    /**
     * Is currently located in page DOM?
     * False whenever detached is true.
     * @TODO: make udefined on startup
     * @type {boolean}
     */
    attached: false,

    /**
     * Is currently not located in page DOM? Note that this is initially
     * true until the spirit has been discovered and registered as attached.
     * @TODO: make udefined on startup
     * @type {boolean}
     */
    detached: true,

    /**
     * Is ready? If so, it implies that all descendant spirits are also ready.
     * @type {boolean}
     */
    ready: false,

    /**
     * Is after whatever happens roughly 4 milliseconds after 'ready'?
     * @type {boolean}
     */
    async: false,

    /**
     * Spirit was in page DOM, but has now been removed (ie. it was
     * detached and not re-attached in the same execution stack).
     * This schedules the spirit for destruction.
     * @type {boolean}
     */
    exited: false,

    /**
     * Is destructed? If true, don't try anything funny.
     * @type {boolean}
     */
    destructed: false,

    /**
     * Is visible?
     * @type {boolean}
     */
    visible: undefined,

    /**
     * Is rendered? Belongs to edb.module really...
     * TODO: Move this to the edb module, really.
     */
    rendered: false,

    /**
     * Mapping plugin prefix to initialized status, 'false'
     * is a lazy plugin that has not yet been constructed.
     * @type {[type]}
     */
    plugins: null,

    /**
     * Construction time.
     * @overrides {gui.Tracker#construct}
     */
    onconstruct: function() {
        this._super.onconstruct();
        this._handlers = Object.create(null);
        this.plugins = Object.create(null);
    },

    /**
     * Add one or more action handlers.
     * @param {object} arg
     * @param @optional {object} handler implements LifeListener 
     * interface, defaults to this.spirit
     * @returns {gui.Spirit}
     */
    add: function(arg, handler) {
        handler = handler ? handler : this.spirit;
        gui.Array.make(arg).forEach(function(type) {
            if (this._addchecks(type, [handler])) {
                if (!this._handlers[type]) {
                    this._handlers[type] = [];
                }
                this._handlers[type].push(handler);
            }
        }, this);
        return this.spirit;
    },

    /**
     * Remove one or more action handlers.
     * @param {object} arg
     * @param @optional {object} handler implements LifeListener 
     * interface, defaults to spirit
     * @returns {gui.Spirit}
     */
    remove: function(arg, handler) {
        handler = handler ? handler : this.spirit;
        gui.Array.make(arg).forEach(function(type) {
            if (this._removechecks(type, [handler])) {
                if (this._handlers[type]) { // weirdo Gecko condition...
                    var index = this._handlers[type].indexOf(type);
                    gui.Array.remove(this._handlers[type], index);
                    if (this._handlers[type].length === 0) {
                        delete this._handlers[type];
                    }
                }
            }
        }, this);
        return this.spirit;
    },

    /**
     * Dispatch type and cleanup handlers for 
     * life cycle events that only occurs once.
     * TODO: support optional data argument
     * @param {String} type
     */
    dispatch: function(type) {
        var list = this._handlers[type];
        if (list) {
            var life = new gui.Life(this.spirit, type);
            list.forEach(function(handler) {
                handler.onlife(life);
            });
            switch (type) {
                case gui.LIFE_CONSTRUCT:
                case gui.LIFE_CONFIGURE:
                case gui.LIFE_ENTER:
                case gui.LIFE_READY:
                case gui.LIFE_DETACH:
                case gui.LIFE_EXIT:
                case gui.LIFE_DESTRUCT:
                    delete this._handlers[type];
                    break;
            }
        }
    },

    /**
     * TODO: move declaration to super or something (?)
     * @type {Map<String,Array<object>}
     */
    _handlers: null,

    /**
     * Cleanup.
     */
    _cleanup: function(type, checks) {
        var handler = checks[0];
        this.remove(type, handler);
    }

});



/**
 * Configures a spirit by attribute parsing.
 * TODO: Evaluate properties onconfigure; evaluate methods later.
 * @extends {gui.Plugin}
 */
gui.ConfigPlugin = gui.Plugin.extend({

    /**
     * Invoked by the {gui.Spirit} once all plugins have been plugged in.
     *
     * - Simple properties (booleans etc) will run at {gui.Spirit#onconfigure}
     * - Methods calls of any kind will be invoked at {gui.Spirit#onready}
     *
     * TODO: Simple props with no setter does nothing when updated now.
     * Perhaps it would be possible to somehow configure those *first*?
     * TODO: Figure out what the TODO above is supposed to mean
     */
    configureall: function() {
        var atts = this.spirit.element.attributes;
        Array.forEach(atts, function(att) {
            this.configureone(att.name, att.value);
        }, this);
    },

    /**
     * Evaluate method updates at {gui.Spirit#onready}.
     * @param {gui.Life} l
     */
    onlife: function(l) {
        var update;
        while ((update = this._onready.shift())) {
            update();
        }
    },

    /**
     * Setup configuration (if applicable) after an attribute update.
     * This should probably only ever be invoked by the {gui.AttPlugin}.
     * @param {String} name
     * @param {String} value
     */
    configureone: function(name, value) {
        var hit, gux = this.spirit.window.gui;
        gux.attributes.every(function(fix) {
            if ((hit = name.startsWith(fix + '.'))) {
                this._evaluate(name, value, fix);
            }
            return !hit;
        }, this);
    },


    // Private ...................................................................

    /**
     * Collecting method-type updates during spirit initialization.
     * @type {Array<function>}
     */
    _onready: null,

    /**
     * Evaluate single attribute in search for "gui." prefix.
     * The string value will be autocast to an inferred type.
     * "false" becomes a boolean while "23" becomes a number.
     * Note that the EDB module is *overriding* this method!
     * @param {String} name
     * @param {String} value
     * @param {String} fix
     */
    _evaluate: function(name, value, fix, later) {
        var struct = this.spirit,
            success = true,
            prop = null,
            cuts = null;
        name = prop = name.split(fix + ".")[1];
        if (name.indexOf(".") > -1) {
            cuts = name.split(".");
            cuts.forEach(function(cut, i) {
                if (gui.Type.isDefined(struct)) {
                    if (i < cuts.length - 1) {
                        struct = struct[cut];
                    } else {
                        prop = cut;
                    }
                } else {
                    success = false;
                }
            });
        }
        if (success && gui.Type.isDefined(struct[prop])) {
            this._schedule(struct, prop, this._revaluate(value));
        } else {
            console.error(
                "No definition for \"" + name +
                "\" in " + this.spirit.toString()
            );
        }
    },

    /**
     * Schedule update. Simple properties (strings, booleans, numbers) will be
     * updated during `onconfigure` while methods will be invoked at `onready`.
     * @param {object} struct What to update
     * @param {string} prop Property or method name
     * @param {object} value Property value or method argument
     */
    _schedule: function(struct, prop, value) {
        if (gui.Type.isFunction(struct[prop])) {
            if (this.spirit.life.ready) {
                struct[prop](value);
            } else {
                this.spirit.life.add(gui.LIFE_READY, this);
                this._onready = this._onready || [];
                this._onready.push(function() {
                    struct[prop](value);
                });
            }
        } else {
            struct[prop] = value;
        }
    },

    /**
     * Typecast the value.
     * TODO: Move the EDB hack into EDB module somehow.
     * @param {object} value
     * @returns {object}
     */
    _revaluate: function(value) {
        if (gui.Type.isString(value)) {
            // TODO: unhack this
            if (gui.hasModule('edb@wunderbyte.com') && value.startsWith('edb.$get')) {
                value = window.edb.$get(gui.KeyMaster.extractKey(value)[0]);
            } else {
                value = gui.Type.cast(value);
                if (gui.Type.isString(value)) {
                    value = this._jsonvaluate(value);
                }
            }
        }
        return value;
    },

    /**
     * JSONArray or JSONObject scrambled with encodeURIComponent?
     * If so, let's decode and parse this into an array or object.
     * @param {string} value
     * @returns {Array|Object>}
     */
    _jsonvaluate: function(value) {
        if ([
            ['%5B', '%5D'],
            ['%7B', '%7D']
        ].some(function isencoded(tokens) {
            return value.startsWith(tokens[0]) && value.endsWith(tokens[1]);
        })) {
            try {
                value = JSON.parse(decodeURIComponent(value));
            } catch (exception) {
                value = null;
                console.error(this + ': Bad JSON: ' + exception.message);
            }
        }
        return value;
    }


}, { // Static .................................................................

    /**
     * Run on spirit startup (don't wait for implementation to require it).
     * @type {boolean}
     */
    lazy: false

});



/**
 * Attribute wrapper.
 * @param {String} name
 * @param {String} value
 */
gui.Att = function Att(name, value) {
    this.value = gui.Type.cast(value);
    this.name = this.type = name;
};

gui.Att.prototype = {

    /**
     * Attribute name.
     * @type {String}
     */
    name: null,

    /**
     * Alias 'name' to conform the API with events, broadcasts, actions etc.
     * @type {String}
     */
    type: null,

    /**
     * Attribute value will be cast to an inferred type, eg. "false" becomes
     * boolean and "23" becomes number. When handling an attribute, 'null'
     * implies that the attribute WILL be deleted (it happens after 'onatt').
     * TODO: look into deleting the attribute first
     * @type {String|number|boolean|null}
     */
    value: null
};



/**
 * Manipulate DOM attributes and observe attribute changes.
 * TODO: special support for 'disabled' (and friends)
 * @extends {gui.Tracker}
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.AttPlugin = (function using(confirmed, chained) {

    return gui.Tracker.extend({

        /**
         * Get single element attribute cast to an inferred type.
         * @param {String} att
         * @returns {String|number|boolean} Autoconverted
         */
        get: function(name) {
            return gui.AttPlugin.get(this.spirit.element, name);
        },

        /**
         * Set single element attribute (use null to remove).
         * @param {String} name
         * @param {String|number|boolean} value
         * @returns {gui.AttPlugin}
         */
        set: chained(function(name, value) {
            if (!this.$suspended) {
                gui.AttPlugin.set(this.spirit.element, name, value);
            }
        }),

        /**
         * Element has attribute?
         * @param {String|number|boolean} att
         * @returns {boolean}
         */
        has: function(name) {
            return gui.AttPlugin.has(this.spirit.element, name);
        },

        /**
         * Remove element attribute.
         * @TODO: Rename "remove" ???
         * @param {String} att
         * @returns {gui.AttPlugin}
         */
        del: chained(function(name) {
            if (!this.$suspended) {
                gui.AttPlugin.del(this.spirit.element, name);
            }
        }),

        /**
         * Collect attributes as an array (of DOMAttributes).
         * @returns {Array<Attr>}
         */
        all: function() {
            return gui.AttPlugin.all(this.spirit.element);
        },

        /**
         * Set attribute or remove the attribute alltogether.
         * @param {boolean} on
         * @param {string} name
         * @param {string|number|boolean} value
         * @returns {gui.AttPlugin}
         */
        shift: confirmed("boolean", "string")(
            chained(function(on, name, value) {
                if (on) {
                    if (value !== undefined) {
                        this.set(name, value);
                    } else {
                        throw new TypeError('Missing value for "' + name + '"');
                    }
                } else {
                    this.del(name);
                }
            })
        ),

        /**
         * Get all attributes as hashmap type object.
         * Values are converted to an inferred type.
         * @returns {Map<String,String>}
         */
        getmap: function() {
            return gui.AttPlugin.getmap(this.spirit.element);
        },

        /**
         * Invoke multiple attributes update via hashmap
         * argument. Use null value to remove an attribute.
         * @param {Map<String,String>}
         */
        setmap: function(map) {
            gui.AttPlugin.setmap(this.spirit.element, map);
        },

        /**
         * Add one or more attribute listeners.
         * @param {array|string} arg
         * @param @optional {object|function} handler
         * @returns {gui.AttPlugin}
         */
        add: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.IAttHandler, handler)) {
                    gui.Array.make(arg).forEach(function(type) {
                        this._addchecks(type, [handler]);
                        this._onadd(type);
                    }, this);
                }
            })
        ),

        /**
         * Remove one or more attribute listeners.
         * @param {object} arg
         * @param @optional {object} handler
         * @returns {gui.AttPlugin}
         */
        remove: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.IAttHandler, handler)) {
                    gui.Array.make(arg).forEach(function(type) {
                        this._removechecks(type, [handler]);
                    }, this);
                }
            })
        ),


        // Privileged ..............................................................

        /**
         * Attribute updates disabled?
         * @type {boolean}
         */
        $suspended: false,

        /**
         * Suspend attribute updates for the duration of the
         * action. This to prevent endless attribute updates.
         * @param {function} action
         * @retruns {object}
         */
        $suspend: function(action) {
            this.$suspended = true;
            var res = action();
            this.$suspended = false;
            return res;
        },

        /**
         * Trigger potential handlers for attribute update.
         * @param {String} name
         * @param {String} value
         */
        $onatt: function(name, value) {
            var list, att, handler, trigger;
            var triggers = !gui.attributes.every(function(prefix) {
                if ((trigger = name.startsWith(prefix))) {
                    this.spirit.config.configureone(name, value);
                }
                return !trigger;
            }, this);
            if (!triggers && (list = this._trackedtypes[name])) {
                att = new gui.Att(name, value);
                list.forEach(function(checks) {
                    handler = checks[0];
                    handler.onatt(att);
                }, this);
            }
        },


        // Private .................................................................

        /**
         * Resolve attribute listeners immediately when added.
         * @param {String} name
         */
        _onadd: function(name) {
            if (this.has(name)) {
                var value = this.get(name);
                if (name.startsWith(gui.ConfigPlugin.PREFIX)) {
                    this.spirit.config.configureone(name, value);
                } else {
                    this.$onatt(name, value);
                }
            }
        }

        
    }, {}, { // Static ...........................................................

        /**
         * Get single element attribute cast to an inferred type.
         * @param {Element} elm
         * @param {String} att
         * @returns {object} String, boolean or number
         */
        get: function(elm, name) {
            return gui.Type.cast(elm.getAttribute(name));
        },

        /**
         * Set single element attribute (use null to remove).
         * @param {Element} elm
         * @param {String} name
         * @param {String} value
         * @returns {function}
         */
        set: chained(function(elm, name, value) {
            var spirit = elm.spirit;
            var change = false;
            // checkbox or radio?
            if (this._ischecked(elm, name)) {
                change = elm.checked !== value;
                elm.checked = String(value) === "false" ? false : value !== null;
                if (change) {
                    spirit.att.$onatt(name, value);
                }
                // input value?
            } else if (this._isvalue(elm, name)) {
                change = elm.value !== String(value);
                if (change) {
                    elm.value = String(value);
                    spirit.att.$onatt(name, value);
                }
                // deleted?
            } else if (value === null) {
                this.del(elm, name);
                // added or changed
            } else {
                value = String(value);
                if (elm.getAttribute(name) !== value) {
                    if (spirit) {
                        spirit.att.$suspend(function() {
                            elm.setAttribute(name, value);
                        });
                        spirit.att.$onatt(name, value);
                    } else {
                        elm.setAttribute(name, value);
                    }
                }
            }
        }),

        _ischecked: function(elm, name) {
            return elm.type && elm.checked !== undefined && name === "checked";
        },

        _isvalue: function(elm, name) {
            return elm.value !== undefined && name === "value";
        },

        /**
         * Element has attribute?
         * @param {Element} elm
         * @param {String} name
         * @returns {boolean}
         */
        has: function(elm, name) {
            return elm.hasAttribute(name);
        },

        /**
         * Remove element attribute.
         * @param {Element} elm
         * @param {String} att
         * @returns {function}
         */
        del: chained(function(elm, name) {
            var spirit = elm.spirit;
            if (this._ischecked(elm, name)) {
                elm.checked = false;
            } else if (this._isvalue(elm, name)) {
                elm.value = ""; // or what?
            } else {
                if (spirit) {
                    spirit.att.$suspend(function() {
                        elm.removeAttribute(name);
                    });
                    if (!spirit.config.configureone(name, null)) {
                        spirit.att.$onatt(name, null);
                    }
                } else {
                    elm.removeAttribute(name);
                }
            }
        }),

        /**
         * Collect attributes as an array (of DOMAttributes).
         * @param {Element} elm
         * @returns {Array<Attr>}
         */
        all: function(elm) {
            return gui.Array.from(elm.attributes);
        },

        /**
         * Get all attributes as hashmap type object.
         * Values are converted to an inferred type.
         * @param {Element} elm
         * @returns {Map<String,String>}
         */
        getmap: function(elm) {
            var map = Object.create(null);
            this.all(elm).forEach(function(att) {
                map[att.name] = gui.Type.cast(att.value);
            });
            return map;
        },

        /**
         * Invoke multiple attributes update via hashmap
         * argument. Use null value to remove an attribute.
         * @param {Element} elm
         * @param {Map<String,String>}
         * @returns {function}
         */
        setmap: chained(function(elm, map) {
            gui.Object.each(map, function(name, value) {
                this.set(elm, name, value);
            }, this);
        })

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/**
 * Interface AttHandler.
 */
gui.IAttHandler = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object IAttHandler]";
    },

    /**
     * Handle attribute update.
     * @param {gui.Action} action
     */
    onatt: function(att) {}
};



/**
 * Spirit box object. Note that these are all properties, not methods.
 * @extends {gui.Plugin}
 * TODO: Support globalX, globalY, screenX, screenY
 */
gui.BoxPlugin = gui.Plugin.extend({

    width:   0, // width
    height:  0, // height
    localX:  0, // X relative to positioned ancestor
    localY:  0, // Y relative to positioned ancestor
    pageX:   0, // X relative to the full page (includes scrolling)
    pageY:   0, // Y telative to the full page (includes scrolling)	  
    clientX: 0, // X relative to the viewport (excludes scrolling)
    clientY: 0, // Y relative to the viewport (excludes scrolling)

    /**
     * Returns local scrolling element (hotfixed)
     * TODO: Fix this in gui.Client...
     * @returns {Element}
     */
    _scrollroot: function() {
        return (function(doc) {
            if (gui.Client.scrollRoot.localName === "html") {
                return doc.documentElement;
            } else {
                return doc.body;
            }
        }(this.spirit.document));
    }
});

Object.defineProperties(gui.BoxPlugin.prototype, {

    /**
     * Width.
     * @type {number}
     */
    width: {
        get: function() {
            return this.spirit.element.offsetWidth;
        }
    },

    /**
     * Height.
     * @type {number}
     */
    height: {
        get: function() {
            return this.spirit.element.offsetHeight;
        }
    },

    /**
     * X relative to positioned ancestor.
     * @type {number}
     */
    localX: {
        get: function() {
            return this.spirit.element.offsetLeft;
        }
    },

    /**
     * Y relative to positioned ancestor.
     * @type {number}
     */
    localY: {
        get: function() {
            return this.spirit.element.offsetTop;
        }
    },

    /**
     * X relative to the full page (includes scrolling).
     * TODO: IMPORTANT scrollroot must be local to context
     * @type {number}
     */
    pageX: {
        get: function() {
            return this.clientX + this._scrollroot().scrollLeft;
        }
    },

    /**
     * Y relative to the full page (includes scrolling).
     * TODO: IMPORTANT scrollroot must be local to context
     * @type {number}
     */
    pageY: {
        get: function() {
            return this.clientY + this._scrollroot().scrollTop;
        }
    },

    /**
     * X relative to the viewport (excludes scrolling).
     * @type {number}
     */
    clientX: {
        get: function() {
            return this.spirit.element.getBoundingClientRect().left;
        }
    },

    /**
     * Y relative to the viewport (excludes scrolling).
     * @type {number}
     */
    clientY: {
        get: function() {
            return this.spirit.element.getBoundingClientRect().top;
        }
    }
});



/**
 * Spirit styling studio.
 * @extends {gui.Plugin}
 * @using {gui.Combo.chained}
 * @using {gui.Arguments.confirmed}
 */
gui.CSSPlugin = (function using(chained, confirmed) {

    return gui.Plugin.extend({

        /**
         * Add classname(s).
         * @param {string|Array<string>} name
         * @returns {gui.CSSPlugin}
         */
        add: confirmed("string|array")(chained(function(name) {
            var elm = this.spirit.element;
            gui.Array.make(name).forEach(function(n) {
                gui.CSSPlugin.add(elm, n);
            });
        })),

        /**
         * Remove classname(s).
         * @param {String} name
         * @returns {gui.CSSPlugin}
         */
        remove: confirmed("string|array")(chained(function(name) {
            var elm = this.spirit.element;
            gui.Array.make(name).forEach(function(n) {
                gui.CSSPlugin.remove(elm, n);
            });
        })),

        /**
         * Toggle classname(s).
         * @param {String} name
         * @returns {gui.CSSPlugin}
         */
        toggle: confirmed("string|array")(chained(function(name) {
            var elm = this.spirit.element;
            gui.Array.make(name).forEach(function(n) {
                gui.CSSPlugin.toggle(elm, n);
            });
        })),

        /**
         * Add or remove classname(s) according to first argument.
         * @param {boolean} on
         * @param {String} name
         * @returns {gui.CSSPlugin}
         */
        shift: confirmed("boolean", "string|array")(chained(function(on, name) {
            var elm = this.spirit.element;
            gui.Array.make(name).forEach(function(n) {
                gui.CSSPlugin.shift(elm, on, n);
            });
        })),

        /**
         * Contains classname?
         * @param {String} name
         * @returns {boolean}
         */
        contains: confirmed("string")(function(name) {
            return gui.CSSPlugin.contains(this.spirit.element, name);
        }),

        /**
         * Set single element.style.
         * @param {String} prop
         * @param {String} val
         * @returns {gui.CSSPlugin}
         */
        set: chained(function(prop, val) {
            gui.CSSPlugin.set(this.spirit.element, prop, val);
        }),

        /**
         * Set multiple styles via key value map.
         * @param {Map<String,String>} map
         * @returns {gui.CSSPlugin}
         */
        style: chained(function(map) {
            gui.CSSPlugin.style(this.spirit.element, map);
        }),

        /**
         * Get single element.style; see also compute method.
         * @param {String} prop
         * @returns {String}
         */
        get: function(prop) {
            return gui.CSSPlugin.get(this.spirit.element, prop);
        },

        /**
         * Compute runtime style.
         * @param {String} prop
         * @returns {String}
         */
        compute: function(prop) {
            return gui.CSSPlugin.compute(this.spirit.element, prop);
        },

        /**
         * Get or set (full) className.
         * @param @optional {String} name
         * @returns {String|gui.CSSPlugin}
         */
        name: chained(function(name) {
            var result = this.spirit.element.className;
            if (name !== undefined) {
                this.spirit.element.className = name;
                result = this.spirit;
            }
            return result;
        }),

        /**
         * Spirit element mathes selector?
         * @TODO: move to gui.DOMPlugin!
         * @param {String} selector
         * @returns {boolean}
         */
        matches: function(selector) {
            return gui.CSSPlugin.matches(this.spirit.element, selector);
        }


    }, {}, { // Static ......................................................................

        /**
         * classList.add
         * @param {Element} element
         * @param {String} names
         * @returns {function}
         */
        add: chained(function(element, name) {
            if (gui.Type.isString(name)) {
                if (name.indexOf(" ") > -1) {
                    name = name.split(" ");
                }
                if (gui.Type.isArray(name)) {
                    name.forEach(function(n) {
                        this.add(element, n);
                    }, this);
                } else {
                    if (this._supports) {
                        element.classList.add(name);
                    } else {
                        var now = element.className.split(" ");
                        if (now.indexOf(name) === -1) {
                            now.push(name);
                            element.className = now.join(" ");
                        }
                    }
                }
            }
        }),

        /**
         * classList.remove
         * @param {Element} element
         * @param {String} name
         * @returns {function}
         */
        remove: chained(function(element, name) {
            if (gui.Type.isString(name)) {
                name = name || "";
                if (name.indexOf(" ") > -1) {
                    name = name.split(" ");
                }
                if (gui.Type.isArray(name)) {
                    name.forEach(function(n) {
                        this.remove(element, n);
                    }, this);
                } else {
                    if (this._supports) {
                        element.classList.remove(name);
                    } else {
                        var now = element.className.split(" ");
                        var idx = now.indexOf(name);
                        if (idx > -1) {
                            gui.Array.remove(now, idx);
                        }
                        element.className = now.join(" ");
                    }
                }
            }
        }),

        /**
         * classList.toggle
         * @param {Element} element
         * @param {String} name
         * @returns {function}
         */
        toggle: chained(function(element, name) {
            if (gui.Type.isString(name)) {
                if (this._supports) {
                    element.classList.toggle(name);
                } else {
                    if (this.contains(element, name)) {
                        this.remove(element, name);
                    } else {
                        this.add(element, name);
                    }
                }
            }
        }),

        /**
         * Add or remove classname according to second argument.
         * @param {Element} element
         * @param {boolean} on
         * @param {String} name
         * @returns {function}
         */
        shift: chained(function(element, on, name) {
            if (gui.Type.isBoolean(on)) {
                if (on) {
                    this.add(element, name);
                } else {
                    this.remove(element, name);
                }
            } else {
                console.error("Deprecated API is deprecated");
            }
        }),

        /**
         * classList.contains
         * @param {Element} element
         * @param {String} name
         * @returns {boolean}
         */
        contains: function(element, name) {
            if (this._supports) {
                return element.classList.contains(name);
            } else {
                var classnames = element.className.split(" ");
                return classnames.indexOf(name) > -1;
            }
        },

        /**
         * Set single CSS property. Use style() for multiple properties.
         * TODO: also automate shorthands such as "10px 20px 10px 20px"
         * @param {Element}
         * @param {String} prop
         * @returns {function}
         */
        set: chained(function(element, prop, value) {
            if (gui.Type.isNumber(value)) {
                value = (this._shorthands[prop] || "@").replace("@", value);
            }
            value = String(value);
            if (prop === "float") {
                prop = "cssFloat";
            } else {
                value = this.jsvalue(value);
                prop = this.jsproperty(prop);
            }
            element.style[prop] = value;
        }),

        /**
         * TODO: Get element.style property; if this has been set.
         * Not to be confused with compute() for computedStyle!!!
         * @param {Element}
         * @param {String} prop
         * @returns {String}
         */
        get: function(element, prop) {
            prop = this.jsproperty(prop);
            return this.jsvalue(element.style[prop]);
        },

        /**
         * Set multiple element.style properties via hashmap. Note that
         * this method returns the element (ie. it is not chainable).
         * @param {Element|gui.Spirit} thing Spirit or element.
         * @param {Map<String,String>} styles
         * @returns {Element|gui.Spirit}
         */
        style: function(thing, styles) {
            var element = thing instanceof gui.Spirit ? thing.element : thing;
            gui.Object.each(styles, function(prop, value) {
                this.set(element, prop, value);
            }, this);
            return thing;
        },

        /**
         * Compute runtime style.
         * @param {object} thing Spirit or element.
         * @param {String} prop
         * @returns {String}
         */
        compute: function(thing, prop) {
            var element = thing instanceof gui.Spirit ? thing.element : thing;
            var doc = element.ownerDocument,
                win = doc.defaultView;
            prop = this._standardcase(this.jsproperty(prop));
            return win.getComputedStyle(element, null).getPropertyValue(prop);
        },

        /**
         * Node matches CSS selector?
         * @param {Node} node
         * @param {String} selector
         * @returns {boolean}
         */
        matches: function(node, selector) {
            return node[this._matchmethod](selector);
        },

        /**
         * Normalize declaration property for use in element.style scenario.
         * @param {String} prop
         * @returns {String}
         */
        jsproperty: function(prop) {
            var vendors = this._vendors,
                fixt = prop;
            var element = document.documentElement;
            prop = String(prop);
            if (prop.startsWith("-beta-")) {
                vendors.every(function(vendor) {
                    var test = this._camelcase(prop.replace("-beta-", vendor));
                    if (element.style[test] !== undefined) {
                        fixt = test;
                        return false;
                    }
                    return true;
                }, this);
            } else {
                fixt = this._camelcase(fixt);
            }
            return fixt;
        },

        /**
         * Normalize declaration value for use in element.style scenario.
         * @param {String} value
         * @returns {String}
         */
        jsvalue: function(value) {
            var vendors = this._vendors;
            var element = document.documentElement;
            value = String(value);
            if (value && value.contains("-beta-")) {
                var parts = [];
                value.split(", ").forEach(function(part) {
                    if ((part = part.trim()).startsWith("-beta-")) {
                        vendors.every(function(vendor) {
                            var test = this._camelcase(part.replace("-beta-", vendor));
                            if (element.style[test] !== undefined) {
                                parts.push(part.replace("-beta-", vendor));
                                return false;
                            }
                            return true;
                        }, this);
                    } else {
                        parts.push(part);
                    }
                }, this);
                value = parts.join(",");
            }
            return value;
        },

        /**
         * Normalize declaration property for use in CSS text.
         * @param {String} prop
         * @returns {String}
         */
        cssproperty: function(prop) {
            return this._standardcase(this.jsproperty(prop));
        },

        /**
         * Normalize declaration value for use in CSS text.
         * @param {String} prop
         * @returns {String}
         */
        cssvalue: function(value) {
            return this._standardcase(this.jsvalue(value));
        },


        // Private statics ...................................................................... 

        /**
         * Non-matching vendors removed after first run. First entry
         * gets to stay since it represents the unprefixed property.
         * @type {Array<String>}
         */
        _vendors: ["", "-webkit-", "-moz-", "-ms-", "-o-"],

        /**
         * _supports Element.classList?
         * @type {boolean}
         */
        _supports: document.documentElement.classList !== undefined,

        /**
         * CamelCase string.
         * @param {String} string
         * @returns {String}
         */
        _camelcase: function(string) {
            return string.replace(/-([a-z])/ig, function(all, letter) {
                return letter.toUpperCase();
            });
        },

        /**
         * standard-css-notate CamelCased string.
         * @param {String} string
         * @returns {String}
         */
        _standardcase: function(string) {
            return string.replace(/[A-Z]/g, function(all, letter) {
                return "-" + string.charAt(letter).toLowerCase();
            });
        },

        /**
         * Setter shorthands will autosuffix properties that require units
         * in support of the syntax: this.css.width = 300 (no method call)
         * TODO: add more properties
         * TODO: getters as well as setters
         * @type {Map<String,String>
         */
        _shorthands: {
            top: "@px",
            right: "@px",
            bottom: "@px",
            left: "@px",
            width: "@px",
            height: "@px",
            maxWidth: "@px",
            maxHeight: "@px",
            minWidth: "@px",
            minHeight: "@px",
            textIndent: "@px",
            margin: "@px",
            marginTop: "@px",
            marginRight: "@px",
            marginBottom: "@px",
            marginLeft: "@px",
            padding: "@px",
            paddingTop: "@px",
            paddingRight: "@px",
            paddingBottom: "@px",
            paddingLeft: "@px",
            fontWeight: "@",
            opacity: "@",
            zIndex: "@",
            position: "@",
            display: "@",
            visibility: "@"
        },

        /**
         * Lookup vendors "matchesSelector" method.
         * @type {String}
         */
        _matchmethod: (function() {
            var match = null,
                root = document.documentElement;
            [
                "mozMatchesSelector",
                "webkitMatchesSelector",
                "msMatchesSelector",
                "oMatchesSelector",
                "matchesSelector"
            ].every(function(method) {
                if (gui.Type.isDefined(root[method])) {
                    match = method;
                }
                return match === null;
            });
            return match;
        })()

    });

}(
    gui.Combo.chained,
    gui.Arguments.confirmed
));

/**
 * Generate shorthand getters/setters for top|left|width|height etc.
 */
(function shorthands() {
    function getset(prop) {
        Object.defineProperty(gui.CSSPlugin.prototype, prop, {
            enumerable: true,
            configurable: true,
            get: function get() {
                if (this.spirit) {
                    return parseInt(this.get(prop), 10);
                }
            },
            set: function set(val) {
                this.set(prop, val);
            }
        });
    }
    var shorts = gui.CSSPlugin._shorthands;
    for (var prop in shorts) {
        if (shorts.hasOwnProperty(prop)) {
            getset(prop);
        }
    }
})();



/**
 * DOM query and manipulation.
 * @extends {gui.Plugin}
 * TODO: add `prependTo` method
 * @using {gui.Combo#chained}
 * @using {gui.Guide}
 * @using {gui.Observer}
 */
gui.DOMPlugin = (function using(chained, guide, observer) {

    return gui.Plugin.extend({

        /**
         * Set or get element id.
         * @param @optional {String} id
         * @returns {String|gui.DOMPlugin}
         */
        id: chained(function(id) {
            if (id) {
                this.spirit.element.id = id;
            } else {
                return this.spirit.element.id || null;
            }
        }),

        /**
         * Get or set element title (tooltip).
         * @param @optional {String} title
         * @returns {String|gui.DOMPlugin}
         */
        title: chained(function(title) {
            var element = this.spirit.element;
            if (gui.Type.isDefined(title)) {
                element.title = title ? title : "";
            } else {
                return element.title;
            }
        }),

        /**
         * Get or set element markup.
         * @param @optional {String} html
         * @param @optional {String} position
         * @returns {String|gui.DOMPlugin}
         */
        html: chained(function(html, position) {
            return gui.DOMPlugin.html(this.spirit.element, html, position);
        }),

        /**
         * Get or set element outer markup.
         * @param @optional {String} html
         * @returns {String|gui.DOMPlugin}
         */
        outerHtml: chained(function(html) {
            return gui.DOMPlugin.outerHtml(this.spirit.element, html);
        }),

        /**
         * Get or set element textContent.
         * @param @optional {String} text
         * @returns {String|gui.DOMPlugin}
         */
        text: chained(function(text) {
            return gui.DOMPlugin.text(this.spirit.element, text);
        }),

        /**
         * Empty spirit subtree.
         * @returns {gui.DOMPlugin}
         */
        empty: chained(function() {
            this.html("");
        }),

        /**
         * Hide spirit element and mark as invisible. 
         * Adds the `._gui-hidden` classname.
         * @returns {gui.DOMPlugin}
         */
        hide: chained(function() {
            if (!this.spirit.css.contains(gui.CLASS_HIDDEN)) {
                this.spirit.css.add(gui.CLASS_HIDDEN);
                if (gui.hasModule("layout@wunderbyte.com")) { // TODO: - fix
                    if (this.spirit.visibility) { // some kind of Selenium corner case
                        this.spirit.visibility.off();
                    }
                }
            }
        }),

        /**
         * Show spirit element and mark as visible. 
         * Removes the `._gui-hidden` classname.
         * @returns {gui.DOMPlugin}
         */
        show: chained(function() {
            if (this.spirit.css.contains(gui.CLASS_HIDDEN)) {
                this.spirit.css.remove(gui.CLASS_HIDDEN);
                if (gui.hasModule("layout@wunderbyte.com")) {
                    if (this.spirit.visibility) { // some kind of Selenium corner case
                        this.spirit.visibility.on();
                    }
                }
            }
        }),

        /**
         * Get spirit element tagname (identicased with HTML).
         * @returns {String}
         */
        tag: function() {
            return this.spirit.element.localName;
        },

        /**
         * Is positioned in page DOM? Otherwise plausible
         * createElement or documentFragment scenario.
         * @returns {boolean}
         */
        embedded: function() {
            return gui.DOMPlugin.embedded(this.spirit.element);
        },

        /**
         * Removing this spirit from it's parent container. Note that this will
         * schedule destruction of the spirit unless it gets reinserted somewhere.
         * Also note that this method is called on the spirit, not on the parent.
         * @returns {object} Returns the argument
         */
        remove: function() {
            var parent = this.spirit.element.parentNode;
            parent.removeChild(this.spirit.element);
        },

        /**
         * Clone spirit element.
         * @return {Element}
         */
        clone: function() {
            return this.spirit.element.cloneNode(true);
        },

        /**
         * @returns {number}
         */
        ordinal: function() {
            return gui.DOMPlugin.ordinal(this.spirit.element);
        },

        /**
         * Compare the DOM position of this spirit against something else.
         * @see http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
         * @param {Element|gui.Spirit} other
         * @returns {number}
         */
        compare: function(other) {
            return gui.DOMPlugin.compare(this.spirit.element, other);
        },

        /**
         * Parse HTML to DOM node.
         * @param {string} html
         * @returns {Node}
         */
        parseToNode: function(html) {
            return gui.DOMPlugin.parseToNode(html);
        },

        /**
         * Parse HTML to array of DOM node(s).
         * @param {string} html
         * @returns {Node}
         */
        parseToNodes: function(html) {
            return gui.DOMPlugin.parseToNodes(html);
        }


    }, {}, { // Static ...........................................................

        /**
         * Spiritual-aware innerHTML (WebKit first aid).
         * @param {Element} elm
         * @param @optional {String} html
         * @param @optional {String} pos
         */
        html: function(elm, html, pos) {
            if (gui.Type.isString(html)) {
                if (pos) {
                    return elm.insertAdjacentHTML(pos, html);
                } else {
                    if (gui.mode === gui.MODE_ROBOT) {
                        gui.materializeSub(elm);
                        gui.suspend(function() {
                            elm.innerHTML = html;
                        });
                        gui.spiritualizeSub(elm);
                    } else {
                        elm.innerHTML = html;
                    }
                }
            } else {
                return elm.innerHTML;
            }
        },

        /**
         * Spiritual-aware outerHTML (WebKit first aid).
         * TODO: deprecate and support "replace" value for position?
         * TODO: can outerHTML carry multiple root-nodes?
         * @param {Element} elm
         * @param @optional {String} html
         */
        outerHtml: function(elm, html) {
            if (gui.Type.isString(html)) {
                if (gui.mode === gui.MODE_ROBOT) {
                    gui.materialize(elm);
                    gui.suspend(function() {
                        elm.outerHTML = html;
                    });
                    gui.spiritualize(elm);
                } else {
                    elm.outerHTML = html;
                }
            } else {
                return elm.outerHTML;
            }
        },

        /**
         * Spiritual-aware textContent (WebKit first aid).
         * @param {Element} elm
         * @param @optional {String} html
         * @param @optional {String} position
         */
        text: function(elm, text) {
            var guide = gui.Guide;
            if (gui.Type.isString(text)) {
                if (gui.mode === gui.MODE_ROBOT) {
                    guide.materializeSub(elm);
                    gui.suspend(function() {
                        elm.textContent = text;
                    });
                } else {
                    elm.textContent = text;
                }
            } else {
                return elm.textContent;
            }
        },

        /**
         * Get ordinal position of element within container.
         * @param {Element} element
         * @returns {number}
         */
        ordinal: function(element) {
            var result = 0;
            var parent = element.parentNode;
            if (parent) {
                var node = parent.firstElementChild;
                while (node) {
                    if (node === element) {
                        break;
                    } else {
                        node = node.nextElementSibling;
                        result++;
                    }
                }
            }
            return result;
        },

        /**
         * Compare document position of two nodes.
         * @see http://mdn.io/compareDocumentPosition
         * @param {Node|gui.Spirit} node1
         * @param {Node|gui.Spirit} node2
         * @returns {number}
         */
        compare: function(node1, node2) {
            node1 = node1 instanceof gui.Spirit ? node1.element : node1;
            node2 = node2 instanceof gui.Spirit ? node2.element : node2;
            return node1.compareDocumentPosition(node2);
        },

        /**
         * Node contains other node?
         * @param {Node|gui.Spirit} node
         * @param {Node|gui.Spirit} othernode
         * @returns {boolean}
         */
        contains: function(node, othernode) {
            var check = Node.DOCUMENT_POSITION_CONTAINS + Node.DOCUMENT_POSITION_PRECEDING;
            return this.compare(othernode, node) === check;
        },

        /**
         * Other node is a following sibling to node?
         * @param {Node|gui.Spirit} node
         * @param {Node|gui.Spirit} othernode
         * @returns {boolean}
         */
        follows: function(node, othernode) {
            return this.compare(othernode, node) === Node.DOCUMENT_POSITION_FOLLOWING;
        },

        /**
         * Other node is a preceding sibling to node?
         * @param {Node|gui.Spirit} node
         * @param {Node|gui.Spirit} othernode
         * @returns {boolean}
         */
        precedes: function(node, othernode) {
            return this.compare(othernode, node) === Node.DOCUMENT_POSITION_PRECEDING;
        },

        /**
         * Is node positioned in page DOM?
         * @param {Element|gui.Spirit} node
         * @returns {boolean}
         */
        embedded: function(node) {
            node = node instanceof gui.Spirit ? node.element : node;
            return this.contains(node.ownerDocument, node);
        },

        /**
         * Remove from list all nodes that are contained by others.
         * @param {Array<Element|gui.Spirit>} nodes
         * @returns {Array<Element|gui.Spirit>}
         */
        group: function(nodes) {
            var node, groups = [];

            function containedby(target, others) {
                return others.some(function(other) {
                    return gui.DOMPlugin.contains(other, target);
                });
            }
            while ((node = nodes.pop())) {
                if (!containedby(node, nodes)) {
                    groups.push(node);
                }
            }
            return groups;
        },

        /**
         * Get first element that matches a selector.
         * Optional type argument filters to spirit of type.
         * @param {Node} node
         * @param {String} selector
         * @param @optional {function} type
         * @returns {Element|gui.Spirit}
         */
        q: function(node, selector, type) {
            var result = null;
            return this._qualify(node, selector)(function(node, selector) {
                if (type) {
                    result = this.qall(node, selector, type)[0] || null;
                } else {
                    try {
                        result = node.querySelector(selector);
                    } catch (exception) {
                        console.error("Dysfunctional selector: " + selector);
                        throw exception;
                    }
                }
                return result;
            });
        },

        /**
         * Get list of all elements that matches a selector.
         * Optional type argument filters to spirits of type.
         * Method always returns a (potentially empty) array.
         * @param {Node} node
         * @param {String} selector
         * @param @optional {function} type
         * @returns {Array<Element|gui.Spirit>}
         */
        qall: function(node, selector, type) {
            var result = [];
            return this._qualify(node, selector)(function(node, selector) {
                result = gui.Array.from(node.querySelectorAll(selector));
                if (type) {
                    result = result.filter(function(el) {
                        return el.spirit && (el.spirit instanceof type);
                    }).map(function(el) {
                        return el.spirit;
                    });
                }
                return result;
            });
        },

        /**
         * Get first element in document that matches a selector.
         * Optional type argument filters to spirit of type.
         * @param {String} selector
         * @param @optional {function} type
         * @returns {Element|gui.Spirit}
         */
        qdoc: function(selector, type) {
            return this.q(document, selector, type);
        },

        /**
         * Get list of all elements in document that matches a selector.
         * Optional type argument filters to spirits of type.
         * Method always returns a (potentially empty) array.
         * @param {String} selector
         * @param @optional {function} type
         * @returns {Array<Element|gui.Spirit>}
         */
        qdocall: function(selector, type) {
            return this.qall(document, selector, type);
        },


        // Private static .........................................................

        /**
         * Support direct children selection using proprietary 'this' keyword
         * by temporarily assigning the element an ID and modifying the query.
         * @param {Node} node
         * @param {String} selector
         * @param {function} action
         * @returns {object}
         */
        _qualify: function(node, selector, action) {
            var hadid = true,
                id, regexp = this._thiskeyword;
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (regexp.test(selector)) {
                    hadid = node.id;
                    id = node.id = (node.id || gui.KeyMaster.generateKey());
                    selector = selector.replace(regexp, "#" + id);
                    node = node.ownerDocument;
                }
            }
            return function(action) {
                var res = action.call(gui.DOMPlugin, node, selector);
                if (!hadid) {
                    node.id = "";
                }
                return res;
            };
        },

        /**
         * Match custom 'this' keyword in CSS selector. You can start
         * selector expressions with "this>*" to find immediate child
         * TODO: skip 'this' and support simply ">*" and "+*" instead.
         * @type {RegExp}
         */
        _thiskeyword: /^this|,this/g

    });

}(
    gui.Combo.chained,
    gui.Guide,
    gui.Observer
));

/**
 * Bind the "this" keyword for all static methods.
 */
gui.Object.bindall(gui.DOMPlugin);

/**
 * DOM query methods accept a CSS selector and an optional spirit constructor
 * as arguments. They return a spirit, an element or an array of either.
 */
gui.DOMPlugin.mixin(
    gui.Object.map({

        /**
         * Get first descendant element matching selector. Optional type argument returns
         * spirit for first element to be associated to spirit of this type. Note that
         * this may not be the first element to match the selector. Also note that type
         * performs slower than betting on <code>this.dom.q ( "tagname" ).spirit</code>
         * @param {String} selector
         * @param @optional {function} type Spirit constructor (eg. gui.Spirit)
         * @returns {Element|gui.Spirit}
         */
        q: function(selector, type) {
            return gui.DOMPlugin.q(this.spirit.element, selector, type);
        },

        /**
         * Get list of all descendant elements that matches a selector. Optional type
         * arguments returns instead all associated spirits to match the given type.
         * @param {String} selector
         * @param @optional {function} type Spirit constructor
         * @returns {Array<Element|gui.Spirit>}
         */
        qall: function(selector, type) {
            return gui.DOMPlugin.qall(this.spirit.element, selector, type);
        },

        /**
         * Same as q, but scoped from the document root. Use wisely.
         * @param {String} selector
         * @param @optional {function} type Spirit constructor
         * returns {Element|gui.Spirit}
         */
        qdoc: function(selector, type) {
            return gui.DOMPlugin.qdoc(selector, type);
        },

        /**
         * Same as qall, but scoped from the document root. Use wisely.
         * @param {String} selector
         * @param @optional {function} type Spirit constructor
         * @returns {Array<Element|gui.Spirit>}
         */
        qdocall: function(selector, type) {
            return gui.DOMPlugin.qdocall(selector, type);
        }

    }, function(name, base) {
        return function() {
            var selector = arguments[0],
                type = arguments[1];
            if (gui.Type.isString(selector)) {
                if (arguments.length === 1 || gui.Type.isFunction(type)) {
                    return base.apply(this, arguments);
                } else {
                    type = gui.Type.of(type);
                    throw new TypeError("Unknown spirit for query: " + name + "(" + selector + "," + type + ")");
                }
            } else {
                throw new TypeError("Bad selector for query: " + name + "(" + selector + ")");
            }
        };
    })
);

/**
 * DOM navigation methods accept an optional spirit constructor as
 * argument. They return a spirit, an element or an array of either.
 */
gui.DOMPlugin.mixin(
    gui.Object.map({

        /**
         * Next element or next spirit of given type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        next: function(type) {
            var result = null,
                spirit = null,
                el = this.spirit.element;
            if (type) {
                while ((el = el.nextElementSibling) !== null) {
                    spirit = el.spirit;
                    if (spirit !== null && spirit instanceof type) {
                        result = spirit;
                        break;
                    }
                }
            } else {
                result = el.nextElementSibling;
            }
            return result;
        },

        /**
         * Previous element or previous spirit of given type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        previous: function(type) {
            var result = null,
                spirit = null,
                el = this.spirit.element;
            if (type) {
                while ((el = el.previousElementSibling) !== null) {
                    spirit = el.spirit;
                    if (spirit !== null && spirit instanceof type) {
                        result = spirit;
                        break;
                    }
                }
            } else {
                result = el.previousElementSibling;
            }
            return result;
        },

        /**
         * First element or first spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        first: function(type) {
            var result = null,
                spirit = null,
                el = this.spirit.element.firstElementChild;
            if (type) {
                while (result === null && el !== null) {
                    spirit = el.spirit;
                    if (spirit !== null && spirit instanceof type) {
                        result = spirit;
                    }
                    el = el.nextElementSibling;
                }
            } else {
                result = el;
            }
            return result;
        },

        /**
         * Last element or last spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        last: function(type) {
            var result = null,
                spirit = null,
                el = this.spirit.element.lastElementChild;
            if (type) {
                while (result === null && el !== null) {
                    spirit = el.spirit;
                    if (spirit !== null && spirit instanceof type) {
                        result = spirit;
                    }
                    el = el.previoustElementSibling;
                }
            } else {
                result = el;
            }
            return result;
        },

        /**
         * Parent parent or parent spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        parent: function(type) {
            var result = this.spirit.element.parentNode;
            if (type) {
                var spirit = result.spirit;
                if (spirit && spirit instanceof type) {
                    result = spirit;
                } else {
                    result = null;
                }
            }
            return result;
        },

        /**
         * Child element or child spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        child: function(type) {
            var result = this.spirit.element.firstElementChild;
            if (type) {
                result = this.children(type)[0] || null;
            }
            return result;
        },

        /**
         * Children elements or children spirits of type.
         * TODO: just use this.element.children :)
         * @param @optional {function} type Spirit constructor
         * @returns {Array<Element|gui.Spirit>}
         */
        children: function(type) {
            var result = gui.Array.from(this.spirit.element.children);
            if (type) {
                result = result.filter(function(elm) {
                    return elm.spirit && elm.spirit instanceof type;
                }).map(function(elm) {
                    return elm.spirit;
                });
            }
            return result;
        },

        /**
         * First ancestor element (parent!) or first ancestor spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        ancestor: function(type) {
            var result = this.parent();
            if (type) {
                result = null;
                new gui.Crawler().ascend(this.spirit.element, {
                    handleSpirit: function(spirit) {
                        if (spirit instanceof type) {
                            result = spirit;
                            return gui.Crawler.STOP;
                        }
                    }
                });
            }
            return result;
        },

        /**
         * First ancestor elements or ancestor spirits of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Array<Element|gui.Spirit>}
         */
        ancestors: function(type) {
            var result = [];
            var crawler = new gui.Crawler();
            if (type) {
                crawler.ascend(this.element, {
                    handleSpirit: function(spirit) {
                        if (spirit instanceof type) {
                            result.push(spirit);
                        }
                    }
                });
            } else {
                crawler.ascend(this.element, {
                    handleElement: function(el) {
                        result.push(el);
                    }
                });
            }
            return result;
        },

        /**
         * First descendant element (first child!) first descendant spirit of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Element|gui.Spirit}
         */
        descendant: function(type) {
            var result = this.child();
            var me = this.spirit.element;
            if (type) {
                new gui.Crawler().descend(me, {
                    handleSpirit: function(spirit) {
                        if (spirit instanceof type) {
                            if (spirit.element !== me) {
                                result = spirit;
                                return gui.Crawler.STOP;
                            }
                        }
                    }
                });
            }
            return result;
        },

        /**
         * All descendant elements or all descendant spirits of type.
         * @param @optional {function} type Spirit constructor
         * @returns {Array<Element|gui.Spirit>}
         */
        descendants: function(type) {
            var result = [];
            var me = this.spirit.element;
            new gui.Crawler().descend(me, {
                handleElement: function(element) {
                    if (!type && element !== me) {
                        result.push(element);
                    }
                },
                handleSpirit: function(spirit) {
                    if (type && spirit instanceof type) {
                        if (spirit.element !== me) {
                            result.push(spirit);
                        }
                    }
                }
            });
            return result;
        },

        /**
         * Get following sibling elements or spirits of type.
         * @param @optional {function} type
         * @returns {Array<element|gui.Spirit>}
         */
        following: function(type) {
            var result = [],
                spirit, el = this.spirit.element;
            while ((el = el.nextElementSibling)) {
                if (type && (spirit = el.spirit)) {
                    if (spirit instanceof type) {
                        result.push(spirit);
                    }
                } else {
                    result.push(el);
                }
            }
            return result;
        },

        /**
         * Get preceding sibling elements or spirits of type.
         * @param @optional {function} type
         * @returns {Array<element|gui.Spirit>}
         */
        preceding: function(type) {
            var result = [],
                spirit, el = this.spirit.element;
            while ((el = el.previousElementSibling)) {
                if (type && (spirit = el.spirit)) {
                    if (spirit instanceof type) {
                        result.push(spirit);
                    }
                } else {
                    result.push(el);
                }
            }
            return result;
        }

    }, function map(name, base) {
        return function(Type) {
            if (!gui.Type.isDefined(Type) || gui.Type.isFunction(Type)) {
                return base.apply(this, arguments);
            } else {
                throw new TypeError(
                    "Unknown spirit for query: " + name +
                    "(" + gui.Type.of(Type) + ")"
                );
            }
        };
    })
);

(function scoped() {

    /**
     * Make sure that DOM created by spirits is always
     * spiritualized disregarding current 'gui.mode'.
     * In robot mode, we'll let the system handle it.
     * @param {Element} el
     */
    function maybespiritualize(elm) {
        if (gui.mode !== gui.MODE_ROBOT) {
            gui.spiritualize(elm);
        }
    }

    /**
     * TODO: prependTo and friends...
     */
    gui.DOMPlugin.mixin({

        /**
         * Append spirit (element) to another spirit or element.
         * @param {object} thing
         * @returns {gui.DOMPlugin} or what?
         */
        appendTo: function(thing) {
            var elm = this.spirit.element;
            if (gui.Type.isSpirit(thing)) {
                thing.dom.append(elm);
            } else if (gui.Type.isElement(thing)) {
                thing.appendChild(elm);
                maybespiritualize(thing);
            }
            return this; // or what?
        },

        /**
         * Parse HTML to DOM node.
         * @param {string} html
         * @param @optional {Document} targetdoc
         * @returns {Node}
         */
        parseToNode: function(html, targetdoc) {
            return gui.HTMLParser.parseToNode(html, targetdoc);
        },

        /**
         * Parse HTML to array of DOM node(s).
         * @param {string} html
         * @param @optional {Document} targetdoc
         * @returns {Array<Node>}
         */
        parseToNodes: function(html, targetdoc) {
            return gui.HTMLParser.parseToNodes(html, targetdoc);
        },
    });

}());


/**
 * DOM insertion methods accept one argument: one spirit OR one element OR an array of either or both.
 * The input argument is returned as given. This allows for the following one-liner to be constructed:
 * this.something = this.dom.append ( gui.SomeThingSpirit.summon ( this.document )); // imagine 15 more
 * TODO: Go for compliance with DOM4 method matches (something about textnoding string arguments)
 */

(function scoped() {

    /**
     * Always spiritualize chain reactions.
     * @param {Element} el
     */
    function maybespiritualize(elm) {
        if (gui.mode !== gui.MODE_ROBOT) {
            gui.spiritualize(elm);
        }
    }

    gui.DOMPlugin.mixin(
        gui.Object.map({

            /**
             * Append spirit OR element OR array of either.
             * @param {object} things Complicated argument
             * @returns {object} Returns the argument
             */
            append: function(things) {
                var els = things,
                    element = this.spirit.element;
                els.forEach(function(el) {
                    element.appendChild(el);
                    maybespiritualize(el);
                });
            },

            /**
             * Prepend spirit OR element OR array of either.
             * @param {object} things Complicated argument
             * @returns {object} Returns the argument
             */
            prepend: function(things) {
                var els = things,
                    element = this.spirit.element,
                    first = element.firstChild;
                els.reverse().forEach(function(el) {
                    element.insertBefore(el, first);
                    maybespiritualize(el);
                });
            },

            /**
             * Insert spirit OR element OR array of either before this spirit.
             * @param {object} things Complicated argument
             * @returns {object} Returns the argument
             */
            before: function(things) {
                var els = things,
                    target = this.spirit.element,
                    parent = target.parentNode;
                els.reverse().forEach(function(el) {
                    parent.insertBefore(el, target);
                    maybespiritualize(el);
                });
            },

            /**
             * Insert spirit OR element OR array of either after this spirit.
             * @param {object} things Complicated argument
             * @returns {object} Returns the argument
             */
            after: function(things) {
                var els = things,
                    target = this.spirit.element,
                    parent = target.parentNode;
                els.forEach(function(el) {
                    parent.insertBefore(el, target.nextSibling);
                    maybespiritualize(el);
                });
            },

            /**
             * Replace the spirit with something else. This may nuke the spirit.
             * Note that this method is called on the spirit, not on the parent.
             * @param {object} things Complicated argument.
             * @returns {object} Returns the argument
             */
            replace: function(things) {
                this.after(things);
                this.remove();
            }

        }, function map(name, base) {

            /*
             * 1. Convert arguments to array of one or more elements
             * 2. Confirm array of elements (exception supressed pending IE9 issue)
             * 3. Invoke the base
             * 4. Return the input
             * TODO: DocumentFragment and friends
             * @param {String} name
             * @param {function} base
             */
            return function(things) {
                var elms = Array.map(gui.Array.make(things), function(thing) {
                    return thing && thing instanceof gui.Spirit ? thing.element : thing;
                }).filter(function(thing) { // TODO: IE9 may sometimes for some reason throw an array in here :/ must investigate!!!
                    return thing && gui.Type.isNumber(thing.nodeType); // first check added for FF which now may fail as well :/
                });
                if (elms.length) {
                    base.call(this, elms);
                }
                return things;
            };
        })
    );
}());



/**
 * Tracking DOM events.
 * TODO Throw an error on remove not added!
 * TODO Static interface for general consumption.
 * TODO: `shift` method
 * @extends {gui.Tracker}
 * @using {gui.Combo.chained}
 */
gui.EventPlugin = (function using(chained) {

    return gui.Tracker.extend({

        /**
         * Add one or more DOM event handlers.
         * TODO: Don't assume spirit handler
         * TODO: reverse handler and capture args
         * @param {object} arg String, array or whitespace-separated-string
         * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
         * @param @optional {object} handler implements EventListener interface, defaults to spirit
         * @param @optional {boolean} capture Defaults to false
         * @returns {gui.EventPlugin}
         */
        add: chained(function(arg, target, handler, capture) {
            target = target ? target : this.spirit.element;
            target = (target instanceof gui.Spirit ? target.element : target);
            if (target.nodeType || gui.Type.isWindow(target)) {
                handler = handler ? handler : this.spirit;
                capture = capture ? capture : false;
                if (gui.Interface.validate(gui.IEventHandler, handler)) {
                    var checks = [target, handler, capture];
                    gui.Array.make(arg).forEach(function(type) {
                        if (this._addchecks(type, checks)) {
                            this._addEventListener(true, target, type, handler, capture);
                        }
                    }, this);
                }
            } else {
                throw new TypeError(
                    'Invalid target: ' + target + ' (' + this.spirit.$classname + ')'
                );
            }
        }),

        /**
         * Add one or more DOM event handlers.
         * @param {object} arg String, array or whitespace-separated-string
         * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
         * @param @optional {object} handler implements EventListener interface, defaults to spirit
         * @param @optional {boolean} capture Defaults to false
         * @returns {gui.EventPlugin}
         */
        remove: chained(function(arg, target, handler, capture) {
            target = target ? target : this.spirit.element;
            target = (target instanceof gui.Spirit ? target.element : target);
            if (target.nodeType || gui.Type.isWindow(target)) {
                handler = handler ? handler : this.spirit;
                capture = capture ? capture : false;
                if (gui.Interface.validate(gui.IEventHandler, handler)) {
                    var checks = [target, handler, capture];
                    gui.Array.make(arg).forEach(function(type) {
                        if (this._removechecks(type, checks)) {
                            this._addEventListener(false, target, type, handler, capture);
                        }
                    }, this);
                }
            } else {
                throw new TypeError(
                    'Invalid target: ' + target + ' (' + this.spirit.$classname + ')'
                );
            }
        }),

        /**
         * Toggle one or more DOM event handlers.
         * @param {object} arg String, array or whitespace-separated-string
         * @param @optional {object} target Node, Window or XmlHttpRequest. Defaults to spirit element
         * @param @optional {object} handler implements EventListener interface, defaults to spirit
         * @param @optional {boolean} capture Defaults to false
         * @returns {gui.EventPlugin}
         */
        toggle: chained(function(arg, target, handler, capture) {
            target = target ? target : this.spirit.element;
            handler = handler ? handler : this.spirit;
            capture = capture ? capture : false;
            if (target instanceof gui.Spirit) {
                target = target.element;
            }
            var checks = [target, handler, capture];
            gui.Array.make(arg).forEach(function(type) {
                if (this._contains(type, checks)) {
                    this.add(type, target, handler, capture);
                } else {
                    this.remove(type, target, handler, capture);
                }
            }, this);
        }),

        /**
         * Dispatch event.
         * https://dvcs.w3.org/hg/domcore/raw-file/tip/Overview.html#customeventinit
         * http://stackoverflow.com/questions/5342917/custom-events-in-ie-without-using-libraries
         * @param {string} type
         * @param @optional {Map} params TODO: If not supported in IE(?), deprecate???
         * @returns {boolean} True if the event was cancelled (prevetDefaulted)
         */
        dispatch: function(type, params) {
            var elm = this.spirit.element,
                evt = null;
            if (window.CustomEvent && !gui.Client.isExplorer) { // TODO: IE version???
                evt = new CustomEvent(type, params);
            } else {
                params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: undefined
                };
                evt = document.createEvent('HTMLEvents');
                evt.initEvent(type, params.bubbles, params.cancelable);
            }
            evt.eventName = type;
            if (elm.dispatchEvent) {
                return elm.dispatchEvent(evt);
            } else if (elm[type]) {
                return elm[type]();
            } else if (elm['on' + type]) {
                return elm['on' + type]();
            }
        },


        // Private .................................................................

        /**
         * Actual event registration has been isolated so that
         * one may overwrite or overload this particular part.
         * @param {boolean} add
         * @param {Node} target
         * @param {string} type
         * @param {object} handler
         * @param {boolean} capture
         */
        _addEventListener: function(add, target, type, handler, capture) {
            var action = add ? 'addEventListener' : 'removeEventListener';
            target[action](type, handler, capture);
        },

        /**
         * Remove event listeners.
         * @overwrites {gui.Tracker#_cleanup}
         * @param {String} type
         * @param {Array<object>} checks
         */
        _cleanup: function(type, checks) {
            var target = checks[0];
            var handler = checks[1];
            var capture = checks[2];
            this.remove(type, target, handler, capture);
        },

        /**
         * Manhandle 'transitionend' event. Seems only Safari is left now...
         * @param {Array<String>|String} arg
         * @returns {Array<String>}
         */
        _breakdown: function(arg) {
            return this._super._breakdown(arg).map(function(type) {
                return type === 'transitionend' ? this._transitionend() : type;
            }, this);
        },

        /**
         * Compute vendor prefixed 'transitionend' event name.
         * @TODO: Cache the result somehow...
         * @returns {String}
         */
        _transitionend: function() {
            var t, el = this.spirit.document.createElement('fakeelement');
            var transitions = {
                'transition': 'transitionend',
                'WebkitTransition': 'webkitTransitionEnd'
            };
            for (t in transitions) {
                if (el.style[t] !== undefined) {
                    return transitions[t];
                }
            }
        }

    });

}(gui.Combo.chained));



/**
 * Interface EventHandler.
 *
 */
gui.IEventHandler = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object IEventHandler]";
    },

    /**
     * Native DOM interface. We'll forward the event to the method `onevent`.
     * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventListener
     * @param {Event} e
     */
    handleEvent: function(e) {},

    /**
     * Conforms to other Spiritual event handlers.
     * @param {Event} e
     */
    onevent: function(e) {}
};



/**
 * Transformation time!
 * @TODO: transform more
 * @TODO: support non-px units
 */
gui.SpritePlugin = gui.Plugin.extend({

    /**
     * X position.
     * @type {number}
     */
    x: {
        getter: function() {
            return this._pos.x;
        },
        setter: function(x) {
            this._pos.x = x;
            this._apply();
        }
    },

    /**
     * Y position.
     * @type {number}
     */
    y: {
        getter: function() {
            return this._pos.y;
        },
        setter: function(y) {
            this._pos.y = y;
            this._apply();
        }
    },

    /**
     * Z position.
     * @type {number}
     */
    z: {
        getter: function() {
            return this._pos.z;
        },
        setter: function(z) {
            this._pos.z = z;
            this._apply();
        }
    },

    /**
     * Construction time.
     */
    onconstruct: function() {
        this._super.onconstruct();
        this._pos = new gui.Position();
    },

    /**
     * Reset transformations.
     */
    reset: function() {
        if (true || gui.Client.has3D) {
            this.spirit.css.set("-beta-transform", "");
        } else {
            this.spirit.css.left = "";
            this.spirit.css.top = "";
        }
    },


    // Private ...............................................

    /**
     * Position tracking.
     * @type {gui.Position}
     */
    _pos: null,

    /**
     * Go ahead.
     */
    _apply: function() {
        var pos = this._pos;
        var set = [pos.x, pos.y, pos.z].map(Math.round);
        if (true || gui.Client.has3D) {
            this.spirit.css.set("-beta-transform",
                "translate3d(" + set.join("px,") + "px)"
            );
        } else {
            this.spirit.css.left = set [0];
            this.spirit.css.top = set [1];
        }
    }

});



/**
 * Spirit of the HTML element.
 * @extends {gui.Spirit}
 */
gui.DocumentSpirit = gui.Spirit.extend({

    /**
     * Get ready.
     * TODO: think more about late loading (module loading) scenario
     * TODO: let's go _waiting only if parent is a Spiritual document
     */
    onready: function() {
        this._super.onready();
        if ((this.waiting = gui.hosted)) {
            this.action.addGlobal(gui.$ACTION_XFRAME_VISIBILITY);
        }
        this.action.dispatchGlobal(gui.ACTION_DOC_ONSPIRITUALIZED);
    },

    /**
     * Handle action.s
     * @param {gui.Action} a
     */
    onaction: function(a) {
        this._super.onaction(a);
        this.action.$handleownaction = false;
        switch (a.type) {
            case gui.$ACTION_XFRAME_VISIBILITY:
                this._waiting = false;
                if (gui.hasModule("layout@wunderbyte.com")) { // TODO: - fix
                    if (a.data === true) {
                        this.visibility.on();
                    } else {
                        this.visibility.off();
                    }
                }
                a.consume();
                break;
        }
    },

    /**
     * Don't crawl for visibility inside iframed documents until
     * hosting {gui.IframeSpirit} has reported visibility status.
     * @param {gui.Crawler} crawler
     */
    oncrawler: function(crawler) {
        var dir = this._super.oncrawler(crawler);
        if (dir === gui.Crawler.CONTINUE) {
            switch (crawler.type) {
                case gui.CRAWLER_VISIBLE:
                case gui.CRAWLER_INVISIBLE:
                    if (this._waiting) {
                        dir = gui.Crawler.STOP;
                    }
                    break;
            }
        }
        return dir;
    },

    /**
     * Relay visibility from ancestor frame (match iframe visibility).
     */
    onvisible: function() {
        this.css.remove(gui.CLASS_INVISIBLE);
        this._super.onvisible();
    },

    /**
     * Relay visibility from ancestor frame (match iframe visibility).
     */
    oninvisible: function() {
        this.css.add(gui.CLASS_INVISIBLE);
        this._super.oninvisible();
    },


    // Private ...................................................................

    /**
     * Flipped on window.onload
     * @type {boolean}
     */
    _loaded: false,

    /**
     * Waiting for hosting {gui.IframeSpirit} to relay visibility status?
     * @type {boolean}
     */
    _waiting: false,
    
    /**
     * Timeout before we broadcast window resize ended.
     * This timeout cancels itself on each resize event.
     * @type {number}
     */
    _timeout: null

});



/**
 * Spirit of the iframe.
 * @extends {gui.Spirit}
 */
gui.IframeSpirit = gui.Spirit.extend({

    /**
     * Flipped when the *hosted* document is loaded and spiritualized.
     * @type {boolean}
     */
    spiritualized: false,

    /**
     * Fit height to contained document height (seamless style)?
     * @type {boolean}
     */
    fit: false,

    /**
     * Cross domain origin of hosted document (if that's the case).
     * @type {String} `http://iframehost.com:8888`
     */
    xguest: null,

    /**
     * Hosted window.
     * @type {Window}
     */
    contentWindow: {
        getter: function() {
            return this.element.contentWindow;
        }
    },

    /**
     * Hosted document.
     * @type {Document}
     */
    contentDocument: {
        getter: function() {
            return this.element.contentDocument;
        }
    },

    /**
     * URL details for hosted document.
     * @type {gui.URL}
     */
    contentLocation: null,

    /**
     * Construction time.
     */
    onconstruct: function() {
        this._super.onconstruct();
        this.event.add("message", this.window);
        this._postbox = [];
    },

    /**
     * Stamp SRC on startup.
     * Configure content document events in order of
     * appearance and resolve current contentLocation.
     */
    onenter: function() {
        this._super.onenter();
        this.event.add('load');
        this.action.addGlobal([ // in order of appearance
            gui.ACTION_DOC_ONDOMCONTENT,
            gui.ACTION_DOC_ONLOAD,
            gui.ACTION_DOC_ONHASH,
            gui.ACTION_DOC_ONSPIRITUALIZED,
            gui.ACTION_DOC_UNLOAD
        ]);
        if (this.fit) {
            this.css.height = 0;
        }
        var src = this.element.src;
        if (src && src !== gui.IframeSpirit.SRC_DEFAULT) {
            if (!src.startsWith("blob:")) { // wrong...
                this._setupsrc(src);
            }
        }
    },


    /**
     * Handle action.
     * @param {gui.Action} a
     */
    onaction: function(a) {
        this._super.onaction(a);
        this.action.$handleownaction = false;
        var base;
        switch (a.type) {
            case gui.ACTION_DOC_ONDOMCONTENT:
                this.contentLocation = new gui.URL(document, a.data);
                this.life.dispatch(gui.LIFE_IFRAME_DOMCONTENT);
                this.action.remove(a.type);
                a.consume();
                break;
            case gui.ACTION_DOC_ONLOAD:
                this.contentLocation = new gui.URL(document, a.data);
                this.life.dispatch(gui.LIFE_IFRAME_ONLOAD);
                this.action.remove(a.type);
                a.consume();
                break;
            case gui.ACTION_DOC_ONHASH:
                base = this.contentLocation.href.split("#")[0];
                this.contentLocation = new gui.URL(document, base + a.data);
                this.life.dispatch(gui.LIFE_IFRAME_ONHASH);
                a.consume();
                break;
            case gui.ACTION_DOC_ONSPIRITUALIZED:
                this._onspiritualized();
                this.life.dispatch(gui.LIFE_IFRAME_SPIRITUALIZED);
                this.action.remove(a.type);
                a.consume();
                break;
            case gui.ACTION_DOC_UNLOAD:
                this._onunload();
                this.life.dispatch(gui.LIFE_IFRAME_UNLOAD);
                this.action.add([
                    gui.ACTION_DOC_ONCONSTRUCT,
                    gui.ACTION_DOC_ONDOMCONTENT,
                    gui.ACTION_DOC_ONLOAD,
                    gui.ACTION_DOC_ONSPIRITUALIZED
                ]);
                a.consume();
                break;
        }
    },

    /**
     * Handle event.
     * @param {Event} e
     */
    onevent: function(e) {
        this._super.onevent(e);
        switch (e.type) {
            case 'message':
                this._onmessage(e.data, e.origin, e.source);
                break;
            case 'load':
                // now what?
                break;
        }
    },

    /**
     * Status visible.
     */
    onvisible: function() {
        this._super.onvisible();
        if (this.spiritualized) {
            this._visibility();
        }
    },

    /*
     * Status invisible.
     */
    oninvisible: function() {
        this._super.oninvisible();
        if (this.spiritualized) {
            this._visibility();
        }
    },

    /**
     * Get and set the iframe source. Set in markup using <iframe gui.src="x"/>
     * if you need to postpone iframe loading until the spirit gets initialized.
     * @param @optional {String} src
     * @returns @optional {String} src
     */
    src: function(src) {
        if (src) {
            this._setupsrc(src);
            this.element.src = src;
        }
        return this.element.src;
    },

    /**
     * Experimentally load some kind of blob.
     * @param @optional {URL} url
     * @param @optional {String} src
     */
    url: function(url, src) {
        if (src) {
            this._setupsrc(src);
        }
        if (url) {
            this.element.src = url;
        }
        return this.contentLocation.href;
    },

    /**
     * Post message to content window. This method assumes
     * that we are messaging Spiritual components and will
     * buffer the messages for bulk dispatch once Spiritual
     * is known to run inside the iframe.
     * @param {String} msg
     */
    postMessage: function(msg) {
        if (this.spiritualized) {
            this.contentWindow.postMessage(msg, "*");
        } else {
            this._postbox.push(msg);
        }
    },


    // Private ...................................................................

    /**
     * @param {String} src
     */
    _setupsrc: function(src) {
        var doc = document;
        this.contentLocation = new gui.URL(doc, src);
        this.xguest = (function(secured) {
            if (secured) {
                return "*";
            } else if (gui.URL.external(src, doc)) {
                var url = new gui.URL(doc, src);
                return url.protocol + "//" + url.host;
            }
            return null;
        }(this._sandboxed()));
    },

    /**
     * Hosted document spiritualized.
     * Dispatching buffered messages.
     */
    _onspiritualized: function() {
        this.spiritualized = true;
        while (this._postbox.length) {
            this.postMessage(this._postbox.shift());
        }
        this._visibility();
    },

    /**
     * Hosted document changed size. Resize to fit?
     * Dispatching an action to {gui.DocumentSpirit}
     * @param {number} height
     */
    _onfit: function(height) {
        if (this.fit) {
            this.css.height = height;
            this.action.dispatchGlobal(gui.ACTION_DOC_FIT);
        }
    },

    /**
     * Hosted document unloading.
     */
    _onunload: function() {
        this.spiritualized = false;
        if (this.fit) {
            this.css.height = 0;
        }
    },

    /**
     * Handle posted message, scanning for ascending actions.
     * Descending actions are handled by the documentspirit.
     * TODO: Don't claim this as action target!
     * @see {gui.DocumentSpirit._onmessage}
     * @param {String} msg
     */
    _onmessage: function(msg, origin, source) {
        if (source === this.contentWindow) {
            if (msg.startsWith("spiritual-action:")) {
                var a = gui.Action.parse(msg);
                if (a.direction === gui.Action.ASCEND) {
                    this.action.$handleownaction = true;
                    this.action.ascendGlobal(a.type, a.data);
                }
            }
        }
    },

    /**
     * Iframe is sandboxed? Returns `true` even for "allow-same-origin" setting.
     * @returns {boolean}
     */
    _sandboxed: function() {
        var sandbox = this.element.sandbox;
        return sandbox && sandbox.length; // && !sandbox.contains ( "allow-same-origin" );
    },

    /**
     * Teleport visibility crawler to hosted document.
     * Action intercepted by the {gui.DocumentSpirit}.
     */
    _visibility: function() {
        if (gui.hasModule("layout@wunderbyte.com")) { // TODO: - fix
            if (gui.Type.isDefined(this.life.visible)) {
                this.action.descendGlobal(
                    gui.$ACTION_XFRAME_VISIBILITY,
                    this.life.visible
                );
            }
        }
    }


}, { // Recurring static .......................................................

    /**
     * Summon spirit.
     * TODO: why does spirit.src method fail strangely 
     *       just now? using iframe.src instead...
     * @param {Document} doc
     * @param @optional {String} src
     * @returns {gui.IframeSpirit}
     */
    summon: function(doc, src) {
        var iframe = doc.createElement("iframe");
        var spirit = this.possess(iframe);
        spirit.css.add("gui-iframe");
        /*
         * TODO: should be moved to src() method (but fails)!!!!!
         */
        if (src) {
            if (gui.URL.external(src, doc)) {
                var url = new gui.URL(doc, src);
                spirit.xguest = url.protocol + "//" + url.host;
                //src = this.sign ( src, doc, spirit.$instanceid );
            }
        } else {
            src = this.SRC_DEFAULT;
        }
        iframe.src = src;
        return spirit;
    }


}, { // Static .................................................................

    /**
     * Presumably harmless iframe source. The issue here is that "about:blank"
     * may raise security concerns for some browsers when running HTTPS setup.
     * @type {String}
     */
    SRC_DEFAULT: "javascript:void(false);"

});



/**
 * Spirit of the stylesheet.
 * @see http://www.quirksmode.org/dom/w3c_css.html
 * @extends {gui.Spirit}
 */
gui.StyleSheetSpirit = gui.Spirit.extend({

    /**
     * Sheet not accessible before we hit the document.
     */
    onenter: function() {
        this._super.onenter();
        if (this._rules) {
            this.addRules(this._rules);
            this._rules = null;
        }
    },

    /**
     * Disable styles.
     */
    disable: function() {
        this.element.disabled = true;
    },

    /**
     * Enable styles.
     */
    enable: function() {
        this.element.disabled = false;
    },

    /**
     * Add rules (by JSON object for now).
     * @param {Map<String,Map<String,String>>} rules
     */
    addRules: function(rules) {
        var sheet = this.element.sheet,
            index = sheet.cssRules.length;
        gui.Object.each(rules, function(selector, declarations) {
            sheet.insertRule(selector + this._ruleout(declarations), index++);
        }, this);
    },

    // Private .................................................................

    /**
     * CSS ruleset to evaluate when inserted.
     * @type {Map<String,object>} declarations
     */
    _rules: null,

    /**
     * Convert declarations to rule body.
     * @param {Map<String,String>} declarations
     * @return {String}
     */
    _ruleout: function(declarations) {
        var body = "",
            plugin = gui.CSSPlugin;
        gui.Object.each(declarations, function(property, value) {
            body +=
                plugin.cssproperty(property) + ":" +
                plugin.cssvalue(value) + ";";
        });
        return "{" + body + "}";
    }


}, { // Static .....................................................

    /**
     * Summon spirit.
     * @param {Document} doc
     * @param @optional {String} href
     * @param @optional {Map<String,object>} rules
     * @param @optional {boolean} disbled
     * @returns {gui.StyleSheetSpirit}
     */
    summon: function(doc, href, rules, disabled) {
        var elm = href ? this._createlink(doc, href) : this._createstyle(doc);
        var spirit = this.possess(elm);
        if (rules) {
            if (href) {
                elm.addEventListener("load", function() {
                    spirit.addRules(rules);
                }, false);
            } else {
                spirit._rules = rules;
            }
        }
        if (disabled) {
            spirit.disable();
        }
        return spirit;
    },


    // Private static .................................................

    /**
     * External styles in LINK element.
     * @returns {HTMLLinkElement}
     */
    _createlink: function(doc, href) {
        var link = doc.createElement("link");
        link.className = "gui-stylesheet";
        link.rel = "stylesheet";
        link.href = href;
        return link;
    },

    /**
     * Inline styles in STYLE element.
     * @returns {HTMLStyleElement}
     */
    _createstyle: function(doc) {
        var style = doc.createElement("style");
        style.className = "gui-stylesheet";
        style.appendChild(doc.createTextNode(""));
        return style;
    }

});



/**
 * It's the spirits module.
 */
gui.module("spirits@wunderbyte.com", {

    /**
     * Channel spirits for CSS selectors.
     */
    channel: [
        ["html", gui.DocumentSpirit],
        [".gui-styles", gui.StyleSheetSpirit], // TODO: fix or deprecate
        [".gui-iframe", gui.IframeSpirit],
        [".gui-spirit", gui.Spirit]
    ],

    /**
     * Assign plugins to prefixes for all {gui.Spirit}.
     */
    plugin: {
        "action": gui.ActionPlugin,
        "broadcast": gui.BroadcastPlugin,
        "tick": gui.TickPlugin,
        "att": gui.AttPlugin,
        "config": gui.ConfigPlugin,
        "box": gui.BoxPlugin,
        "css": gui.CSSPlugin,
        "dom": gui.DOMPlugin,
        "event": gui.EventPlugin,
        "life": gui.LifePlugin,
        "sprite": gui.SpritePlugin
    },

    /**
     * Methods added to {gui.Spirit.prototype}
     */
    mixin: {

        /**
         * Handle action.
         * @param {gui.Action} action
         */
        onaction: function(action) {},

        /**
         * Handle broadcast.
         * @param {gui.Broadcast} broadcast
         */
        onbroadcast: function(broadcast) {},

        /**
         * Handle tick (timed event).
         * @param {gui.Tick} tick
         */
        ontick: function(tick) {},

        /**
         * Handle attribute.
         * @param {gui.Att} att
         */
        onatt: function(att) {},

        /**
         * Handle event.
         * @param {Event} event
         */
        onevent: function(event) {},

        /**
         * Handle lifecycle event.
         * @param {gui.Life} life
         */
        onlife: function(life) {},

        /**
         * Native DOM interface. We'll forward the event to the method `onevent`.
         * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventListener
         * @param {Event} e
         */
        handleEvent: function(e) {
            /*
             * TODO: Move this code into {gui.EventPlugin}
             */
            if (e.type === "webkitTransitionEnd") {
                e = {
                    type: "transitionend",
                    target: e.target,
                    propertyName: e.propertyName,
                    elapsedTime: e.elapsedTime,
                    pseudoElement: e.pseudoElement
                };
            }
            this.onevent(e);
        },

        // presumably some kind of hotfix for not conflicting 
        // callbacks with destructed spirits, but why here???
        $ondestruct: gui.Combo.before(function() {
            this.handleEvent = function() {};
        })(gui.Spirit.prototype.$ondestruct)
    }

});



/**
 * Monitor document for unsolicitated DOM changes and spiritualize
 * elements accordingly. This patches a missing feature in
 * WebKit/Safari/Blink that blocks us from overriding native
 * DOM getters and setters (eg. innerHTML). Importantly note that
 * spirits will be attached and detached *asynchronously* with this.
 * TODO: If this was forced synchronous via DOMPlugin methods, we
 * may be crawling the DOM twice - let's make sure we don't do that.
 * @see http://code.google.com/p/chromium/issues/detail?id=13175
 */
gui.Observer = {

    /**
     * Enabled?
     * @type {boolean}
     */
    observes: false,

    /**
     * Start observing.
     */
    observe: function() {
        if (gui.Client.hasMutations) {
            if (!this._observer) {
                var Observer = this._mutationobserver();
                this._observer = new Observer(function(mutations) {
                    mutations.forEach(function(mutation) {
                        gui.Observer._handleMutation(mutation);
                    });
                });
            }
            this._connect(true);
            this.observes = true;
        } else {
            throw new Error('MutationObserver no such thing');
        }
    },

    /**
     * Suspend mutation monitoring of document; enable
     * monitoring again after executing provided function.
     * @param {Node} node
     * @param @optional {function} action
     * @param @optional {object} thisp
     * @returns {object} if action was defined, we might return something
     */
    suspend: function(action, thisp) {
        var res;
        if (this.observes) {
            if (++this._suspend === 1) {
                this._connect(false);
            }
        }
        if (gui.Type.isFunction(action)) {
            res = action.call(thisp);
        }
        if (this.observes) {
            this.resume();
        }
        return res;
    },

    /**
     * Resume monitoring of mutations in document.
     * @param {Node} node
     */
    resume: function() {
        if (this.observes) {
            if (--this._suspend === 0) {
                this._connect(true);
            }
        }
    },


    // Private ...................................................................

    /**
     * Is suspended? Minimize what overhead there might
     * be on connecting and disconnecting the observer.
     * @type {number} Counting stuff that suspends...
     */
    _suspend: 0,

    /**
     * MutationObserver.
     * @type {MutationObserver}
     */
    _observer: null,

    /**
     * Get MutationObserver.
     * (IE11 has this now!)
     * @returns {constructor}
     */
    _mutationobserver: function() {
        return (
            window.MutationObserver ||
            window.WebKitMutationObserver ||
            window.MozMutationObserver
        );
    },

    /**
     * Connect and disconnect observer.
     * @param {boolean} connect
     */
    _connect: function(connect) {
        var obs = this._observer;
        if (obs) {
            if (connect) {
                obs.observe(document, {
                    childList: true,
                    subtree: true
                });
            } else {
                obs.disconnect();
            }
        }
    },

    /**
     * Handle mutations.
     *
     * 1. Matarialize deleted nodes
     * 2. Spiritualize added nodes
     * @param {MutationRecord} mutation
     */
    _handleMutation: function(mutation) {
        Array.forEach(mutation.removedNodes, function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                gui.materialize(node);
            }
        }, this);
        Array.forEach(mutation.addedNodes, function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                gui.spiritualize(node);
            }
        }, this);
    }

};



/**
 * The spirit guide crawls the document while channeling
 * spirits into DOM elements that matches CSS selectors.
 */
gui.Guide = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.Guide]";
    },

    /**
     * Setup spirit management.
     */
    setup: function() {
        gui.Broadcast.addGlobal(gui.BROADCAST_KICKSTART, this);
        var hack = gui.Client.isExplorer ? 'loading' : document.readyState;
        switch (hack) {
            case "loading":
                document.addEventListener("DOMContentLoaded", this, false);
                window.addEventListener("load", this, false);
                break;
            case "interactive":
                this._ondom();
                window.addEventListener("load", this, false);
                break;
            case "complete":
                //this._onload();
                this._ondom();
                break;
        }
    },

    /**
     * Handle startup and shutdown events.
     * @param {Event} e
     */
    handleEvent: function(e) {
        e.currentTarget.removeEventListener(e.type, this, false);
        switch (e.type) {
            case "DOMContentLoaded":
                this._ondom();
                break;
            case "load":
                //this._onload();
                break;
        }
    },

    /**
     * Elaborate setup to spiritualize document after async
     * evaluation of gui-stylesheets (future project).
     * @see {gui.StyleSheetSpirit}
     * @param {gui.Broadcast} b
     */
    onbroadcast: function(b) {
        var sig = b.data;
        var spirit = null;
        var spirits = this._windows[sig];
        switch (b.type) {
            case gui.BROADCAST_KICKSTART:
                gui.Broadcast.removeGlobal(b.type, this);
                this._step1(window, document);
                break;
            case gui.BROADCAST_LOADING_CHANNELS:
                if (!spirits) {
                    spirits = this._windows[sig] = [];
                    spirits.$loading = 0;
                }
                spirits.push(b.target);
                spirits.$loading++;
                break;
            case gui.BROADCAST_CHANNELS_LOADED:
                if (--spirits.$loading === 0) {
                    while ((spirit = spirits.shift())) {
                        spirit.channel();
                    }
                    this._step2(b.target.document);
                }
                break;
        }
    },

    /**
     * Invoke ondetach for element spirit and descendants spirits.
     * TODO: Definitely rename this to $ and think something about it
     * @param {Element|gui.Spirit} target
     */
    detach: function(target) {
        this._maybedetach(target);
    },

    /**
     * Associate DOM element to Spirit instance.
     * @param {Element} elm
     * @param {function} Spirit constructor
     * @returns {Spirit}
     */
    possess: function(elm, Spirit) {
        var doc = elm.ownerDocument;
        var win = doc.defaultView;
        var sig = win.gui.$contextid;
        if (elm.spirit) {
            throw new Error(
                "Cannot repossess element with spirit " +
                elm.spirit + " (exorcise first)"
            );
        } else if (!gui.debug || gui.Type.isSpiritConstructor(Spirit)) {
            elm.spirit = new Spirit(elm, doc, win, sig);
        } else {
            throw new Error(
                "Not a spirit constructor (" + gui.Type.of(Spirit) + ")"
            );
        }
        return elm.spirit;
    },

    /**
     * Disassociate DOM element from Spirit instance.
     * @param {gui.Spirit} spirit
     */
    exorcise: function(spirit) {
        if (!spirit.life.destructed) {
            gui.Spirit.$destruct(spirit); // API user should cleanup here
            gui.Spirit.$dispose(spirit); // everything is destroyed here
        }
    },

    /**
     * Suspend spiritualization and materialization during operation.
     * @param {function} operation
     * @param @optional {object} thisp
     * @returns {object}
     */
    suspend: function(operation, thisp) {
        this._suspended = true;
        var res = operation.call(thisp);
        this._suspended = false;
        return res;
    },
    

    // Privileged ................................................................

    /**
     * Possess element and descendants.
     * TODO: Jump detached spirit if matching id (!)
     * @param {Element} target
     */
    $spiritualize: function(target) {
        target = target instanceof gui.Spirit ? target.element : target;
        this._maybespiritualize(target, false, false);
    },

    /**
     * Possess descendants.
     * @param {Element|gui.Spirit} target
     */
    $spiritualizeSub: function(target) {
        this._maybespiritualize(target, true, false);
    },

    /**
     * Possess one element non-crawling.
     * @param {Element|gui.Spirit} target
     */
    $spiritualizeOne: function(target) {
        this._maybespiritualize(target, false, true);
    },

    /**
     * Dispell spirits from element and descendants.
     * @param {Element|gui.Spirit} target
     */
    $materialize: function(target) {
        this._maybematerialize(target, false, false);
    },

    /**
     * Dispell spirits for descendants.
     * @param {Element|gui.Spirit} target
     */
    $materializeSub: function(target) {
        this._maybematerialize(target, true, false);
    },

    /**
     * Dispell one spirit non-crawling.
     * @param {Element|gui.Spirit} target
     */
    $materializeOne: function(target) {
        this._maybematerialize(target, false, true);
    },

    /**
     * Fires on window unload.
     */
    $shutdown: function() {
        gui.Broadcast.dispatch(gui.BROADCAST_WILL_UNLOAD);
        gui.Broadcast.dispatch(gui.BROADCAST_UNLOAD);
        this.$materialize(document);
    },

    // Private ...................................................................

    /**
     * Tracking which gui.StyleSheetSpirit goes into what window.
     * @type {Map<String,Array<String>>}
     */
    _windows: Object.create(null),

    /**
     * Ignore DOM mutations?
     * @type {boolean}
     */
    _suspended: false,

    /**
     * Continue with spiritualize/materialize of given node?
     * @returns {boolean}
     */
    _handles: function(node) {
        return node && !this._suspended &&
            gui.DOMPlugin.embedded(node) &&
            node.nodeType === Node.ELEMENT_NODE;
    },

    /**
     * Fires on document.DOMContentLoaded (or if after, as soon as this script loads).
     * TODO: gui.Observer crashes with JQuery when both do stuff on DOMContentLoaded
     * TODO: (can't setImmedeate to bypass JQuery, we risk onload being fired first)
     * @see http://stackoverflow.com/questions/11406515/domnodeinserted-behaves-weird-when-performing-dom-manipulation-on-body
     * @param {gui.EventSummary} sum
     */
    _ondom: function() {
        if (gui.autostart) {
            // TODO: move meta stuff to gui.Document
            var meta = document.querySelector('meta[name="gui.autostart"]');
            if (!meta || gui.Type.cast(meta.getAttribute("content")) !== false) {
                this._step1(window, document); // else await gui.kickstart()
            }
        }
    },

    /**
     * Fires on window.onload (or if after, as soon as this script loads).
     *
    _onload: function() {
        var root = gui.get('html');
        if (root) {
            root.onload();
        }
    },
    */

    /**
     * @param {Window} win
     * @param {Document} doc
     */
    _step1: function(win, doc) {
        gui.Broadcast.removeGlobal(gui.BROADCAST_KICKSTART, this);
        //this._metatags(win); // configure runtime
        gui.start().then(function() {
            this._step2(win, doc); // channel spirits
        }, this);
    },

    /**
     * Spiritualize elements and proclaim the document spiritualized.
     * @param {Window} win
     * @param {Document} doc
     */
    _step2: function(win, doc) {
        var sig = win.gui.$contextid;
        gui.DOMChanger.setup(win);
        gui.broadcastGlobal(gui.BROADCAST_WILL_SPIRITUALIZE, sig);
        this._step3(win, doc);
        gui.broadcastGlobal(gui.BROADCAST_DID_SPIRITUALIZE, sig);
    },

    /**
     * Always spiritualize the root {gui.DocumentSpirit}.
     * 1. Overload native DOM methods in native mode?
     * 2. Monitor DOM for unhandled mutations in debug mode?
     * 3. Potentially spiritualize all other spirits?
     * @param {Window} win
     * @param {Document} doc
     */
    _step3: function(win, doc) {
        var root = doc.documentElement;
        gui.spiritualizeOne(root);
        //root.spirit.ondom(); // TODO: this might not always be called ondom!
        if (gui.mode !== gui.MODE_HUMAN) {
            gui.DOMChanger.change(win);
            if (gui.Client.isWebKit) {
                gui.Observer.observe(win);
            }
            if (gui.debugmutations) {
                console.warn('Deprecated API is deprecated: gui.debugmutations');
            }
            gui.spiritualizeSub(root);
            gui.$onready();
        }
    },

    /**
     * Resolve metatags (configure runtime).
     */
    _metatags: function() {
        /*
        var spaces = gui.namespaces();
        var metas = document.querySelectorAll("meta[name]");
        Array.forEach(metas, function(meta) {
            var prop = meta.getAttribute("name");
            spaces.forEach(function(ns) {
                if (prop.startsWith(ns + ".")) {
                    var def = gui.Object.lookup(prop);
                    if (gui.Type.isDefined(def)) {
                        var content = meta.getAttribute("content");
                        var value = gui.Type.cast(content);
                        gui.Object.assert(prop, value);
                    } else {
                        console.error('No definition for "' + prop + '"');
                    }
                }
            });
        });
        */
    },

    /**
     * Collect non-destructed spirits from element and descendants.
     * @param {Node} node
     * @param @optional {boolean} skip Skip start element
     * @returns {Array<gui.Spirit>}
     */
    _collect: function(node, skip, id) {
        var list = [];
        new gui.Crawler(id).descend(node, {
            handleSpirit: function(spirit) {
                if (skip && spirit.element === node) {
                    // nothing
                } else if (!spirit.life.destructed) {
                    list.push(spirit);
                }
            }
        });
        return list;
    },

    /**
     * Spiritualize node perhaps.
     * @param {Node|gui.Spirit} node
     * @param {boolean} skip Skip the element?
     * @param {boolean} one Skip the subtree?
     */
    _maybespiritualize: function(node, skip, one) {
        node = node instanceof gui.Spirit ? node.element : node;
        node = node.nodeType === Node.DOCUMENT_NODE ? node.documentElement : node;
        if (this._handles(node)) {
            this._spiritualize(node, skip, one);
        }
    },

    /**
     * Evaluate spirits for element and subtree.
     *
     * - Construct spirits in document order
     * - Fire life cycle events except `ready` in document order
     * - Fire `ready` in reverse document order (innermost first)
     *
     * TODO: Create a dedicated crawler subclass for this purpose.
     * @param {Element} element
     * @param {boolean} skip Skip the element?
     * @param {boolean} one Skip the subtree?
     */
    _spiritualize: function(element, skip, one) {
        skip = false; // until DOM setters can finally replace Mutation Observers...
        var att = 'gui-spiritualizing';
        if (!element.hasAttribute(att)) {
            var spirit, spirits = []; // classname = gui.CLASS_NOSPIRITS
            element.setAttribute(att, 'true');
            new gui.Crawler(gui.CRAWLER_SPIRITUALIZE).descend(element, {
                handleElement: function(elm) {
                    if (elm !== element && elm.hasAttribute(att)) {
                        return one ? gui.Crawler.STOP : gui.Crawler.SKIP_CHILDREN;
                    } else {
                        if (!skip || elm !== element) {
                            spirit = elm.spirit;
                            if (!spirit) {
                                spirit = gui.Guide._evaluate(elm);
                            }
                            if (spirit) {
                                if (!spirit.life.attached) {
                                    spirits.push(spirit);
                                }
                            }
                        }
                        if (one) {
                            return gui.Crawler.STOP;
                        } else if (!elm.childElementCount) { //  || gui.CSSPlugin.contains(elm, classname)
                            return gui.Crawler.SKIP_CHILDREN;
                        } else {
                            // TODO: interface for this kind of stuff!
                            switch (elm.localName) {
                                case "pre":
                                case "code":
                                    return gui.Crawler.SKIP_CHILDREN;
                            }
                        }
                    }
                    return gui.Crawler.CONTINUE;
                }
            });
            element.removeAttribute(att);
            this._sequence(spirits);
        }
    },

    /**
     * Call `onconfigure`, `onenter` and `onattach` in document
     * order. Finally call `onready` in reverse document order.
     * @param {Array<gui.Spirit>} spirits
     */
    _sequence: (function() {
        function configure(spirit) {
            if (!spirit.life.configured) {
                gui.Spirit.$configure(spirit);
            }
            return spirit;
        }

        function enter(spirit) {
            if (!spirit.life.entered) {
                gui.Spirit.$enter(spirit);
            }
            return spirit;
        }

        function attach(spirit) {
            gui.Spirit.$attach(spirit);
            return spirit;
        }

        function ready(spirit) {
            if (!spirit.life.ready) {
                gui.Spirit.$ready(spirit);
            }
        }
        return function(spirits) {
            spirits.map(configure).map(enter).map(attach).reverse().forEach(ready);
        };
    }()),

    /**
     * Destruct spirits from element and subtree. Using a two-phased destruction sequence
     * to minimize the risk of plugins invoking already destructed plugins during destruct.
     * @param {Node|gui.Spirit} node
     * @param {boolean} skip Skip the element?
     * @param {boolean} one Skip the subtree?
     * @param {boolean} force
     */
    _maybematerialize: function(node, skip, one, force) {
        node = node instanceof gui.Spirit ? node.element : node;
        node = node.nodeType === Node.DOCUMENT_NODE ? node.documentElement : node;
        if (force || this._handles(node)) {
            node.setAttribute('gui-matarializing', 'true');
            this._materialize(node, skip, one);
            node.removeAttribute('gui-matarializing');
        }
    },

    /**
     * Nuke spirits in reverse document order. This to allow an ascending {gui.Action} to escape
     * from the subtree of a spirit that decides to remove itself from the DOM during destruction.
     * TODO: 'one' appears to be unsupported here???
     * @param {Element} element
     * @param {boolean} skip Skip the element?
     * @param {boolean} one Skip the subtree?
     */
    _materialize: function(element, skip, one) {
        this._collect(element, skip, gui.CRAWLER_MATERIALIZE).reverse().filter(function(spirit) {
            if (spirit.life.attached && !spirit.life.destructed) {
                gui.Spirit.$destruct(spirit);
                return true; // @TODO: handle 'one' arg!
            }
            return false;
        }).forEach(function(spirit) {
            gui.Spirit.$dispose(spirit);
        });
    },

    /**
     * @param {Element|gui.Spirit} element
     */
    _maybedetach: function(element) {
        element = element instanceof gui.Spirit ? element.element : element;
        if (this._handles(element)) {
            this._collect(element, false, gui.CRAWLER_DETACH).forEach(function(spirit) {
                gui.Spirit.$detach(spirit);
            });
        }
    },

    /**½
     * If possible, construct and return spirit for element.
     * TODO: what's this? http://code.google.com/p/chromium/issues/detail?id=20773
     * TODO: what's this? http://forum.jquery.com/topic/elem-ownerdocument-defaultview-breaks-when-elem-iframe-document
     * @param {Element} element
     * @returns {Spirit} or null
     */
    _evaluate: function(element) {
        if (!element.spirit) {
            var doc = element.ownerDocument;
            var win = doc.defaultView;
            var hit = win.gui.evaluate(element);
            if (hit) {
                this.possess(element, hit);
            }
        }
        return element.spirit;
    },

    /**
     * Evaluate spirits visibility.
     * @todo: Off to plugin somehow.
     * @todo: Test for this stuff.
     * @param {Array<gui.Spirit>}
     */
    _visibility: function(spirits) {
        if (gui.hasModule("layout@wunderbyte.com")) {
            gui.DOMPlugin.group(spirits).forEach(function(spirit) {
                gui.VisibilityPlugin.$init(spirit);
            }, this);
        }
    },


    // Privileged ................................................................

    /**
     * Invoked by {gui.Spiritual} some milliseconds after
     * all spirits have been attached to the page DOM.
     * @param {Array<gui.Spirit>} spirits
     */
    $goasync: function(spirits) {
        spirits.forEach(function(spirit) {
            gui.Spirit.$async(spirit);
        });

        /*
         * Temp hack: DocumentSpirit inside *iframe* must
         * wait for visibility status to relay elsehow...
         * (this stuff must all move to the plugin)
         * @see {gui.IframeSpirit}
         */
        if (gui.hosted) {
            var docspirit = gui.get('html');
            if (docspirit.life.visible === undefined) {
                return;
            }
        }
        this._visibility(spirits);
    }

};

/**
 * Start managing 
 * all the stuff.
 */
(function setup() {
    gui.Guide.setup();
})();



/**
 * Spiritualizing documents by overloading DOM methods.
 */
gui.DOMChanger = {

    /**
     * Declare `spirit` as a fundamental property of things.
     * @param {Window} win
     */
    setup: function(win) {
        var proto = win.Element.prototype;
        if (gui.Type.isDefined(proto.spirit)) {
            throw new Error("Spiritual loaded twice?");
        } else {
            proto.spirit = null; // defineProperty fails in iOS5
        }
    },

    /**
     * Extend native DOM methods in given window scope.
     * @param {Window} win
     */
    change: function(win) {
        this.upgrade(win, gui.DOMCombos);
    },

    /**
     * Upgrade DOM methods in window.
     * @param {Window} win
     * @param {Map<String,function>} combos
     */
    upgrade: function(win, combos) {
        this._change(win, combos);
    },


    // Private ...................................................................

    /**
     * Extending Element.prototype to intercept DOM updates.
     * TODO: Support insertAdjecantHTML
     * TODO: Support SVG elements
     * @param {Window} win
     * @param {Map<String,function} combos
     */
    _change: function _change(win, combos) {
        if (!this._canchange(Element.prototype, win, combos)) {
            if (!win.HTMLElement || !this._canchange(HTMLElement.prototype, win)) {
                this._changeoldgecko(win, combos);
            }
        }
    },

    /**
     * OLDER versions of Firefox ignore extending of Element.prototype,
     * we must step down the prototype chain.
     * @see https://bugzilla.mozilla.org/show_bug.cgi?id=618379 (RESOLVED FIXED)
     */
    _changeoldgecko: function(win, combos) {
        var did = [];
        this._tags().forEach(function(tag) {
            var e = document.createElement(tag);
            var p = e.constructor.prototype;
            // alert ( p ); this call throws a BAD_CONVERT_JS
            if (p !== Object.prototype) { // excluding object and embed tags
                if (did.indexOf(p) === -1) {
                    this._dochange(p, window, combos);
                    did.push(p); // some elements share the same prototype
                }
            }
        }, this);
    },

    /**
     * OLDER Firefox has to traverse the constructor of *all* elements.
     * Object and embed tags excluded because the constructor of
     * these elements appear to be identical to Object.prototype.
     * @returns {Array<String>}
     */
    _tags: function tags() {
        return ("a abbr address area article aside audio b base bdi bdo blockquote " +
            "body br button canvas caption cite code col colgroup command datalist dd del " +
            "details device dfn div dl dt em fieldset figcaption figure footer form " +
            "h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen " +
            "label legend li link main map menu meta meter nav noscript ol optgroup option " +
            "output p param pre progress q rp rt ruby s samp script section select small " +
            "source span strong style submark summary sup table tbody td textarea tfoot " +
            "th thead time title tr track ul unknown var video wbr").split(" ");
    },

    /**
     * Can extend given prototype object? If so, do it now.
     * @param {object} proto
     * @param {Window} win
     * @param {Map<String,function} combos
     * @returns {boolean} Success
     */
    _canchange: function _canchange(proto, win, combos) {
        // attempt overwrite
        var result = false;
        var test = "it appears to work";
        var cache = proto.hasChildNodes;
        proto.hasChildNodes = function() {
            return test;
        };
        // test overwrite and reset back
        var root = win.document.documentElement;
        if (root.hasChildNodes() === test) {
            proto.hasChildNodes = cache;
            this._dochange(proto, win, combos);
            result = true;
        }
        return result;
    },

    /**
     * Overloading prototype methods and properties.
     * @param {object} proto
     * @param {Window} win
     * @param {Map<String,function} combos
     */
    _dochange: function _dochange(proto, win, combos) {
        var root = win.document.documentElement;
        gui.Object.each(combos, function(name, combo) {
            this._docombo(proto, name, combo, root);
        }, this);
    },

    /**
     * Overload methods and setters (although not in WebKit).
     * @see http://code.google.com/p/chromium/issues/detail?id=13175
     * @param {object} proto
     * @param {String} name
     * @param {function} combo
     * @param {Element} root
     */
    _docombo: function(proto, name, combo, root) {
        if (this._ismethod(name)) {
            this._domethod(proto, name, combo);
        } else {
            if (gui.Client.isGecko) {
                this._dogecko(proto, name, combo, root);
            } else if (gui.Client.isExplorer) {
                this._doie(proto, name, combo);
            } else {
                // WebKit/Safari/Blink relies on the {gui.Observer}
            }
        }
    },

    /**
     * Is method? (non-crashing Firefox version)
     * @returns {boolean}
     */
    _ismethod: function(name) {
        var is = false;
        switch (name) {
            case "appendChild":
            case "removeChild":
            case "insertBefore":
            case "replaceChild":
            case "setAttribute":
            case "removeAttribute":
            case "insertAdjecantHTML":
                is = true;
                break;
        }
        return is;
    },

    /**
     * Overload DOM method (same for all browsers).
     * @param {object} proto
     * @param {String} name
     * @param {function} combo
     */
    _domethod: function(proto, name, combo) {
        var base = proto[name];
        proto[name] = combo(function() {
            return base.apply(this, arguments);
        });
    },


    // Disabled ..................................................................

    /**
     * Overload property setter for IE.
     * @param {object} proto
     * @param {String} name
     * @param {function} combo
     * @param {Element} root
     */
    _doie: function(proto, name, combo) {
        var base = Object.getOwnPropertyDescriptor(proto, name);
        Object.defineProperty(proto, name, {
            get: function() {
                return base.get.call(this);
            },
            set: combo(function() {
                base.apply(this, arguments);
            })
        });
    },

    /**
     * Overload property setter for Firefox.
     * @param {object} proto
     * @param {String} name
     * @param {function} combo
     * @param {Element} root
     */
    _dogecko: function(proto, name, combo, root) {
        var getter = root.__lookupGetter__(name);
        var setter = root.__lookupSetter__(name);
        if (getter) { // firefox 20 needs a getter for this to work
            proto.__defineGetter__(name, function() {
                return getter.apply(this, arguments);
            });
            proto.__defineSetter__(name, combo(function() {
                setter.apply(this, arguments);
            }));
        }
    }
};



/**
 * This is where it gets interesting.
 * TODO: Standard DOM exceptions for missing arguments and so on.
 * TODO: insertAdjecantHTML
 * TODO: DOM4 methods
 */
gui.DOMCombos = (function scoped() {

    var combo = gui.Combo,
        before = combo.before,
        after = combo.after,
        around = combo.around,
        provided = combo.provided;

    /**
     * Is `this` embedded in document?
     * @returns {boolean}
     */
    var ifEmbedded = provided(function() {
        return gui.DOMPlugin.embedded(this);
    });

    /**
     * Element has spirit?
     * @returns {boolean}
     */
    var ifSpirit = provided(function() {
        return !gui.Type.isNull(this.spirit);
    });

    /**
     * Spiritualize node plus subtree.
     * @param {Node} node
     */
    var spiritualizeAfter = after(function(node) {
        gui.spiritualize(node);
    });

    /**
     * Spiritualize new node plus subtree.
     * @param {Node} oldnode
     */
    var spiritualizeNewAfter = after(function(newnode, oldnode) {
        gui.spiritualize(newnode);
    });

    /**
     * Materialize old node plus subtree
     * TODO: perhaps just detach oldnode instead???
     * @param {Node} newnode
     * @param {Node} oldnode
     */
    var materializeOldBefore = before(function(newnode, oldnode) {
        gui.materialize(oldnode);
    });

    /**
     * Detach node plus subtree.
     * @param {Node} node
     */
    var detachBefore = before(function(node) {
        gui.Guide.detach(node);
    });

    /**
     * Spirit-aware setattribute.
     * @param {String} name
     * @param {String} value
     */
    var setAttBefore = before(function(name, value) {
        this.spirit.att.set(name, value);
    });

    /**
     * Spirit-aware removeattribute.
     * TODO: use the post combo?
     * @param {String} name
     */
    var delAttBefore = before(function(name) {
        this.spirit.att.del(name);
    });

    /**
     * Disable DOM mutation observers while doing action.
     * @param {function} action
     */
    var suspending = around(function(action) {
        if (gui.Observer.observes) {
            return gui.Observer.suspend(function() {
                return action();
            });
        } else {
            return action();
        }
    });

    /**
     * Materialize subtree of `this`.
     */
    var materializeSubBefore = before(function() {
        gui.materializeSub(this);
    });

    /**
     * Spiritualize subtree of `this`
     */
    var spiritualizeSubAfter = after(function() {
        gui.spiritualizeSub(this);
    });

    /**
     * Detach `this`.
     */
    var parent = null; // TODO: unref this at some point
    var materializeThisBefore = before(function() {
        parent = this.parentNode;
        gui.materialize(this);
    });

    /**
     * Attach parent.
     */
    var spiritualizeParentAfter = after(function() {
        gui.spiritualize(parent);
    });

    /**
     * @param {String} position
     * @param {String} html
     */
    var spiritualizeAdjecantAfter = after(function(position, html) {
        console.log(position);
        /*
        'beforebegin'
        Before the element itself.
        'afterbegin'
        Just inside the element, before its first child.
        'beforeend'
        Just inside the element, after its last child.
        'afterend'
        After the element itself.
        */
    });

    /**
     * Pretend nothing happened when running in managed mode.
     * TODO: Simply mirror this prop with an internal boolean
     */
    var ifEnabled = provided(function() {
        var win = this.ownerDocument.defaultView;
        if (win) {
            return win.gui.mode !== gui.MODE_HUMAN;
        } else {
            return false; // abstract HTMLDocument might adopt DOM combos
        }
    });

    /**
     * Not in funny mode?
     */
    var ifSerious = provided(function() {
        var win = this.ownerDocument.defaultView;
        if (win) {
            return win.gui.mode !== gui.MODE_FUNNY;
        } else {
            return false; // abstract HTMLDocument might adopt DOM combos
        }
    });

    /**
     * Sugar for combo readability.
     * @param {function} action
     * @returns {function}
     */
    var otherwise = function(action) {
        return action;
    };


    return { // Public ...........................................................

        appendChild: function(base) {
            return (
                ifEnabled(
                    ifSerious(
                        ifEmbedded(spiritualizeAfter(suspending(base)),
                            otherwise(base)),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        insertBefore: function(base) {
            return (
                ifEnabled(
                    ifSerious(
                        ifEmbedded(spiritualizeAfter(suspending(base)),
                            otherwise(base)),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        replaceChild: function(base) { // TODO: detach instead
            return (
                ifEnabled(
                    ifEmbedded(materializeOldBefore(
                            ifSerious(
                                spiritualizeNewAfter(suspending(base)),
                                otherwise(suspending(base)))),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        insertAdjecantHTML: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(
                        ifSerious(
                            spiritualizeAdjecantAfter(suspending(base)),
                            otherwise(suspending(base)))),
                    otherwise(base)),
                otherwise(base)
            );
        },
        removeChild: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(detachBefore(suspending(base)), // detachBefore suspended for flex hotfix!
                        otherwise(base)),
                    otherwise(base))
            );
        },
        setAttribute: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(
                        ifSpirit(setAttBefore(base),
                            otherwise(base)),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        removeAttribute: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(
                        ifSpirit(delAttBefore(base),
                            otherwise(base)),
                        otherwise(base)),
                    otherwise(base))
            );
        },


        // Disabled pending http://code.google.com/p/chromium/issues/detail?id=13175

        innerHTML: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(materializeSubBefore(spiritualizeSubAfter(suspending(base))),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        outerHTML: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(materializeThisBefore(spiritualizeParentAfter(suspending(base))),
                        otherwise(base)),
                    otherwise(base))
            );
        },
        textContent: function(base) {
            return (
                ifEnabled(
                    ifEmbedded(materializeSubBefore(suspending(base)),
                        otherwise(base)),
                    otherwise(base))
            );
        }
    };

}());



/**
 * Tweening away.
 */
gui.Tween = (function using(confirmed, chained) {

    return gui.Class.create(Object.prototype, {

        /**
         * Tween type.
         * @type {string}
         */
        type: null,

        /**
         * Default duration.
         * @type {number} Time in in milliseconds.
         */
        duration: 200,

        /**
         * Equivalent to transition-timing-function.
         * @type {number}
         */
        timing: 'none',

        /**
         * Optional tween data. Don't use!
         * @deprecated
         * @type {object}
         */
        data: null,

        /**
         * Between zero and one.
         * @type {number}
         */
        value: 0,

        /**
         * True when value is zero.
         * @type {Boolean}
         */
        init: true,

        /**
         * True when value is one.
         * @type {boolean}
         */
        done: false,

        /**
         * @param {string} type
         * @param @optional {object} config
         * @param @optional {object} data
         */
        onconstruct: function(type, config, data) {
            this.type = type;
            this.data = (data !== undefined ? data : null);
            if (config) {
                if (config.duration !== undefined) {
                    this.duration = config.duration;
                }
                if (config.timing !== undefined) {
                    this.timing = config.timing;
                }
            }
        }


    }, {}, { // Static ...........................................................

        /** 
         * Coordinate tween.
         * @param {string} type
         * @param @optional {object} config
         * @param @optional {object} data
         * @returns {gui.Tween} but why?
         */
        dispatch: function(type, config, data) {
            var tween = new gui.Tween(type, config, data);
            var timer = window.performance || Date;
            var start = timer.now();

            function step() {
                var value = 1;
                var time = timer.now();
                var progress = time - start;
                if (progress < tween.duration) {
                    value = progress / tween.duration;
                    if (tween.timing !== 'none') {
                        value = value * 90 * Math.PI / 180;
                        switch (tween.timing) {
                            case 'ease-in':
                                value = 1 - Math.cos(value);
                                break;
                            case 'ease-out':
                                value = Math.sin(value);
                                break;
                        }
                    }
                }
                if (value === 1) {
                    tween.value = 1;
                    tween.done = true;
                } else {
                    tween.value = value;
                    requestAnimationFrame(step);
                    if (value > 0) {
                        tween.init = false;
                    }
                }
                gui.Broadcast.dispatch(gui.BROADCAST_TWEEN, tween);
            }
            step(start);
            return tween;
        }

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/**
 * Tracking tweens.
 * TODO: Support 'handler' typeument!
 * @extends {gui.Tracker}
 * @using {gui.Combo.chained}
 * @using {gui.Arguments.confirmed}
 */
gui.TweenPlugin = (function using(chained, confirmed) {

    return gui.Tracker.extend({

        /**
         * Add tween listener(s).
         * @param {String|Array<String>} type
         * @returns {gui.TweenPlugin}
         */
        add: chained(confirmed("string")(function(type) {
            gui.Array.make(type).forEach(function(type) {
                if (this._addchecks(type)) {
                    gui.Broadcast.add(gui.BROADCAST_TWEEN, this);
                }
            }, this);
        })),

        /**
         * Remove tween listener(s).
         * @param {String|Array<String>} type
         * @returns {gui.TweenPlugin}
         */
        remove: chained(confirmed("string")(function(type) {
            gui.Array.make(type).forEach(function(type) {
                if (this._removechecks(type)) {
                    gui.Broadcast.remove(gui.BROADCAST_TWEEN, this);
                }
            }, this);
        })),

        /**
         * Dispatch tween(s).
         * @param {String|Array<String>} type
         * @param @optional {object} options Configure timing etc.
         * @param @optional {object} data Optional data thingy
         * @returns {gui.Tween} TODO: Don't return anything!!!
         */
        dispatch: confirmed("string")(function(type, options, data) {
            var result = null;
            gui.Array.make(type).forEach(function(type) {
                result = gui.Tween.dispatch(type, options, data);
            }, this);
            return result;
        }),

        /**
         * Add tween listener and dispatch this tween.
         * TODO: We have to find a different setup for this, 
         *       at least we have to change this method name.
         * @param {String|Array<String>} type
         * @param @optional {object} options Configure timing etc.
         * @param @optional {object} data Optional data thingy
         * @returns {gui.Tween}
         */
        addDispatch: function(type, options, data) {
            return this.add(type).dispatch(type, options, data);
        },

        /**
         * Handle broadcast.
         * @param {gui.Broadcast} b
         */
        onbroadcast: function(b) {
            switch (b.type) {
                case gui.BROADCAST_TWEEN:
                    var tween = b.data;
                    if (this._containschecks(tween.type)) {
                        if (!this.spirit.life.destructed) {
                            this.spirit.ontween(tween);
                        }
                    }
                    break;
            }
        },

        /**
         * [ondestruct description]
         * @return {[type]} [description]
         */
        ondestruct: function() {
            gui.Broadcast.remove(gui.BROADCAST_TWEEN, this);
            this._super.ondestruct();
        }

    });

}(gui.Combo.chained, gui.Arguments.confirmed));



/**
 * Experimental CSS transitioning plugin. Work in progress.
 * @extends {gui.Plugin}
 * @TODO Just add the transitonend listener on construct?
 */
gui.TransitionPlugin = gui.Plugin.extend({

    /**
     * Handle event.
     * @type {TransitionEvent} e
     */
    onevent: function(e) {
        if (e.type === this._endevent && e.target === this.spirit.element) {
            this._transitionend(e);
        }
    },

    /**
     * Set transition properties.
     * @param {String} props White-space separated list of CSS properties.
     * @returns {gui.TransitionPlugin}
     */
    property: function(props) {
        if (props) {
            this.spirit.css.set("-beta-transition-property", props);
        }
        return this._init();
    },

    /**
     * Set transition duration.
     * @param {object} time CSS-string or milliseconds as number.
     * @returns {gui.TransitionPlugin}
     */
    duration: function(time) {
        if (time) {
            time = gui.Type.isNumber(time) ? this._convert(time) : time;
            this.spirit.css.set("-beta-transition-duration", time);
        }
        return this._init();
    },

    /**
     * Set transition timing function.
     * @param {String} timing Bezier or keyword
     * @returns {gui.TransitionPlugin}
     */
    timing: function(timing) {
        if (timing) {
            this.spirit.css.set("-beta-transition-timing-function", timing);
        }
        return this._init();
    },

    /**
     * Ease in.
     * @returns {gui.TransitionPlugin}
     */
    easeIn: function() {
        return this.timing("ease-in");
    },

    /**
     * Ease out.
     * @returns {gui.TransitionPlugin}
     */
    easeOut: function() {
        return this.timing("ease-out");
    },

    /**
     * Ease in and out.
     * @returns {gui.TransitionPlugin}
     */
    easeInOut: function() {
        return this.timing("ease-in-out");
    },

    /**
     * Cubic-bezier.
     * @param {number} n1
     * @param {number} n2
     * @param {number} n3
     * @param {number} n4
     * @returns {gui.TransitionPlugin}
     */
    cubicBezier: function(n1, n2, n3, n4) {
        return this.timing("cubic-bezier(" + n1 + "," + n2 + "," + n3 + "," + n4 + ")");
    },

    /**
     * Suspend transitions.
     * @returns {gui.TransitionPlugin}
     */
    none: function() {
        return this.property("none");
    },

    /**
     * Cosmetically clear traces of transition from (inline) HTML.
     * @TODO: clear out the non transition related CSS declarations!
     */
    reset: function() {
        this.property("");
        this.timing("");
    },

    /**
     * Configure transition and run one or CSS updates. Any key in the config
     * argument that matches a method name in this plugin will be invoked with
     * the property value as argument; the rest will be treated as CSS updates.
     * @param {Map<String,object>} config
     * @returns {object}
     */
    run: function(config) {
        var css = Object.create(null);
        this._count = 0;
        gui.Object.each(config, function(key, value) {
            if (gui.Type.isFunction(this[key])) {
                this[key](value);
            } else {
                css[key] = value;
            }
        }, this);
        var now = this.spirit.css.compute("-beta-transition-property") === "none";
        var then = this._then = new gui.Then();
        // Firefox needs a break before setting the styles.
        // http://stackoverflow.com/questions/6700137/css-3-transitions-with-opacity-chrome-and-firefox
        var spirit = this.spirit;
        if ((this._count = Object.keys(css).length)) {
            setImmediate(function() {
                spirit.css.style(css);
                if (now && then) {
                    setImmediate(function() {
                        then.now(null); // don't wait for transitionend
                    });
                }
            });
        }
        return then;
    },


    // Private ..............................................................................

    /**
     * Default transition duration time milliseconds.
     * @TODO actually default this
     * @type {number}
     */
    _default: 1000,

    /**
     * Browsers's take on transitionend event name.
     * @type {String}
     */
    _endevent: null,

    /**
     * Hello.
     * @type {number}
     */
    _count: 0,

    /**
     * Monitor transitions using vendor-prefixed event name.
     * @TODO confirm VendorTransitionEnd on documentElement
     * @TODO Firefox is down
     * @TODO this.duration ( this._default )
     * @TODO this on static, not per instance
     * @returns {gui.TransitionPlugin}
     */
    _init: function() {
        if (this._endevent === null) {
            var names = {
                "webkit": "webkitTransitionEnd",
                "explorer": "transitionend",
                "gecko": "transitionend",
                "opera": "oTransitionEnd"
            };
            this._endevent = names[gui.Client.agent] || "transitionend";
            this.spirit.event.add(this._endevent, this.spirit.element, this);
        }
        return this;
    },

    /**
     * Execute and reset callback on transition end.
     * @param {TransitionEvent} e
     */
    _transitionend: function(e) {
        var t = new gui.Transition(e.propertyName, e.elapsedTime);
        this._ontransition(t);
        this.spirit.ontransition(t);
    },

    /**
     * Invoke callback when properties transitioned via run() has finished.
     * @param  {gui.Transition} t
     */
    _ontransition: function(t) {
        if (--this._count === 0) {
            this._now();
        }
    },

    /**
     * Now what.
     */
    _now: function() {
        var then = this._then;
        if (then) {
            then.now(null); // don't wait for transitionend
        }
    },

    /**
     * Compute milliseconds duration in CSS terms.
     * @param @optional {number} ms Duration in milliseconds
     * @returns {String} Duration as string
     */
    _convert: function(ms) {
        ms = ms ? ms : this._default;
        return ms / 1000 + "s";
    }

});



/**
 * Details for ended CSS transition.
 * @param {String} propertyName
 * @param {number} elapsedTime
 */
gui.Transition = function(propertyName, elapsedTime) {
    this.duration = Math.round(elapsedTime / 1000);
    this.type = propertyName;
};

gui.Transition.prototype = {

    /**
     * Property that finished transitioning ("width","height").
     * @TODO un-camelcase this to CSS syntax.
     * @TODO adjust vendor prefix to "beta".
     * @type {String}
     */
    type: null,

    /**
     * Elapsed time in milliseconds. This may
     * not be identical to the specified time.
     * @type {number}
     */
    duration: 0
};



/**
 * Visibility is an abstract status. When you mark a spirit as visible or 
 * invisible, the methods `onvisible` or `oninvisible` will be called on 
 * spirit and descendants. Current visibility status can be read in the 
 * {gui.LifePlugin}: `spirit.life.visible`. Visibility is resolved async, 
 * so this property is `undefined` on startup. If you need to take an action 
 * that depends on visibility, just wait for `onvisible` to be invoked.
 * @TODO: Could document.elementFromPoint() be used to detect hidden stuff?
 * @TODO: hook this up to http://www.w3.org/TR/page-visibility/
 * @TODO: Make sure that visibility is updated after `appendChild`
 * @extends {gui.Plugin}
 * @using {gui.Combo.chained}
 */
gui.VisibilityPlugin = (function using(chained) {

    return gui.Plugin.extend({

        /**
         * Mark spirit visible.
         * @returns {gui.VisibilityPlugin}
         */
        on: chained(function() {
            gui.VisibilityPlugin.on(this.spirit);
        }),

        /**
         * Mark spirit invisible.
         * @returns {gui.VisibilityPlugin}
         */
        off: chained(function() {
            gui.VisibilityPlugin.off(this.spirit);
        })


    }, {}, { // Static ...........................................................

        /**
         * Mark spirit visible. This will remove the `._gui-invisible`
         * classname and invoke `onvisible` on spirit and descendants.
         * Once visibility has been resolved on startup, the target
         * spirit must be marked invisible for this to have effect.
         * @param {gui.Spirit} spirit
         */
        on: function(spirit) {
            var classname = gui.CLASS_INVISIBLE;
            if (spirit.life.visible === undefined || spirit.css.contains(classname)) {
                spirit.css.remove(classname);
                this._go(spirit, true);
            }
        },

        /**
         * Mark spirit invisible. This will append the `._gui-invisible`
         * classname and invoke `oninvisible` on spirit and descendants.
         * @param {gui.Spirit} spirit
         */
        off: function(spirit) {
            var classname = gui.CLASS_INVISIBLE;
            switch (spirit.life.visible) {
                case true:
                case undefined:
                    spirit.css.add(classname);
                    this._go(spirit, false);
                    break;
            }
        },


        // Privileged static .......................................................

        /**
         * Initialize spirit visibility.
         * @TODO again after `appendChild` to another position.
         * Invoked by the {gui.Guide}.
         * @param {gui.Spirit} spirit
         */
        $init: function(spirit) {
            this._go(spirit, !this._invisible(spirit));
        },


        // Private static ..........................................................

        /**
         * Spirit is invisible? The point here is to not evaluate these potentially
         * costly selectors for all new spirits, so do prefer not to use this method.
         * Wait instread for methods `onvisible` and `oninvisible` to be invoked.
         * @param {gui.Spirit} spirit
         * @returns {boolean}
         */
        _invisible: function(spirit) {
            return spirit.css.contains(gui.CLASS_INVISIBLE) ||
                spirit.css.matches("." + gui.CLASS_INVISIBLE + " *");
        },

        /**
         * Recursively update spirit and descendants visibility.
         * @param {gui.Spirit} first
         * @param {boolean} show
         */
        _go: function(first, visible) {
            var type = visible ? gui.CRAWLER_VISIBLE : gui.CRAWLER_INVISIBLE;
            new gui.Crawler(type).descendGlobal(first, {
                handleSpirit: function(spirit) {
                    var init = spirit.life.visible === undefined;
                    if (spirit !== first && spirit.css.contains(gui.CLASS_INVISIBLE)) {
                        return gui.Crawler.SKIP_CHILDREN;
                    } else if (visible) {
                        if (!spirit.life.visible || init) {
                            spirit.life.visible = true;
                            spirit.life.dispatch(gui.LIFE_VISIBLE); // TODO: somehow after the fact!
                            spirit.onvisible();
                        }
                    } else {
                        if (spirit.life.visible || init) {
                            spirit.life.visible = false;
                            spirit.life.dispatch(gui.LIFE_INVISIBLE);
                            spirit.oninvisible();
                        }
                    }
                }
            });
        }

    });

}(gui.Combo.chained));



/**
 * It's the layout module.
 */
gui.module("layout@wunderbyte.com", {

    /**
     * Assign plugins to prefixes for all {gui.Spirit}.
     */
    plugin: {
        "tween": gui.TweenPlugin,
        "transition": gui.TransitionPlugin,
        "visibility": gui.VisibilityPlugin
    },

    /**
     * Methods added to {gui.Spirit.prototype}
     */
    mixin: {

        /**
         * Handle tween.
         * @param {gui.Tween}
         */
        ontween: function(tween) {},

        /**
         * Handle transiton end.
         * @param {gui.TransitionEnd} transition
         */
        ontransition: function(transition) {},

        /**
         * Handle visibility.
         */
        onvisible: function() {},

        /**
         * Handle invisibility.
         */
        oninvisible: function() {}
    }

});



/**
 * Facilitate flexbox-like layouts in IE9
 * provided a fixed classname structure.
 * @extends {gui.Plugin}
 */
gui.FlexPlugin = gui.Plugin.extend({

    /**
     * Flex this and descendant flexboxes in document order.
     */
    reflex: function() {
        gui.FlexPlugin.reflex(this.spirit.element);
    },

    /**
     * Remove inline (emulated) styles.
     */
    unflex: function() {
        gui.FlexPlugin.unflex(this.spirit.element);
    },

    /**
     * Hejsa med dig.
     */
    enable: function() {
        gui.FlexPlugin.enable(this.spirit.element);
    },

    /**
     * Hejsa med dig.
     */
    disable: function() {
        gui.FlexPlugin.disable(this.spirit.element);
    }


}, {}, { // Static ................................................

    /**
     * Flex this and descendant flexboxes in document order.
     * @param {Element} elm
     */
    reflex: function(elm) {
        if (this._emulated(elm)) {
            this._crawl(elm, "flex");
        }
    },

    /**
     * Remove inline (emulated) styles.
     * @param {Element} elm
     * @param @optional {boolean} hotswap Switching from emulated to native?
     */
    unflex: function(elm, hotswap) {
        if (this._emulated(elm) || hotswap) {
            this._crawl(elm, "unflex");
        }
    },

    /**
     * Hejsa med dig.
     * @param {Element} elm
     */
    enable: function(elm) {
        this._crawl(elm, "enable");
        if (this._emulated(elm)) {
            this.reflex(elm);
        }
    },

    /**
     * Hejsa med dig.
     * @param {Element} elm
     */
    disable: function(elm) {
        if (this._emulated(elm)) {
            this.unflex(elm);
        }
        this._crawl(elm, "disable");
    },


    // Private static ........................................................

    /**
     * Element context runs in emulated mode?
     * @param {Element} elm
     * @returns {boolean}
     */
    _emulated: function(elm) {
        var doc = elm.ownerDocument;
        var win = doc.defaultView;
        return win.gui.flexmode === gui.FLEXMODE_EMULATED;
    },

    /**
     * Flex / disable / unflex element and descendants.
     * @param {Element} elm
     * @param {String} action
     */
    _crawl: function(elm, action) {
        var disabled = action === "enable";
        if (this._shouldflex(elm, disabled)) {
            var boxes = this._getflexboxes(elm, disabled);
            boxes.forEach(function(box) {
                box[action]();
            });
        }
    },

    /**
     * Element is flexbox or contains flexible stuff?
     * @param {Element} elm
     * @returns {boolean}
     */
    _shouldflex: function(elm, disabled) {
        return elm.nodeType === Node.ELEMENT_NODE &&
            this._isflex(elm, disabled) ||
            this._hasflex(elm, disabled);
    },

    /**
     * Element is (potentially disabled) flexbox?
     * @param {Element} elm
     * @param {boolean} disabled
     * @return {boolean}
     */
    _isflex: function(elm, disabled) {
        return ["ts-flexrow", "ts-flexcol"].some(function(name) {
            name = name + (disabled ? "-disabled" : "");
            return gui.CSSPlugin.contains(elm, name);
        });
    },

    /**
     * Element contains flexbox(es)?
     * @param {Element} elm
     * @param {boolean} disabled
     * @return {boolean}
     */
    _hasflex: function(elm, disabled) {
        return ["ts-flexrow", "ts-flexcol"].some(function(name) {
            name = name + (disabled ? "-disabled" : "");
            return elm.querySelector("." + name);
        });
    },

    /**
     * Collect descendant-and-self flexboxes.
     * @param @optional {Element} elm
     * @returns {Array<gui.FlexBox>}
     */
    _getflexboxes: function(elm, disabled) {
        var display, boxes = [];
        new gui.Crawler("flexcrawler").descend(elm, {
            handleElement: function(elm) {
                try {
                    display = gui.CSSPlugin.compute(elm, "display");
                } catch (geckoexception) { // probably display:none
                    return gui.Crawler.STOP;
                }
                if (display === "none") {
                    return gui.Crawler.SKIP_CHILDREN;
                } else if (gui.FlexPlugin._isflex(elm, disabled)) {
                    boxes.push(new gui.FlexBox(elm));
                }
            }
        });
        return boxes;
    }

});



/**
 * Computer for flexbox.
 * @param {Element} elm
 */
gui.FlexBox = function FlexBox(elm) {
    this._onconstruct(elm);
};

gui.FlexBox.prototype = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.FlexBox]";
    },

    /**
     * Flex everything using inline styles.
     */
    flex: function() {
        this._flexself();
        this._flexchildren();
        this._flexcorrect();
    },

    /**
     * Remove *all* inline styles from flexbox element.
     */
    unflex: function() {
        this._element.removeAttribute("style");
        this._children.forEach(function(child) {
            child.unflex();
        });
    },

    /**
     * Disable flex (perhaps to fit a mobile screen).
     */
    disable: function() {
        this._enable(false);
    },

    /**
     * Enable flex.
     */
    enable: function() {
        this._enable(true);
    },


    // Private ................................................................

    /**
     * Flexbox element.
     * @type {Element}
     */
    _element: null,

    /**
     * Flexed children.
     * @type {Array<Element>}
     */
    _children: null,

    /**
     * Vertical flexbox?
     * @type {boolean}
     */
    _flexcol: false,

    /**
     * Loosen up to contain content.
     * @type {Boolean}
     */
    _flexlax: false,

    /**
     * Constructor.
     * @param {Element} elm
     */
    _onconstruct: function(elm) {
        this._element = elm;
        this._flexcol = this._hasclass("ts-flexcol");
        this._flexlax = this._hasclass("ts-flexlax");
        this._children = this._collectchildren(elm);
    },

    /**
     * Collecting children that are not hidden.
     * @todo Discompute absolute and floated (vertical) children
     * @param {Element} elm
     * @return {Array<gui.FlexChild>}
     */
    _collectchildren: function(elm) {
        return Array.filter(elm.children, function(child) {
            return this._shouldflex(child);
        }, this).map(function(child) {
            return new gui.FlexChild(child);
        });
    },

    /**
     * Flex the container. Tick.next solves an issue with _relaxflex that
     * would manifest when going from native to emulated layout (but not
     * when starting out in emulated), this setup would better be avoided.
     * Note to self: Bug is apparent in demo "colspan-style variable flex"
     */
    _flexself: function() {
        var elm = this._element;
        if (this._flexcol && this._flexlax) {
            this._relaxflex(elm); // first time to minimize flashes in FF (does it work?)
            gui.Tick.next(function() { // second time to setup expected layout
                this._relaxflex(elm);
            }, this);
        }
    },

    /**
     * Relax flex to determine whether or not to maxheight (own) element.
     * @param {Element} elm
     */
    _relaxflex: function(elm) {
        var style = elm.style;
        var given = style.height;
        var above = elm.parentNode;
        var avail = above.offsetHeight;
        style.height = "auto";
        if (elm.offsetHeight < avail) {
            style.height = given || "100%";
        }
    },

    /**
     * Flex the children.
     */
    _flexchildren: function() {
        var flexes = this._childflexes();
        var factor = this._computefactor(flexes);
        if (flexes.length) {
            var unit = 100 / flexes.reduce(function(a, b) {
                return a + b;
            });
            this._children.forEach(function(child, i) {
                if (flexes[i] > 0) {
                    var percentage = flexes[i] * unit * factor;
                    child.setoffset(percentage, this._flexcol);
                }
            }, this);
        }
    },

    /**
     * Eliminate spacing between inline-block children. Potentially
     * adds a classname "_flexcorrect" to apply negative left margin.
     * @see {gui.FlexCSS}
     */
    _flexcorrect: function() {
        if (!this._flexcol) {
            this._children.forEach(function(child, i) {
                if (i > 0) {
                    child.flexcorrect();
                }
            });
        }
    },

    /**
     * Collect child flexes. Disabled members enter as 0.
     * @return {Array<number>}
     */
    _childflexes: function() {
        return this._children.map(function(child) {
            return child.getflex();
        }, this);
    },

    /**
     * Get modifier for percentage widths
     * accounting for fixed width members.
     * @param {<Array<number>} flexes
     * @return {number} Between 0 and 1
     */
    _computefactor: function(flexes) {
        var all, cut, factor = 1;
        if (flexes.indexOf(0) > -1) {
            all = cut = this._getoffset();
            this._children.forEach(function(child, i) {
                cut -= flexes[i] ? 0 : child.getoffset(this._flexcol);
            }, this);
            factor = cut / all;
        }
        return factor;
    },

    /**
     * Get width or height of element (depending on flexbox orientation).
     * @returns {number} Offset in pixels
     */
    _getoffset: function() {
        var elm = this._element;
        if (this._flexcol) {
            return elm.offsetHeight;
        } else {
            return elm.offsetWidth;
        }
    },

    /**
     * Enable/disable flex classname. Child element flexN classname
     * becomes disabled by being scoped to flexrow or flexcol class.
     * @param {boolean} enable
     */
    _enable: function(enable) {
        var name, next, elm = this._element,
            css = gui.CSSPlugin;
        ["ts-flexrow", "ts-flexcol"].forEach(function(klass) {
            name = enable ? klass + "-disabled" : klass;
            next = enable ? klass : klass + "-disabled";
            if (css.contains(elm, name)) {
                css.remove(elm, name).add(elm, next);
            }
        });
    },

    /**
     * Should child element be fed to computer for emulated mode?
     * @todo Position absolute might qualify for exclusion...
     * @param {Element} elm
     * @returns {boolean}
     */
    _shouldflex: function(elm) {
        return gui.CSSPlugin.compute(elm, "display") !== "none";
    },

    /**
     * Has classname?
     * @param {String} name
     * @returns {String}
     */
    _hasclass: function(name) {
        return gui.CSSPlugin.contains(this._element, name);
    }
};



/**
 * Computer for flexbox child.
 * @param {Element} elm
 */
gui.FlexChild = function FlexChild(elm) {
    this._element = elm;
};

gui.FlexChild.prototype = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.FlexChild]";
    },

    /**
     * Get flex value for element. We use the flexN classname to markup this.
     * @returns {number}
     */
    getflex: function() {
        var flex = 0;
        this._element.className.split(" ").forEach(function(name) {
            if (gui.FlexChild._FLEXNAME.test(name)) {
                flex = (gui.FlexChild._FLEXRATE.exec(name) || 1);
            }
        });
        return gui.Type.cast(flex);
    },

    /**
     * Get width or height of element depending on flexbox orientation.
     * @param {boolean} vertical
     * @returns {number} Offset in pixels
     */
    getoffset: function(vertical) {
        var elm = this._element;
        if (vertical) {
            return elm.offsetHeight;
        } else {
            return elm.offsetWidth;
        }
    },

    /**
     * Set percentage width|height of element.
     * @param {number} pct
     * @param {boolean} vertical
     */
    setoffset: function(pct, vertical) {
        var prop = vertical ? "height" : "width";
        this._element.style[prop] = pct + "%";
    },

    /**
     * Remove *all* inline styles from flexchild element.
     */
    unflex: function() {
        this._element.removeAttribute("style");
    },

    /**
     * Potentially adds a classname "_flexcorrect" to apply negative left margin.
     * @todo Measure computed font-size and correlate to negative margin value.
     */
    flexcorrect: function() {
        var elm = this._element;
        if (elm.previousSibling.nodeType === Node.TEXT_NODE) {
            gui.CSSPlugin.add(elm, gui.FlexChild._FLEXCORRECT);
        }
    },

    // Private .........................................................

    /**
     * Flexchild element.
     * @type {Element}
     */
    _element: null,

    /**
     * @param {boolean} enable
     */
    _enable: function(enable) {
        var name, next, elm = this._element,
            css = gui.CSSPlugin;
        this._element.className.split(" ").forEach(function(klass) {
            name = enable ? klass + "-disabled" : klass;
            next = enable ? klass : klass + "-disabled";
            if (gui.FlexChild._FLEXNAME.test(klass)) {
                if (css.contains(elm, name)) {
                    css.remove(elm, name).add(elm, next);
                }
            }
        });
    }

};


// Static ......................................................................

/**
 * Classname applies negative left margin to counter
 * horizontal spacing on inline-block elements.
 * @type {String}
 */
gui.FlexChild._FLEXCORRECT = "_ts-flexcorrect";

/**
 * Check for flexN classname or simply 'flex' (to signify 'flex1').
 * @type {RegExp}
 */
gui.FlexChild._FLEXNAME = /^ts-flex\d*$/;

/**
 * Extract N from classname (eg .ts-flex23).
 * @type {RegExp}
 */
gui.FlexChild._FLEXRATE = /\d+/;



/**
 * CSS injection manager.
 */
gui.FlexCSS = {

    /**
     * Inject styles on startup? Set this to false if you
     * prefer to manage these things in a real stylesheet:
     * <meta name="gui.FlexCSS.injected" content="false"/>
     * @type {boolean}
     */
    injected: true,

    /**
     * Generating 10 unique classnames. For native flex only;
     * emulated flex reads the value from the class attribute.
     * @type {number}
     */
    maxflex: 10,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object gui.FlexCSS]";
    },

    /**
     * Inject stylesheet in context. For debugging purposes
     * we support a setup to dynamically switch the flexmode.
     * @param {Window} context
     * @param {String} mode
     */
    load: function(context, mode) {
        if (this.injected) {
            var sheets = this._getsheets(context.gui.$contextid);
            if (sheets && sheets.mode) {
                sheets[sheets.mode].disable();
            }
            if (sheets && sheets[mode]) {
                sheets[mode].enable();
            } else {
                var doc = context.document,
                    ruleset = this[mode];
                var css = sheets[mode] = gui.StyleSheetSpirit.summon(doc, null, ruleset);
                doc.querySelector("head").appendChild(css.element);
            }
            sheets.mode = mode;
            context.gui.flexloaded = true;
        }
    },

    /**
     * Don't reference dead spirits.
     * @param {Window} context
     */
    unload: function(context) {
        delete this._sheets[context.gui.$contextid];
    },


    // Private .......................................................................

    /**
     * Elaborate setup to track stylesheets injected into windows.
     * This allows us to flip the flexmode for debugging purposes.
     * It is only relevant for multi-window setup; we may nuke it.
     * @type {Map<String,object>}
     */
    _sheets: Object.create(null),

    /**
     * Get stylesheet configuration for window.
     * @param {String} sig
     * @returns {object}
     */
    _getsheets: function(sig) {
        var sheets = this._sheets;
        if (!sheets[sig]) {
            sheets[sig] = {
                "emulated": null, // {gui.StyleSheetSpirit}
                "native": null, // {gui.StyleSheetSpirit}
                "mode": null // {String}
            };
        }
        return sheets[sig];
    }
};

/**
 * Emulated ruleset.
 * @todo Attempt all this using floats instead of inline-block and table layouts.
 */
gui.FlexCSS.emulated = {
    ".ts-flexrow, .ts-flexcol": {
        "display": "block"
        //"width" : "100%", // @TODO must go back
        //"height" : "100%" // @TODO must go back
    },
    ".ts-flexcol": {
        "height": "100%"
    },
    /*
    ".ts-flexcol > .ts-flexrow" : { // hmm...
        "height" : "100%"
    },
    */
    ".ts-flexrow": {
        "white-space": "nowrap"
    },
    ".ts-flexrow > *": {
        "display": "inline-block",
        "vertical-align": "top",
        "white-space": "normal",
        "height": "100%"
    },
    ".ts-flexrow > ._ts-flexcorrect": {
        "margin": "0 0 0 -4px !important" // @TODO correlate to computed font-size :)
    },
    ".ts-flexcol > *": {
        "display": "block",
        // "width" : "100%" ? is this needed (asides will expand!)???
    },
    ".ts-flexlax > .ts-flexrow": {
        "display": "table"
    },
    ".ts-flexlax > .ts-flexrow > *": {
        "display": "table-cell"
    }
};

/**
 * Native ruleset. Engine can't parse [*=xxxxx] selector (says DOM
 * exception), so let's just create one billion unique classnames.
 */
gui.FlexCSS["native"] = (function() {
    var rules = {
        ".ts-flexrow, .ts-flexcol": {
            "display": "-beta-flex",
            "-beta-flex-wrap": "nowrap"
        },
        ".ts-flexcol": {
            "-beta-flex-direction": "column",
            "min-height": "auto",
            "height": "100%"
        },
        ".ts-flexcol .ts-flexcol, .ts-flexrow .ts-flexcol": {
            "height": "auto"
        },
        ".ts-flexrow": {
            "-beta-flex-direction": "row",
            "min-width": "auto",
            "width": "100%"
        },
        ".ts-flexcol .ts-flexrow, .ts-flexrow .ts-flexrow": {
            "width": "auto"
        },
        ".ts-flexrow:not(.ts-flexlax) > *, .ts-flexcol:not(.ts-flexlax) > *": {
            "-beta-flex-basis": 1
        }
    };

    function declare(n) {
        rules[".ts-flexrow > .ts-flex" + n + ", .ts-flexcol > .ts-flex" + n] = {
            "-beta-flex-grow": n || 1
        };
        /*
        rules [ ".ts-flexrow:not(.ts-flexlax) > .ts-flex" + n ] = {
            "width" : "0"
        };
        rules [ ".ts-flexcol:not(.ts-flexlax) > .ts-flex" + n ] = {
            "height" : "0"
        };
        */
    }
    var n = -1,
        max = gui.FlexCSS.maxflex;
    while (++n <= max) {
        declare(n || "");
    }
    return rules;
}());



/**
 * Properties and methods to be mixed into the context-local {gui.Spiritual} instance.
 * @using {gui.Property#nonenumerable}
 */
gui.FlexMode = (function using(nonenumerable) {

    return {

        /**
         * Flipped on CSS injected.
         * @type {boolean}
         */
        flexloaded: nonenumerable({
            writable: true,
            value: false
        }),

        /**
         * Flexmode accessor. Note that flexmode exposes as either native or emulated (never optimized).
         * Note to self: enumerable false is to prevent portalling since this would portal the flexmode.
         */
        flexmode: nonenumerable({
            get: function() {
                // temp bypassing all flex for IE...
                var hakt = gui.Client.hasFlex && !gui.Client.isExplorer;
                var best = hakt ? gui.FLEXMODE_NATIVE : gui.FLEXMODE_EMULATED;
                return this._flexmode === gui.FLEXMODE_OPTIMIZED ? best : this._flexmode;
            },
            set: function(next) { // supports hotswapping for debugging
                this._flexmode = next;
                var best = gui.Client.hasFlex ? gui.FLEXMODE_NATIVE : gui.FLEXMODE_EMULATED;
                var mode = next === gui.FLEXMODE_OPTIMIZED ? best : next;
                gui.FlexCSS.load(window, mode);
                if (document.documentElement.spirit) { // @todo life cycle markers for gui.Spiritual
                    switch (mode) {
                        case gui.FLEXMODE_EMULATED:
                            this.reflex();
                            break;
                        case gui.FLEXMODE_NATIVE:
                            this.unflex();
                            break;
                    }
                }
            }
        }),

        /**
         * Flex everything.
         */
        reflex: nonenumerable({
            value: function(elm) {
                if (this.flexmode === this.FLEXMODE_EMULATED) {
                    gui.FlexPlugin.reflex(elm || document.body);
                }
            }
        }),

        /**
         * Remove flex (removes all inline styling on flexbox elements).
         */
        unflex: nonenumerable({
            value: function(elm) {
                gui.FlexPlugin.unflex(elm || document.body, true);
            }
        })
    };

}(gui.Property.nonenumerable));



gui.FLEXMODE_NATIVE = "native";
gui.FLEXMODE_EMULATED = "emulated";
gui.FLEXMODE_OPTIMIZED = "optimized";

/**
 * Provides a subset of flexible boxes that works in IE9
 * as long as flex is implemented using a predefined set
 * of classnames: flexrow, flexcol and flexN where N is
 * a number to indicate the flexiness of child elements.
 * @todo Reflex on window resize...
 * @see {gui.FlexCSS}
 */
gui.module("flex@wunderbyte.com", {

    /** 
     * Setup gui.FlexPlugin for all spirits. Spirits may
     * update subtree flex by using `this.flex.reflex()`
     */
    plugin: {
        flex: gui.FlexPlugin
    },

    /**
     * Setup flex control on the local "gui" object. Note that we  assign non-enumerable properties
     * to prevent the setup from being portalled into subframes (when running a multi-frame setup).
     */
    oncontextinitialize: function() {
        gui._flexmode = gui.FLEXMODE_OPTIMIZED;
        Object.defineProperties(gui, gui.FlexMode);
    },

    /**
     * Inject the relevant stylesheet (native or emulated) before startup spiritualization.
     * @todo Make sure stylesheet onload has fired to prevent flash of unflexed content?
     * @param {Window} context
     */
    onbeforespiritualize: function() {
        if (!gui.flexloaded) { // @see {gui.FlexCSS}
            gui.FlexCSS.load(window, gui.flexmode);
        }
        this._edbsetup(window);
    },

    /**
     * Flex everything on startup and resize.
     * @TODO put broadcast into if statement
     * @param {Window} context
     */
    onafterspiritualize: function() {
        var root = document.documentElement.spirit;
        if (gui.flexmode === gui.FLEXMODE_EMULATED) {
            try {
                gui.CSSPlugin.compute(root, "display");
                gui.reflex();
            } catch (geckoexception) {}
        }
        gui.Broadcast.addGlobal(gui.BROADCAST_RESIZE_END, {
            onbroadcast: function() {
                if (gui.flexmode === gui.FLEXMODE_EMULATED) {
                    gui.reflex();
                }
            }
        });
    },

    /**
     * Cleanup on window unload.
     * @param {Window} context
     */
    oncontextunload: function() {
        gui.FlexCSS.unload(window);
    },


    // Private ...................................................

    /*
     * Bake reflex into EDBML updates to catch flex related attribute updates etc.
     * (by default we only reflex whenever DOM elements get inserted or removed)
     * @todo Suspend default flex to only flex once
     */
    _edbsetup: function() {
        if (gui.hasModule("edbml@wunderbyte.com")) {
            var script = edbml.ScriptPlugin.prototype;
            gui.Function.decorateAfter(script, "write", function() {
                if (this.spirit.window.gui.flexmode === gui.FLEXMODE_EMULATED) {
                    /* 
                     * @TODO: We think that some kind of DOM-hookin will do this
                     * again after some milliseconds, it should only happen once.
                     */
                    this.spirit.flex.reflex();
                }
            });
        }
    }

});

/**
 * Manage emulated flex whenever DOM elements get added and removed.
 * Mixing into 'gui.Guide._spiritualize' and 'gui.Guide._materialize'
 * @todo Both of these methods should be made public we presume...
 * @using {gui.Guide}
 */
(function decorate(guide) {

    /*
     * Flex subtree starting from the parent node of given node.
     * @param {Node|gui.Spirit} child
     */
    function flexparent(child) {
        var doc, win;
        child = child instanceof gui.Spirit ? child.element : child;
        doc = child.ownerDocument;
        win = doc.defaultView;
        if (win.gui.flexmode === gui.FLEXMODE_EMULATED) {
            //if ( gui.DOMPlugin.embedded ( child )) { // @TODO: this but not after removeChild!
            child = child === doc.documentElement ? child : child.parentNode;
            gui.Tick.next(function() {
                try {
                    gui.FlexPlugin.reflex(child);
                } catch (unloadedexception) {
                    // TODO: Don't go here
                }
            });
            //}
        }
    }

    /*
     * @TODO: public hooks for this kind of thing
     */
    ["_spiritualize", "_materialize"].forEach(function(method) {
        gui.Function.decorateAfter(guide, method, flexparent);
    });

}(gui.Guide));



/**
 * Key event summary.
 * @TODO check out http://mozilla.pettay.fi/moztests/events/browser-keyCodes.htm
 * @param {boolean} down
 * @param {number} n KeyCode
 * @param {number} c Character
 * @param {boolean} g Global?
 */
gui.Key = function Key(down, type, isglobal) {
    this.down = down;
    this.type = type;
    this.global = isglobal;
};

gui.Key.prototype = {

    /**
     * Key down? Otherwise up.
     * @type {boolean}
     */
    down: false,

    /**
     * Reducing 'key', 'char' and potentially 'keyCode' to a single string. If
     * the string length is greater than one, we are dealing with a special key.
     * @TODO: Note about the SPACE character - how exactly should we handle it?
     * @type {[type]}
     */
    type: null,

    /**
     * Global key?
     * @TODO Deprecate this?
     * @type {boolean}
     */
    global: false
};


// Static .........................................................................................

/**
 * Key modifiers.
 * @TODO: platform specific variations "accelDown" and "accessDown" (get a Mac and figure this out)
 * @TODO Update from http://askubuntu.com/questions/19558/what-are-the-meta-super-and-hyper-keys
 */
(function keymodifiers() {
    gui.Object.each({
        shiftDown: false, // The Shift key.
        ctrlDown: false, // The Control key.
        altDown: false, // The Alt key. On the Macintosh, this is the Option key
        metaDown: false, // The Meta key. On the Macintosh, this is the Command key.
        accelDown: false, // The key used for keyboard shortcuts on the user's platform. Usually, this would be the value you would use.
        accessDown: false // The access key for activating menus and other elements. On Windows, this is the Alt key, used in conjuction with an element's accesskey.
    }, function(key, value) {
        gui.Key[key] = value;
    });
}());

/**
 * Mapping DOM0 key codes to DOM3 key values. Note that keycodes aren't used on an API level.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#key-values
 */
(function keymappings() {
    gui.Key.$key = gui.Object.extend({

        // navigation

        38: "Up",
        40: "Down",
        37: "Left",
        39: "Right",

        // modifiers

        18: "Alt",
        17: "Control",
        16: "Shift",
        32: "Space",

        // extras

        27: "Esc",
        13: "Enter"

    }, Object.create(null));
}());

/*
"Alt"
"AltGraph"
"CapsLock"
"Control"
"Fn"
"FnLock"
"Meta"
"Process"
"NumLock"
"Shift"
"SymbolLock"
"OS"
"Compose"


/**
 * Create constant 'gui.Key.DOWN' to alias the string "Down" for those who prefer such a syntax.
 * @TODO Compute appropriate translation of pascal-case to underscores.
 */
(function keyconstants() {
    gui.Object.each(gui.Key.$key, function(key, value) {
        gui.Key[value.toUpperCase()] = value;
    });
}());



/**
 * These key codes "do not usually change" with keyboard layouts.
 * @TODO Read http://www.w3.org/TR/DOM-Level-3-Events/#key-values
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#fixed-virtual-key-codes
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#key-values-list
 *
( function keyconstants () {
    gui.Object.each ({
        BACKSPACE :	8,
        TAB	: 9,
        ENTER	: 13,
        SHIFT	: 16,
        CONTROL	: 17,
        ALT	: 18,
        CAPSLOCK : 20,
        ESCAPE : 27,
        SPACE	: 32,
        PAGE_UP	: 33,
        PAGE_DOWN	: 34,
        END	: 35,
        HOME : 36,
        LEFT : 37,
        UP : 38,
        RIGHT : 39,
        DOWN : 40,
        DELETE : 46
    }, function ( key, value ) {
        gui.Key [ key ] = value;
    });
}());
*/

/**
 * These codes are somewhat likely to match a US or European keyboard, 
 * but they are not listed in "do not usually change" section above. 
 *
( function questionablekeys () {
    gui.Object.each ({
        PLUS: 187,
        MINUS: 189,
        NUMPLUS: 107,
        NUMMINUS: 109
    }, function ( key, value ) {
        gui.Key [ key ] = value;
    });
}());
*/



/**
 * Tracking keys.
 * @extends {gui.Tracker}
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.KeyPlugin = (function using(confirmed, chained) {

    return gui.Tracker.extend({

        /**
         * Add one or more action handlers.
         * @param {Array<String,Number>|String|number} arg @TODO Strings!
         * @param @optional {object|function} handler
         * @returns {gui.KeyPlugin}
         */
        add: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.IKeyHandler, handler)) {
                    gui.Array.make(arg).forEach(function(a) {
                        if (this._addchecks(String(a), [handler, this._global])) {
                            this._setupbroadcast(true);
                        }
                    }, this);
                }
            })
        ),

        /**
         * Remove one or more action handlers.
         * @param {Array<String,Number>|String|number} arg
         * @param @optional {object} handler
         * @returns {gui.KeyPlugin}
         */
        remove: confirmed("array|string", "(object|function)")(
            chained(function(arg, handler) {
                handler = handler ? handler : this.spirit;
                if (gui.Interface.validate(gui.IKeyHandler, handler)) {
                    gui.Array.make(arg).forEach(function(a) {
                        if (this._removechecks(String(a), [handler, this._global])) {
                            if (!this._hashandlers()) {
                                this._setupbroadcast(false);
                            }
                        }
                    }, this);
                }
            })
        ),

        /**
         * Add handlers for global key(s).
         * @param {object} arg
         * @param @optional {gui.IKeyListener} handler (defaults to spirit)
         * @returns {gui.KeyPlugin}
         */
        addGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.add(arg, handler);
            });
        },

        /**
         * Add handlers for global keys(s).
         * @param {object} arg
         * @param @optional {gui.IKeyListener} handler (defaults to spirit)
         * @returns {gui.KeyPlugin}
         */
        removeGlobal: function(arg, handler) {
            return this._globalize(function() {
                return this.remove(arg, handler);
            });
        },

        /**
         * Handle broadcast.
         * @param {gui.Broadcast} b
         */
        onbroadcast: function(b) {
            var list, checks, handler, isglobal;
            if (b.type === gui.BROADCAST_KEYEVENT) {
                var down = b.data.down,
                    type = b.data.type;
                if ((list = (this._trackedtypes[type]))) {
                    list.forEach(function(checks) {
                        handler = checks[0];
                        isglobal = checks[1];
                        if (isglobal === b.global) {
                            handler.onkey(new gui.Key(down, type, isglobal));
                        }
                    });
                }
            }
        },


        // Private .....................................................................

        /**
         * Start and stop listening for broadcasted key event details.
         * @param {boolean} add
         */
        _setupbroadcast: function(add) {
            var act, sig = this.context.gui.$contextid;
            var type = gui.BROADCAST_KEYEVENT;
            if (this._global) {
                act = add ? "addGlobal" : "removeGlobal";
                gui.Broadcast[act](type, this);
            } else {
                act = add ? "add" : "remove";
                gui.Broadcast[act](type, this, sig);
            }
        },

        /**
         * Remove delegated handlers.
         * @TODO same as in gui.ActionPlugin, perhaps superize this stuff somehow...
         */
        _cleanup: function(type, checks) {
            var handler = checks[0],
                global = checks[1];
            if (global) {
                this.removeGlobal(type, handler);
            } else {
                this.remove(type, handler);
            }
        }

    });

}(gui.Arguments.confirmed, gui.Combo.chained));



/**
 * Interface KeyHandler
 */
gui.IKeyHandler = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object IKeyHandler]";
    },

    /**
     * Handle key
     * @param {gui.Key} key
     */
    onkey: function(key) {}
};



/**
 * Spirit of the key combo listener.
 * <meta content="key" value="Control s" onkey="alert(this)"/>
 */
gui.KeySpirit = gui.Spirit.extend({

    /**
     * Get ready.
     */
    onready: function() {
        this._super.onready();
        this._map = Object.create(null);
        this._setup();
    },

    /**
     * Handle key.
     * @param {gui.Key} key
     */
    onkey: function(key) {
        this._super.onkey(key);
        console.log(key.type);
        var map = this._map;
        map[key.type] = key.down;
        if (Object.keys(map).every(function(type) {
            //console.log ( type + ": " + map [ type ]);
            return map[type] === true;
        })) {
            console.log("fis!");
        }

    },

    // https://github.com/jeresig/jquery.hotkeys/blob/master/jquery.hotkeys.js
    // http://stackoverflow.com/questions/3845009/how-to-handle-ctrl-s-event-on-chrome-and-ie-using-jquery
    // http://stackoverflow.com/questions/11000826/ctrls-preventdefault-in-chrome
    // http://stackoverflow.com/questions/93695/best-cross-browser-method-to-capture-ctrls-with-jquery


    // Private ...........................................

    _map: null,

    /**
     * Parsing the 'key' attribute, setup key listeners.
     */
    _setup: function() {
        var key = this.att.get("key");
        if (key) {
            key.split(" ").forEach(function(token) {
                token = token.trim();
                this.key.addGlobal(token);
                this._map[token] = false;
            }, this);
        }
    }
});



/**
 * Keys module.
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
 * @TODO http://dev.opera.com/articles/view/functional-key-handling-in-opera-tv-store-applications/
 */
gui.KeysModule = gui.module("keys@wunderbyte.com", {

    /**
     * Channeling spirits to CSS selectors.
     */
    channel: [
        [".gui-key", gui.KeySpirit]
    ],

    /*
     * Plugins (for all spirits).
     * @TODO: combo
     */
    plugin: {
        "key": gui.KeyPlugin
    },

    /*
     * Mixins (for all spirits).
     */
    mixin: {

        /**
         * Handle key.
         * @param {gui.Key} key
         * @implements {gui.IKeyHandler}
         */
        onkey: function(key) {}
    },

    /**
     * Context init.
     * @param {Window} context
     */
    oncontextinitialize: function(context) {
        this._keymap = Object.create(null);
        ["keydown", "keypress", "keyup"].forEach(function(type) {
            context.document.addEventListener(type, this, false);
        }, this);
    },

    /**
     * Handle event.
     * @param {KeyEvent} e
     */
    handleEvent: function(e) {
        this._modifiers(e);
        this._oldschool(e);
        /*
        if ( gui.Type.isDefined ( e.repeat )) { // bypass DOM3 for now
            this._newschool ( e );
        } else {
            this._oldschool ( e );
        }
        */
    },


    // Private ..........................................................

    /**
     * Mapping keycodes to characters between keydown and keypress event.
     * @type {Map<number,String>}
     */
    _keymap: null,

    /*
     * Snapshot latest broadcast to prevent
     * doubles in mysterious Gecko cornercase.
     * @type {String}
     */
    _snapshot: null,


    /**
     * DOM3 style events. Skipped for now since Opera 12 appears
     * to fire all events repeatedly while key pressed, that correct?
     * Also, event.repeat is always false, that doesn't make sense...
     * @param {Event} e
     */
    _newschool: function(e) {},

    /**
     * Conan the Barbarian style events.
     * At least they suck in a known way.
     * @param {Event} e
     */
    _oldschool: function(e) {
        var n = e.keyCode,
            c = this._keymap[n],
            b = gui.BROADCAST_KEYEVENT;
        var id = e.currentTarget.defaultView.gui.$contextid;

        /*
        // TODO: THIS!
        if ( e.ctrlKey && gui.Key.$key [ e.keyCode ] !== "Control" ) {
            e.preventDefault ();
        }
        */

        switch (e.type) {
            case "keydown":
                if (c === undefined) {
                    this._keycode = n;
                    this._keymap[n] = null;
                    this._keymap[n] = String.fromCharCode(e.which).toLowerCase();
                    gui.Tick.next(function() {
                        c = this._keymap[n];
                        this._broadcast(true, null, c, n, id);
                        this._keycode = null;
                    }, this);
                }
                break;
            case "keypress":
                if (this._keycode) {
                    c = this._keychar(e.keyCode, e.charCode, e.which);
                    this._keymap[this._keycode] = c;
                }
                break;
            case "keyup":
                if (c !== undefined) {
                    this._broadcast(false, null, c, n, id);
                    delete this._keymap[n];
                }
                break;
        }
    },

    /**
     * Broadcast key details globally. Details reduced to a boolean 'down' and a 'type'
     * string to represent typed character (eg "b") or special key (eg "Shift" or "Alt").
     * Note that the SPACE character is broadcasted as the multi-letter type "Space" (TODO!)
     * @TODO what other pseudospecial keys are mapped to typed characters (like SPACE)?
     * @param {boolean} down
     * @param {String} key Newschool ABORTED FOR NOW
     * @param {String} c (char) Bothschool
     * @param {number} code Oldschool
     * @param {String} sig Contextkey
     */
    _broadcast: function(down, key, c, code, sig) {
        var type, msg, arg;
        type = gui.Key.$key[code] || c;
        type = type === " " ? gui.Key.SPACE : type;
        msg = gui.BROADCAST_KEYEVENT;
        arg = {
            down: down,
            type: type
        };
        /*
         * Never broadcast same message twice. Fixes something about Firefox
         * registering multiple keystrokes on certain chars (notably the 's').
         */
        var snapshot = JSON.stringify(arg);
        if (snapshot !== this._snapshot) {
            gui.Broadcast.dispatch(msg, arg, sig); // do we want this?
            gui.Broadcast.dispatchGlobal(msg, arg);
            this._snapshot = snapshot;
        }
    },

    /**
     * Update key modifiers state.
     * @TODO Cross platform abstractions "accelDown" and "accessDown"
     * @param {KeyEvent} e
     */
    _modifiers: function(e) {
        gui.Key.ctrlDown = e.ctrlKey;
        gui.Key.shiftDown = e.shiftKey;
        gui.Key.altDown = e.altKey;
        gui.Key.metaDown = e.metaKey;
    },

    /**
     * Get character for event details on keypress only.
     * Returns null for special keys such as arrows etc.
     * http://javascript.info/tutorial/keyboard-events
     * @param {number} n
     * @param {number} c
     * @param {number} which
     * @return {String}
     */
    _keychar: function(n, c, which) {
        if (which === null || which === undefined) {
            return String.fromCharCode(n); // IE (below 9 or what?)
        } else if (which !== 0 && c) { // c != 0
            return String.fromCharCode(which); // the rest
        }
        return null;
    }

});

/*
 * Register broadcast type.
 */
gui.BROADCAST_KEYEVENT = "gui-broadcast-keyevent";



}(self));