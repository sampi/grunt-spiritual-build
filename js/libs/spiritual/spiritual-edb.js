(function(window) {

"use strict";


/*
 * Namepace object.
 */
window.edb = gui.namespace("edb", {

    /**
     * Current version (injected during build process).
     * @see https://www.npmjs.org/package/grunt-spiritual-build
     * @type {string} (majorversion.minorversion.patchversion)
     */
    version: '0.1.6',

    /**
     * Logging some debug messages? This can be flipped via meta tag:
     * `<meta name="edb.debug" content="true"/>`
     * @type {boolean}
     */
    debug: false,

    /**
     * While true, any inspection of an {edb.Objects} or {edb.Arrays} 
     * will be be followed by a synchronous broadcast message (below).
     * @type {object}
     */
    $accessaware: false,

    /**
     * Broadcasts.
     */
    BROADCAST_ACCESS: "edb-broadcast-access",
    BROADCAST_CHANGE: "edb-broadcast-change",
    BROADCAST_OUTPUT: "edb-broadcast-output",
    BROADCAST_SCRIPT_INVOKE: "edb-broadcast-script-invoke",

    /**
     * Ticks.
     */
    TICK_SCRIPT_UPDATE: "edb-tick-script-update",
    TICK_COLLECT_INPUT: "edb-tick-collect-input",
    TICK_PUBLISH_CHANGES: "edb-tick-update-changes",

    /**
     * Get type from public output.
     * TODO: perhaps promisify this stuff?
     * @param {constructor} Type
     * @param @optional {function} callback
     * @param @optional {object} thisp
     * @returns {edb.Type}
     */
    get: function(Type, callback, thisp) {
        var input = edb.Output.$get(Type);
        if (input) {
            if (callback) {
                callback.call(thisp, input.data);
            }
            return input.data;
        } else if (callback) {
            console.error('TODO: callback support!');
        }
        return null;
    }

});



/**
 * Conceptual superclass for {edb.Object} and {edb.Array}.
 */
edb.Type = gui.Class.create(null, {

    /**
     * Called after $onconstruct (by `gui.Class` convention).
     */
    onconstruct: function() {},

    /**
     * Hello again.
     */
    ondestruct: function() {},

    /**
     * Output to context.
     * @returns {edb.Type}
     */
    output: function() {
        edb.Output.dispatch(this);
        return this;
    },

    /**
     * TODO: If this is even possible...
     */
    outputGlobal: function() {
        edb.Output.dispatchGlobal(this);
        return this;
    },

    /**
     * Revoke output.
     * @returns {edb.Type}
     */
    revoke: function() {
        edb.Output.revoke(this);
        return this;
    },

    /**
     * Garbage collect now, at least in theory.
     */
    dispose: function() {
        edb.Type.$destruct(this);
    },

    /**
     * Serialize to abstract EDB tree. Unlike `toJSON`, this
     * includes underscore and dollar prefixed properties.
     * It also features the the object-properties of arrays.
     * @param @optional {function} filter
     * @param @optional {String|number} tabs
     * @returns {String}
     */
    serializeToString: function(filter, tabs) {
        return new edb.Serializer().serializeToString(this, filter, tabs);
    },


    // Privileged ................................................................

    /**
     * Synchronization stuff ohoy. Matches the `$instanceid` of a `gui.Class`.
     * @type {String}
     */
    $originalid: null,

    /**
     * Flag destructed so that we don't overkill.
     * @type {boolean}
     */
    $destructed: false,

    /**
     * Called before `onconstruct`.
     */
    $onconstruct: function() {},

    /**
     * Called after `ondestruct`.
     */
    $ondestruct: function() {
        // TODO: This functionality should be provided 
        // by the states module (eg. not in the core).
        if (this.constructor.storage) {
            this.persist();
        }
    }

});


// Static ......................................................................

edb.Type.mixin(null, null, {
    
    /**
     * Something is an instance of {edb.Object} or {edb.Array}?
     * Note: these both inherit an `is` method from `gui.Class`
     * @param {object} o
     * @returns {boolean}
     */
    is: function(o) {
        return edb.Object.is(o) || edb.Array.is(o);
    },

    /**
     * Something is a Type constructor?
     * @param {object} o
     * @returns {boolean}
     */
    isConstructor: function(o) {
        return gui.Type.isGuiClass(o) &&
            gui.Class.ancestorsAndSelf(o).some(function(C) {
                return C === edb.Object || C === edb.Array;
            });
    },

    /**
     * Lookup edb.Type constructor for argument (if not already an edb.Type).
     * TODO: Confirm that it is actually an edb.Type thing...
     * @param {Window|WorkerGlobalScope} arg
     * @param {function|string} arg
     * @returns {function}
     */
    lookup: function(context, arg) {
        var type = null;
        switch (gui.Type.of(arg)) {
            case "function":
                type = arg; // TODO: confirm
                break;
            case "string":
                type = gui.Object.lookup(arg, context);
                break;
            case "object":
                console.error(this + ": expected edb.Type constructor (not an object)");
                break;
        }
        if (!type) {
            throw new TypeError("The type \"" + arg + "\" does not exist");
        }
        return type;
    },

    /**
     * @param {object} value
     */
    cast: function fix(value) {
        if (gui.Type.isComplex(value) && !edb.Type.is(value)) {
            switch (gui.Type.of(value)) {
                case "object":
                    return edb.Object.from(value);
                case "array":
                    return edb.Array.from(value);
            }
        }
        return value;
    },

    /**
     * Apply mixins to both {edb.Object} and {edb.Array}.
     * @param {object} mixins
     */
    mixin: function(protos, xstatics, statics) {
        [edb.Object, edb.Array].forEach(function(Type) {
            Type.mixin(protos, xstatics, statics);
        });
    },


    // Privileged ................................................................

    /**
     * @param {edb.Object|edb.Array} type
     * @param {edb.IChangeHandler} handler
     * @returns {edb.Object}
     */
    $observe: function(type, handler) {
        var id = type.$instanceid;
        var obs = this._observers;
        var handlers = obs[id] || (obs[id] = []);
        if (handlers.indexOf(handler) === -1) {
            handlers.push(handler);
        }
        return type;
    },

    /**
     * @param {edb.Object} type
     * @param {edb.IChangeHandler} handler
     * @returns {edb.Object|edb.Array}
     */
    $unobserve: function(type, handler) {
        var id = type.$instanceid;
        var obs = this._observers;
        var index, handlers = obs[id];
        if (handlers) {
            if ((index = handlers.indexOf(handler)) > -1) {
                if (gui.Array.remove(handlers, index) === 0) {
                    delete obs[id];
                }
            }
        }
        return type;
    },

    /**
     * Called by {edb.Output} when the output context shuts down
     * (when the window unloads or the web worker is terminated).
     */
    $destruct: function(type) {
        new edb.Crawler().crawl(type, {
            ontype: function(t) {
                if (!t.$destructed) {
                    type.ondestruct();
                    type.$ondestruct();
                    type.$destructed = true;
                    if (!gui.unloading) {
                        gui.GreatSpirit.$nukeallofit(type);
                    }
                }
            }
        });
    }

});


// Mixins ......................................................................

/**
 * Setup for mixin to {edb.Object} and {edb.Array}.
 */
(function() {

    var iomixins = { // input-output methods

        /**
         * Instance of this Type has been output
         * in window (or worker scope) context?
         * @returns {boolean}
         */
        out: function() {
            return edb.Output.out(this);
        }
    };

    var spassermixins = {

        /**
         * Create new instance from argument of fuzzy type.
         * @param {String|object|Array|edb.Object|edb.Array} json
         * @return {edb.Object|edb.Array}
         */
        from: gui.Arguments.confirmed("(string|object|array|null)")(
            function(json) {
                var Type = this;
                if (json) {
                    if (edb.Type.is(json)) {
                        json = new edb.Serializer().serializeToString(json);
                    }
                    if (gui.Type.isString(json)) {
                        if (json.contains("$object") || json.contains("$array")) {
                            json = new edb.Parser().parseFromString(json, null);
                        }
                    }
                }
                return new Type(json);
            }
        )
    };

    /**
     * Declare the fields on edb.Type.
     */
    [iomixins, spassermixins].forEach(function(mixins) {
        gui.Object.each(mixins, function mixin(key, value) {
            edb.Type[key] = value;
        });
    });

    /**
     * Create one-liner for mixin to subclass constructors recurring static fields.
     * @returns {Map<String,String|function>}
     */
    edb.Type.$staticmixins = function() {
        var mixins = {};
        [iomixins, spassermixins].forEach(function(set) {
            Object.keys(set).forEach(function(key) {
                mixins[key] = set [key];
            }, this);
        }, this);
        return mixins;
    };

}());



/**
 * edb.Object
 * @extends {edb.Type} at least in principle.
 * @using {gui.Combo.chained}
 */
edb.Object = (function using(chained) {

    return gui.Class.create(Object.prototype, {

        /**
         * Observe object.
         * @param @optional {IChangeHandler} handler
         * @returns {edb.Object}
         */
        addObserver: chained(function(handler) {
            edb.Object.observe(this, handler);
        }),

        /**
         * Unobserve object.
         * @param @optional {IChangeHandler} handler
         * @returns {edb.Object}
         */
        removeObserver: chained(function(handler) {
            edb.Object.unobserve(this, handler);
        }),


        // Privileged ..............................................................

        /**
         * Constructor.
         * @overrides {edb.Type#onconstruct}
         */
        $onconstruct: function(json) {
            edb.Type.prototype.$onconstruct.apply(this, arguments);
            switch (gui.Type.of(json)) {
                case "object":
                case "undefined":
                case "null":
                    var proxy = gui.Object.copy(json || {});
                    var types = edb.ObjectPopulator.populate(proxy, this);
                    edb.ObjectProxy.approximate(proxy, this, types);
                    break;
                default:
                    throw new TypeError(
                        "Unexpected edb.Object constructor argument of type " +
                        gui.Type.of(json) + ": " + String(json)
                    );
            }
            this.onconstruct();
            if (this.oninit) {
                console.error("Deprecated API is deprecated: " + this + ".oninit");
            }
        },

        /**
         * Create clone of this object filtering out
         * underscore and dollar prefixed properties.
         * Recursively normalizing nested EDB types.
         * TODO: WHITELIST stuff that *was* in JSON!
         * TODO: Something about recursive structure...
         * @returns {object}
         */
        toJSON: function() {
            return gui.Object.map(this, function(key, value) {
                var c = key.charAt(0);
                if (c !== "$" && c !== "_") {
                    if (edb.Type.is(value)) {
                        return value.toJSON();
                    }
                    return value;
                }
            });
        }

    });

}(gui.Combo.chained));

/**
 * Mixin static methods. Recurring static members mixed in from {edb.Type}.
 */
edb.Object.mixin(null, edb.Type.$staticmixins(), {

    /**
     * Observe.
     */
    observe: edb.Type.$observe,

    /**
     * Unobserve.
     */
    unobserve: edb.Type.$unobserve,

    /**
     * Publishing change summaries async.
     * TODO: clean this up...
     * TODO: move to edb.Type (edb.Type.observe)
     * @param {gui.Tick} tick
     */
    ontick: function(tick) {
        var snapshot, changes, handlers, observers = this._observers;
        if (tick.type === edb.TICK_PUBLISH_CHANGES) {
            snapshot = gui.Object.copy(this._changes);
            this._changes = Object.create(null);
            gui.Object.each(snapshot, function(instanceid, propdef) {
                if ((handlers = observers[instanceid])) {
                    changes = [];
                    gui.Object.each(snapshot, function(id, props) {
                        if (id === instanceid) {
                            gui.Object.each(props, function(name, change) {
                                changes.push(change);
                            });
                        }
                    });
                    handlers.forEach(function(handler) {
                        handler.onchange(changes);
                    });
                }
            });
        }
    },


    // Privileged static .........................................................

    /**
     * Publish a notification on property accessors.
     * This should be relevant during script render.
     */
    $onaccess: function(object, name) {
        if (edb.$accessaware) {
            gui.Broadcast.dispatch(edb.BROADCAST_ACCESS, [
                object, name
            ]);
        }
    },

    /**
     * Register change summary for publication (in next tick).
     * @param {edb.Object} object
     * @param {String} name
     * @param {object} oldval
     * @param {object} newval
     */
    $onchange: function(object, name, oldval, newval) {
        var type = edb.ObjectChange.TYPE_UPDATE;
        var all = this._changes, id = object.$instanceid;
        var set = all[id] = all[id] || (all[id] = Object.create(null));
        set [name] = new edb.ObjectChange(object, name, type, oldval, newval);
        gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES);
    },


    // Private static ............................................................

    /**
     * Mapping instanceids to lists of observers.
     * @type {Map<String,Array<edb.IChangeHandler>>}
     */
    _observers: Object.create(null),

    /**
     * Mapping instanceids to lists of changes.
     * @type {Map<String,Array<edb.ObjectChange>>}
     */
    _changes: Object.create(null),

});

/*
 * Mixin methods and properties common to both {edb.Object} and {edb.Array}
 */
(function setup() {
    gui.Tick.add(edb.TICK_PUBLISH_CHANGES, edb.Object);
    gui.Object.extendmissing(edb.Object.prototype, edb.Type.prototype);
}());



/**
 * @using {Array.prototype}
 * @using {gui.Combo chained}
 */
(function using(proto, chained) {

    /**
     * edb.Array
     * @extends {edb.Type} (although not really)
     */
    edb.Array = gui.Class.create(proto, {

        /**
         * Push.
         */
        push: function() {
            var idx = this.length;
            var add = convert(this, arguments);
            var res = proto.push.apply(this, add);
            if (observes(this)) {
                onchange(this, idx, null, add);
            }
            return res;
        },

        /**
         * Pop.
         */
        pop: function() {
            var idx = this.length - 1;
            var res = proto.pop.apply(this);
            if (observes(this) && idx >= 0) {
                onchange(this, idx, [res], null);
            }
            return res;
        },

        /**
         * Shift.
         */
        shift: function() {
            var res = proto.shift.apply(this);
            if (observes(this)) {
                onchange(this, 0, [res], null);
            }
            return res;
        },

        /**
         * Unshift.
         */
        unshift: function() {
            var add = convert(this, arguments);
            var res = proto.unshift.apply(this, add);
            if (observes(this)) {
                onchange(this, 0, null, add);
            }
            return res;
        },

        /**
         * Splice.
         */
        splice: function() {
            var arg = arguments;
            var idx = arg[0];
            var add = convert(this, [].slice.call(arg, 2));
            var fix = [idx, arg[1]].concat(add);
            var out = proto.splice.apply(this, fix);
            if (observes(this)) {
                onchange(this, idx, out, add);
            }
            return out;
        },

        /**
         * Reverse.
         */
        reverse: function() {
            if (observes(this)) {
                var out = this.toJSON();
                var add = proto.reverse.apply(out.slice());
                onchange(this, 0, out, add);
            }
            return proto.reverse.apply(this);
        },


        // Expandos ................................................................

        /**
         * Just to illustrate that arrays may conveniently get their
         * content assigned to a variable name via the arguments list.
         * @param {Array<object>} members (edb.Types all newed up here)
         */
        onconstruct: function(members) {},

        /**
         * Observe array (both object properties and list mutations).
         * @param @optional {IChangeHandler} handler
         * @returns {edb.Array}
         */
        addObserver: chained(function(handler) {
            edb.Object.observe(this, handler);
            edb.Array.observe(this, handler);
        }),

        /**
         * Unobserve array.
         * @param @optional {IChangeHandler} handler
         * @returns {edb.Array}
         */
        removeObserver: chained(function(handler) {
            edb.Object.unobserve(this, handler);
            edb.Array.unobserve(this, handler);
        }),

        /**
         * The content type can be declared as:
         *
         * 1. An edb.Type constructor function (my.ns.MyType)
         * 2. A filter function to accept JSON (for analysis)
         *    and return an edb.Type constructor OR instance
         * @type {function} Type constructor or filter function
         */
        $of: null,

        /**
         * Constructor.
         * @overrides {edb.Type#onconstruct}
         */
        $onconstruct: function() {
            var object, types;
            edb.Type.prototype.$onconstruct.apply(this, arguments);
            if (arguments.length) {
                object = arguments[0] ? arguments[0].$object || {} : {};
                types = edb.ObjectPopulator.populate(object, this);
                edb.ArrayPopulator.populate(this, arguments);
                edb.ObjectProxy.approximate(object, this, types);
            }
            this.onconstruct([].slice.call(this));
        },

        /**
         * Get element at index. Use this in EDBML scripts instead of [length]
         * notation, otherwise the template will not watch this array for changes!
         * @param {number} index
         * @returns {object}
         */
        get: function(index) {
            if (edb.$accessaware) {
                edb.Array.$onaccess(this, index);
            }
            return this[index];
        },

        /**
         * Get length. Use this in EDBML scripts instead of 'length',
         * otherwise the template will not watch this array for changes!
         * @returns {number}
         */
        getLength: function(index) {
            if (edb.$accessaware) {
                edb.Array.$onaccess(this, index);
            }
            return this.length;
        },

        /*
         * Stunt accessor for setting the `length`
         * until proxies come to save us all.
         * @type {number}
         */
        setLength: function(length) {
            var out = [];
            while (this.length > length) {
                out.push(this.pop());
            }
            if (out.length) {
                onchange(this, this.length - 1, out);
            }
        },


        /**
         * Create true array without expando properties, recursively 
         * normalizing nested EDB types. Returns the type of array we 
         * would typically transmit back to the server or something.
         * @returns {Array}
         */
        toJSON: function() {
            return Array.map(this, function(thing) {
                if (edb.Type.is(thing)) {
                    return thing.toJSON();
                }
                return thing;
            });
        }

    });


    // Helpers ...................................................................

    /**
     * Convert arguments.
     * @param {edb.Array} array
     * @param {Arguments} args
     * @returns {Array}
     */
    function convert(array, args) {
        return edb.ArrayPopulator.convert(array, args);
    }

    /**
     * Shorthand.
     * @param {edb.Array} array
     * @param {number} index
     * @param {Array} removed
     * @param {Array} added
     */
    function onchange(array, index, removed, added) {
        edb.Array.$onchange(array, index, removed, added);
    }

    /**
     * Array is being observed?
     * @param {edb.Array} array
     * @returns {boolean}
     */
    function observes(array) {
        var key = array.$instanceid;
        return edb.Array._observers[key] ? true : false;
    }

}(Array.prototype, gui.Combo.chained));


/**
 * Mixin static methods. Recurring static members mixed in from {edb.Type}.
 */
edb.Array.mixin(null, edb.Type.$staticmixins(), {

    /**
     * Observe.
     */
    observe: edb.Type.$observe,

    /**
     * Unobserve.
     */
    unobserve: edb.Type.$unobserve,

    /**
     * Something is a subclass constructor of {edb.Array}?
     * TODO: let's generalize this facility in {gui.Class}
     */
    isConstructor: function(o) {
        return gui.Type.isConstructor(o) &&
            gui.Class.ancestorsAndSelf(o).indexOf(edb.Array) > -1;
    },

    /**
     * Publishing change summaries async.
     * @param {gui.Tick} tick
     */
    ontick: function(tick) {
        var snapshot, handlers, observers = this._observers;
        if (tick.type === edb.TICK_PUBLISH_CHANGES) {
            snapshot = gui.Object.copy(this._changes);
            this._changes = Object.create(null);
            gui.Object.each(snapshot, function(instanceid, changes) {
                if ((handlers = observers[instanceid])) {
                    handlers.forEach(function(handler) {
                        handler.onchange(changes);
                    });
                }
            });
        }
    },


    // Private static ............................................................

    /**
     * Mapping instanceids to lists of observers.
     * @type {Map<String,Array<edb.IChangeHandler>>}
     */
    _observers: Object.create(null),

    /**
     * Mapping instanceids to lists of changes.
     * @type {Map<String,Array<edb.ArrayChange>>}
     */
    _changes: Object.create(null),


    // Privileged static .........................................................

    /**
     * TODO.
     * @param {edb.Array} array
     * @param {number} index
     */
    $onaccess: function(array, index) {
        if (edb.$accessaware) {
            gui.Broadcast.dispatch(edb.BROADCAST_ACCESS, [array]);
        }
    },

    /**
     * Register change summary for publication in next tick.
     * TODO: http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
     * @param {edb.Array} array
     * @param {number} index
     * @param {Array} removed
     * @param {Array} added
     */
    $onchange: function(array, index, removed, added) {
        var key = array.$instanceid;
        var all = this._changes;
        var set = all[key] || (all[key] = []);
        set.push(new edb.ArrayChange(array, index, removed, added));
        gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES);
    },

});


/*
 * Overloading array methods.
 * @using {edb.Array.prototype}
 */
(function using(proto) {

    /*
     * Dispatch a getter broadcast before base function.
     */
    var beforeaccess = gui.Combo.before(function() {
        if (edb.$accessaware) {
            edb.Array.$onaccess(this, -1);
        }
    });

    /**
     * Decorate getter methods on prototype.
     * @param {object} proto Prototype to decorate
     * @param {Array<String>} methods List of method names
     * @returns {object}
     */
    function decorateAccess(proto, methods) {
        methods.forEach(function(method) {
            proto[method] = beforeaccess(proto[method]);
        });
    }

    /*
     * Dispatch a broadcast whenever the list is inspected or traversed.
     */
    decorateAccess(proto, [
        "filter",
        "forEach",
        "every",
        "map",
        "some",
        "indexOf",
        "lastIndexOf",
        "slice" // hm,
        // TODO: REDUCE!
    ]);

}(edb.Array.prototype));

/*
 * Mixin methods and properties common
 * to both {edb.Object} and {edb.Array}
 */
(function setup() {
    gui.Tick.add(edb.TICK_PUBLISH_CHANGES, edb.Array);
    gui.Object.extendmissing(edb.Array.prototype, edb.Type.prototype);
}());



// BACKUP ......................................................................

/**
 * Dispatch a setter broadcast after base 
 * function by decorating setter methods on prototype.
 * @param {object} proto Prototype to decorate
 * @param {Array<String>} methods List of method names
 * @returns {object}
 *
var afterchange = gui.Combo.after ( function () {});
function decorateChange ( proto, methods ) {
    methods.forEach ( function ( method ) {
        proto [ method ] = afterchange ( proto [ method ]);
    });
}

// Dispatch a broadcast whenever the list changes content or structure.
decorateChange ( proto, [
    "push", // add
    "unshift", // add
    "splice", // add or remove
    "slice", // remove
    "pop", // remove
    "shift", // remove
    "reverse" // reversed (copies???????)
]);
*/



/**
 * Populates an {edb.Object} type.
 * @using {gui.Type.isDefined}
 * @using {gui.Type.isComplex},
 * @using {gui.Type.isFunction}
 * @using {gui.Type.isConstructor}
 */
edb.ObjectPopulator = (function using(isdefined, iscomplex, isfunction, isconstructor) {

    /**
     * List non-private fields names from handler that are not
     * mixed in from {edb.Type} and not inherited from native.
     * @param {edb.Object} handler
     * @returns {Array<String>}
     */
    function definitions(handler) {
        var Type = edb.Object.is(handler) ? edb.Object : edb.Array;
        var Base = edb.Object.is(handler) ? Object : Array;
        var keys = [],
            classes = [edb.Type, Type, Base];
        gui.Object.all(handler, function(key) {
            if (isregular(key) && classes.every(function(o) {
                return o.prototype[key] === undefined;
            })) {
                keys.push(key);
            }
        });
        return keys;
    }

    /**
     * TODO: Call this something else...
     * @param {object} json
     * @param {edb.Object|edb.Array} type
     */
    function evalheaders(json, type) {
        var id = json.$originalid || json.$instanceid;
        delete json.$instanceid;
        delete json.$originalid;
        if (id) {
            Object.defineProperty(type, "$originalid", gui.Property.nonenumerable({
                value: id
            }));
        }
    }

    /**
     * Fail me once.
     * @param {String} name
     * @param {String} key
     */
    function faildefined(name, key) {
        throw new TypeError(
            name + " declares \"" + key + "\" as something undefined"
        );
    }

    /**
     * Fail me twice.
     * @param {String} name
     * @param {String} key
     */
    function failconstructor(name, key) {
        throw new TypeError(
            name + " \"" + key + "\" must resolve to a constructor"
        );
    }

    /**
     * Object key is not a number and doesn't start with exotic character?
     * @param {String|number} key
     * @returns {boolean}
     */
    function isregular(key) {
        return key.match(/^[a-z]/i);
    }

    /**
     * Lookup property descriptor for key.
     * @param {object} proto
     * @param {string} key
     * @returns {object}
     */
    function lookupDescriptor(proto, key) {
        if (proto.hasOwnProperty(key)) {
            return Object.getOwnPropertyDescriptor(proto, key);
        } else if ((proto = Object.getPrototypeOf(proto))) {
            return lookupDescriptor(proto, key);
        } else {
            return null;
        }
    }


    return { // Public ...............................................................

        /**
         * Populate object properties of type instance.
         * @param {object} json
         * @param {edb.Object|edb.Array} type
         * @return {Map<String,edb.Object|edb.Array>} types
         */
        populate: function(json, type) {
            var Def, def, val, desc, types = Object.create(null);
            var base = type.constructor.prototype;
            var name = type.constructor.$classname;
            evalheaders(json, type);
            definitions(type).forEach(function(key) {
                def = type[key];
                val = json[key];
                switch (def) {
                    case Object:
                        //	console.error('TODO: Support Object in edb.ObjectPopulator');
                        type[key] = {};
                        break;
                    case Array:
                        if (val && Array.isArray(val)) {
                            type[key] = val.slice();
                        } else {
                            type[key] = [];
                        }
                        break;
                    default:
                        if (isdefined(val)) {
                            if (isdefined(def)) {
                                if (iscomplex(def)) {
                                    if (isfunction(def)) {
                                        if (!isconstructor(def)) {
                                            def = def(val);
                                        }
                                        if (isconstructor(def)) {
                                            if (val !== null) {
                                                Def = def;
                                                types[key] = Def.from(json[key]);
                                            }
                                        } else {
                                            failconstructor(name, key);
                                        }
                                    } else {
                                        types[key] = edb.Type.cast(isdefined(val) ? val : def);
                                    }
                                }
                            } else {
                                faildefined(name, key);
                            }
                        } else {
                            if (isregular(key) && edb.Type.isConstructor(def)) {
                                /*
                                 * TODO: cleanup something here
                                 */
                                if (edb.Array.isConstructor(def)) {
                                    json[key] = [];
                                } else {
                                    json[key] = null; // TODO: stay null somehow...
                                }
                                Def = def;
                                types[key] = Def.from(json[key]);
                            } else {
                                if ((desc = lookupDescriptor(base, key))) {
                                    Object.defineProperty(json, key, desc);
                                }
                            }
                        }
                        break;
                }
            });
            gui.Object.nonmethods(json).forEach(function(key) {
                var def = json[key];
                if (isregular(key) && gui.Type.isComplex(def)) {
                    if (!types[key]) {
                        types[key] = edb.Type.cast(def);
                    }
                }
            });
            return types;
        }
    };

})(
    gui.Type.isDefined,
    gui.Type.isComplex,
    gui.Type.isFunction,
    gui.Type.isConstructor
);



/**
 * Populate `edb.Array` instances in various tricky ways.
 */
edb.ArrayPopulator = (function() {

    /**
     * Array was declared to contain lists (not objects)?
     * @param {edb.Array} array
     * @returns {boolean}
     */
    function oflist(array) {
        return array.$of && array.$of.prototype.reverse;
    }

    /**
     * Something is a list?
     * @param {object} o
     * @returns {boolean}
     */
    function islist(o) {
        return Array.isArray(o) || edb.Array.is(o);
    }

    /**
     * Used in function `guidedconvert`.
     * @param {constructor} Type
     * @param {object} o
     * @returns {edb.Type}
     */
    function constructas(Type, o) {
        if (!gui.debug || edb.Type.isConstructor(Type)) {
            if (edb.Type.is(o)) {
                if (Type.is(o)) {
                    return o;
                } else {
                    fail(Type, o);
                }
            } else {
                return new Type(o);
            }
        } else {
            fail('edb.Type', Type);
        }
    }

    /**
     * Used in function `guidedconvert`.
     * @param {function} filter
     * @param {object|edb.Type} o
     * @returns {edb.Type}
     */
    function filterfrom(filter, o) {
        var t = filter(o);
        if (gui.Type.isConstructor(t)) {
            t = constructas(t, o);
        } else if (edb.Type.is(t) || t === null) {
            t = t;
        } else {
            fail(
                'edb.Type constructor or instance',
                gui.Type.of(t),
                'return null for nothing'
            );
        }
        return t;
    }

    /**
     * Throw that TypeEror.
     * @param {string|object} expected
     * @param {string|object} received
     * @param @optional {string} message
     */
    function fail(expected, received, message) {
        throw new TypeError(
            '$of expected ' + expected + ', got ' + received +
            (message ? ' (' + message + ')' : '')
        );
    }

    /**
     * Convert via constructor or via filter
     * function which returns a constructor.
     * @param {Array} args
     * @param {edb.Array} array
     * @returns {Array<edb.Type>}
     */
    function guidedconvert(args, array) {
        return args.map(function(o) {
            if (o !== undefined) {
                if (gui.Type.isConstructor(array.$of)) {
                    o = constructas(array.$of, o);
                } else {
                    o = filterfrom(function(x) {
                        return array.$of(x);
                    }, o);
                }
            }
            return o;
        });
    }

    /**
     * Objects and arrays automatically converts
     * to instances of {edb.Object} and {edb.Array}
     * @param {Array} args
     * @returns {Array}
     */
    function autoconvert(args) {
        return args.map(function(o) {
            if (!edb.Type.is(o)) {
                switch (gui.Type.of(o)) {
                    case "object":
                        return new edb.Object(o);
                    case "array":
                        return new edb.Array(o);
                }
            }
            return o;
        });
    }


    return { // Public ...........................................................

        /**
         * Populate {edb.Array} from constructor arguments. This works like normal
         * arrays, except for the scenario where 1) the content model of the array
         * is NOT arrays (ie. not a dimensional array) and 2) the first argument IS
         * an array OR an {edb.Array} in which case the first members of this list
         * will populate into the array and the remaining arguments will be ignored.
         * TODO: read something about http://www.2ality.com/2011/08/spreading.html
         * @param {edb.Array}
         * @param {Arguments} args
         */
        populate: function(array, args) {
            var first = args[0];
            if (first) {
                if (!oflist(array) && islist(first)) {
                    args = first;
                }
                Array.prototype.push.apply(array,
                    this.convert(array, args)
                );
            }
        },

        /**
         * Convert arguments.
         * @param {edb.Array} array
         * @param {Arguments|array} args
         * @returns {Array}
         */
        convert: function(array, args) {
            args = gui.Array.from(args);
            if (!gui.Type.isNull(array.$of)) {
                if (gui.Type.isFunction(array.$of)) {
                    return guidedconvert(args, array);
                } else {
                    var type = gui.Type.of(array.$of);
                    throw new Error(array + ' cannot be $of ' + type);
                }
            } else {
                return autoconvert(args);
            }
        }

    };

}());



/**
 * Proxy all the things.
 */
edb.ObjectProxy = (function scoped() {

    /* 
     * Don't trigger object accessors 
     * while scanning them internally.
     */
    var suspend = false;

    /**
     * Create observable getter for key.
     * @param {String} key
     * @param {function} base
     * @returns {function}
     */
    function getter(key, base) {
        return function() {
            var result = base.apply(this);
            if (edb.$accessaware && !suspend) {
                edb.Object.$onaccess(this, key);
            }
            return result;
        };
    }

    /**
     * Create observable setter for key.
     * @param {String} key
     * @param {function} base
     * @returns {function}
     */
    function setter(key, base) {
        return function(newval) {
            suspend = true;
            var oldval = this[key];
            //if(!isrendering(this, key)) {
                base.apply(this, arguments);
                if ((newval = this[key]) !== oldval) {
                    edb.Object.$onchange(this, key, oldval, newval);
                }
            //}
            suspend = false;
        };
    }

    /**
     * If an object mutation causes an EDBML script to run, make sure 
     * that the script doesn't mutate the property again while running.
     * 
     * TODO: move to edbml (somehow)
     *
     * @param {edb.Object} obj
     * @param {string} key The 
     *
    function isrendering(obj, key) {
        var is = edb.$accessaware;
        var id = obj.$instanceid;
        if(is && Object.keys(is).indexOf(id) >-1) {
            console.error(
                'Don\'t update "' + key + '" of the ' + obj.$classname +  ' while ' +
                'rendering, it will cause the rendering to run in an endless loop. '
            );
            return true;
        }
        return false;
    }
    */

    return { // Public ...........................................................

        /**
         * Simplistic proxy mechanism to dispatch broadcasts on getters and setters.
         * @param {object} target The object whose properties are being intercepted. 
         * @param {edb.Object|edb.Array} handler The edb.Type instance that 
         *        intercepts the properties
         */
        approximate: function(target, handler, types) {

            /* 
             * 1. Objects by default convert to edb.Object
             * 2. Arrays by default convert to edb.Array
             * 3. Simple properties get target accessors
             *
             * TODO: Setup now proxies array indexes,
             * unsupport this or re-approximate on changes
             *
             * TODO: when resetting array, make sure that
             * it becomes xx.MyArray (not plain edb.Array)
             */
            gui.Object.nonmethods(target).forEach(function(key) {
                var desc = Object.getOwnPropertyDescriptor(target, key);
                if (desc.configurable) {
                    Object.defineProperty(handler, key, {
                        enumerable: desc.enumerable,
                        configurable: desc.configurable,
                        get: getter(key, function() {
                            if (desc.get) {
                                return desc.get.call(this);
                            } else {
                                return types[key] || target[key];
                            }
                        }),
                        set: setter(key, function(value) {
                            var Type, type;
                            if (desc.set) {
                                desc.set.call(this, value);
                            } else {
                                if ((type = types[key])) {
                                    if (edb.Type.is(value)) {
                                        types[key] = value;
                                    } else {
                                        Type = type.constructor; // TODO: filter function support!
                                        types[key] = Type.from(value); // new Type ( value );
                                    }
                                } else {
                                    target[key] = edb.Type.cast(value);
                                }
                            }
                        })
                    });
                }
            });
            gui.Object.ownmethods(target).forEach(function(key) {
                handler[key] = target[key];
            });
        }
    };

}());



/**
 * Micro change summary.
 */
edb.Change = function() {};
edb.Change.prototype = {

    /**
     * Type that changed.
     * @type {edb.Object|edb.Array}
     */
    object: null,

    /**
     * Update type.
     * @type {String}
     */
    type: null
};



/**
 * edb.Object change summary.
 * @extends {edb.Change}
 * @param {edb.Object} object
 * @param {String} name
 * @param {String} type
 * @param {object} oldval
 * @param {object} newval
 */
edb.ObjectChange = function(object, name, type, oldval, newval) {
    this.object = object;
    this.name = name;
    this.type = type;
    this.oldValue = oldval;
    this.newValue = newval;
};

edb.ObjectChange.prototype = {
    name: null,
    oldValue: undefined,
    newValue: undefined
};

/**
 * We only support type "updated" until
 * native 'Object.observe' comes along.
 * @type {String}
 */
edb.ObjectChange.TYPE_UPDATE = "update";



/**
 * @see http://wiki.ecmascript.org/doku.php?id=harmony:observe#array.observe
 * @param {edb.Array} array
 */
edb.ArrayChange = function(array, index, removed, added) {
    this.type = edb.ArrayChange.TYPE_SPLICE; // hardcoded for now
    this.object = array;
    this.index = index;
    this.removed = removed || [];
    this.added = added || [];
};

edb.ArrayChange.prototype = gui.Object.create(edb.Change.prototype, {

    /**
     * Index of change.
     * @type {}
     */
    index: -1,

    /**
     * List removed members.
     * TODO: What should happen to them?
     * @type {Array}
     */
    removed: null,

    /**
     * List added members.
     * @type {Array}
     */
    added: null

});

/*
 * Update types. We'll stick to `splice` for now.
 */
edb.ArrayChange.TYPE_SPLICE = "splice";

/**
 * Given a `splice` change, compute the arguments required
 * to cause or reproduce the change using `array.splice()`.
 * @see http://mdn.io/splice
 */
edb.ArrayChange.toSpliceParams = function(change) {
    if (change.type === edb.ArrayChange.TYPE_SPLICE) {
        var idx = change.index;
        var out = change.removed.length;
        var add = change.added;
        return [idx, out].concat(add);
    } else {
        throw new TypeError();
    }
};



/**
 * Adopt the format of {gui.Broadcast} to facilitate easy switch cases
 * on the Type constructor instead of complicated `instanceof` checks.
 * The Type instance object may be picked out of the `data` property.
 * @param {constructor} Type
 * @param {edb.Object|edb.Array} type
 */
edb.Input = function Input(Type, type) {
    this.$instanceid = gui.KeyMaster.generateKey();
    if (edb.Type.is(type) || type === null) {
        this.type = Type;
        this.data = type;
    } else {
        throw new TypeError(type + " is not a Type instance");
    }
};

edb.Input.prototype = {

    /**
     * Input Type (function constructor)
     * @type {function}
     */
    type: null,

    /**
     * Input instance (instance of this.Type)
     * @type {object|edb.Type} data
     */
    data: null,

    /**
     * Mark as revoked.
     * @type {boolean}
     */
    revoked: false,

    /**
     * Uniquely identifies the input.
     * @type {String}
     */
    $instanceid: null,

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object edb.Input]";
    }
};



/**
 * Output all the inputs.
 * TODO: add and remove methods.
 */
edb.Output = {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object edb.Output]";
    },

    /**
     * Output Type instance.
     * @returns {edb.Object|edb.Array}
     * @param @optional {object} target
     * TODO: rename to 'output'?
     */
    dispatch: function(type, target) {
        var handler, input = this._configure(type.constructor, type);
        if (target) {
            console.error("Deprecated API is deprecated", target.spirit);
            if ((handler = target.$oninput || target.oninput)) {
                handler.call(target, input);
            }
        } else {
            gui.Broadcast.dispatch(edb.BROADCAST_OUTPUT, input);
        }
    },

    /**
     * Revoke type from output. Any subscribers to input of this type
     * will now recieve an {edb.Input} with `null` as the data value.
     * @param {constructor|edb.Type} type Accept instance or constructor
     */
    revoke: function(type) {
        var Type = edb.Type.is(type) ? type.constructor : type;
        if (edb.get(Type) === type) {
            var input = this._configure(Type, null);
            gui.Broadcast.dispatch(edb.BROADCAST_OUTPUT, input);
            //edb.Type.$destruct(type);
            delete this._map[Type.$classid];
        }
    },

    /**
     * Instance of given Type has been output to context?
     * @param {function} type Type constructor
     * @returns {boolean}
     */
    out: function(Type) {
        if (Type) {
            if (this._map) {
                var classid = Type.$classid;
                var typeobj = this._map[classid];
                return typeobj ? true : false;
            }
            return false;
        } else {
            throw new Error("Something is undefined");
        }
    },


    // Private ...................................................................

    /**
     * Mapping Type classname to Type instance.
     * @type {Map<String,edb.Object|edb.Array>}
     */
    _map: {},

    /**
     * Configure Type instance for output.
     * @param {function} Type constructor
     * @param {edb.Object|edb.Array} type instance
     * @returns {edb.Input}
     */
    _configure: function(Type, type) {
        var classid = Type.$classid;
        this._map[classid] = type;
        return new edb.Input(Type, type);
    },


    // Privileged ................................................................

    /**
     * Get output of given type. Note that this 
     * returns an {edb.Input}. The official way 
     * to go about this is to get hold of the 
     * instance directly via `edb.get(MyType)`.
     * @param {constructor} Type
     * @returns {edb.Input}
     */
    $get: function(Type) {
        if (Type) {
            if (this._map) {
                var classid = Type.$classid;
                var typeobj = this._map[classid];
                return typeobj ? new edb.Input(typeobj.constructor, typeobj) : null;
            } else {
                return null;
            }
        } else {
            throw new Error("Something undefined was requested");
        }
    }

};



/**
 * Crawl structures descending.
 * TODO: Implement 'stop' directive
 */
edb.Crawler = (function() {

    function Crawler() {}
    Crawler.prototype = {

        /**
         *
         */
        crawl: function(type, handler) {
            if (edb.Type.is(type)) {
                handle(type, handler);
                crawl(type, handler);
            } else {
                throw new TypeError();
            }
        }
    };

    /**
     * Note to self: This also crawls array members (via index keys).
     */
    function crawl(type, handler) {
        gui.Object.each(type, istype).forEach(
            function(type) {
                handle(type, handler);
                crawl(type, handler);
            }
        );
    }

    function istype(key, value) {
        if (edb.Type.is(value)) {
            return value;
        }
    }

    function handle(type, handler) {
        if (handler.ontype) {
            handler.ontype(type);
        }
        if (handler.onarray) {
            if (edb.Array.is(type)) {
                handler.onarray(type);
            }
        }
        if (handler.onobject) {
            if (edb.Object.is(type)) {
                handler.onobject(type);
            }
        }
    }

    return Crawler;

}());



edb.Serializer = (function scoped() {

    function Serializer() {}
    Serializer.prototype = {

        /**
         * Serialize type.
         * @param {edb.Object|edb.Array} type
         * @param @optional {function} filter
         * @param @optional {String|number} tabs
         * @returns {String}
         */
        serializeToString: function(type, filter, tabs) {
            if (isType(type)) {
                return JSON.stringify(parse(type), filter, tabs);
            } else {
                throw new TypeError("Expected edb.Object|edb.Array");
            }
        }
    };

    /**
     * Match array features leaking into objects.
     * @type {RegExp}
     */
    var INTRINSIC = /^length|^\d+/;

    /**
     * Thing is a type?
     * @param {object} thing
     * @returns {boolean}
     */
    function isType(thing) {
        return edb.Type.is(thing);
    }

    /**
     * Thing is edb.Array?
     * @param {object} thing
     * @returns {boolean}
     */
    function isArray(type) {
        return edb.Array.is(type);
    }

    /**
     * Parse as object node or array node.
     */
    function parse(type) {
        return isArray(type) ? asArray(type) : asObject(type);
    }

    /**
     * Compute object node.
     * @param {edb.Object|edb.Array} type
     * @returns {object}
     */
    function asObject(type) {
        var map = gui.Object.map(type, mapObject, type);
        return {
            $object: gui.Object.extend({
                $classname: type.$classname,
                $instanceid: type.$instanceid,
                $originalid: type.$originalid
            }, map)
        };
    }

    /**
     * Compute array node.
     * @param {edb.Object|edb.Array} type
     * @returns {object}
     */
    function asArray(type) {
        return gui.Object.extend(asObject(type), {
            $array: mapArray(type)
        });
    }

    /**
     * Map the object properties of a type.
     *
     * - Skip private (underscore) fields.
     * - Skip all array intrinsic properties.
     * - Skip what looks like instance objects.
     * - Skip getters and setters.
     * @param {String} key
     * @param {object} value
     */
    function mapObject(key, value) {
        var c = key.charAt(0);
        if (c === "_" || c === "$") {
            return undefined;
        } else if (isArray(this) && key.match(INTRINSIC)) {
            return undefined;
        } else if (isType(value)) {
            return parse(value);
        } else if (gui.Type.isComplex(value)) {
            switch (value.constructor) {
                case Object:
                case Array:
                    return value;
            }
            return undefined;
        } else {
            if (isType(this)) {
                var base = this.constructor.prototype;
                var desc = Object.getOwnPropertyDescriptor(base, key);
                if (desc && (desc.set || desc.get)) {
                    return undefined;
                }
            }
            return value;
        }
    }

    /**
     * Map array members.
     * @param {edb.Array} type
     */
    function mapArray(type) {
        return Array.map(type, function(thing) {
            return isType(thing) ? parse(thing) : thing;
        });
    }

    return Serializer;

}());



edb.Parser = (function() {

    function Parser() {}
    Parser.prototype = {

        /**
         * @param {String} json
         * @param @optional {function} type
         * @returns {edb.Object|edb.Array}
         */
        parseFromString: function(json, type) {
            try {
                json = JSON.parse(json);
            } catch (JSONException) {
                throw new TypeError('Bad JSON: ' + JSONException.message);
            } finally {
                if (isType(json)) {
                    return parse(json, type);
                } else {
                    throw new TypeError("Expected serialized edb.Object|edb.Array");
                }
            }
        }
    };

    /**
     * @returns {edb.Object|edb.Array}
     */
    function parse(json, type) {
        var Type, name;
        if (type === null) {
        } else if (type) {
            name = type.$classname || name;
            Type = name ? type : gui.Object.lookup(name);
        } else {
            name = json.$object.$classname;
            Type = gui.Object.lookup(name);
        }
        json = mapValue(json);
        if (type === null) {
            return json;
        } else if (Type) {
            return Type.from(json);
        } else {
            var error = new TypeError(name + " is not defined");
            if(name === gui.Class.ANONYMOUS) {
                console.error(
                    'TODO: Spiritual should make sure ' +
                    'that nothing is ever "' + name + '"\n' +
                    JSON.stringify(json, null, 4)
                );
            }
            throw error;
        }
    }

    /**
     * Is typed node?
     * @param {object} json
     * @returns {boolean}
     */
    function isType(json) {
        return gui.Type.isComplex(json) && (json.$array || json.$object);
    }

    /**
     * Parse node as typed instance.
     * @param {object} type
     * @return {object}
     */
    function asObject(type) {
        return gui.Object.map(type.$object, mapObject);
    }

    /**
     * Parse array node to a simple array.
     * Stamp object properties onto array.
     * @returns {Array}
     */
    function asArray(type) {
        var members = type.$array.map(mapValue);
        members.$object = type.$object;
        return members;
    }

    /**
     *
     */
    function mapObject(key, value) {
        switch (key) {
            case '$classname': // TODO: think about this at some point...
                //case '$instanceid'
                //case '$originalid'
                return undefined;
            default:
                return mapValue(value);
        }

    }

    /**
     * @returns {}
     */
    function mapValue(value) {
        if (isType(value)) {
            return value.$array ? asArray(value) : asObject(value);
        }
        return value;
    }

    return Parser;

}());



/**
 * Tracking EDB input. Note that the {edb.ScriptPlugin} is using this
 * plugin, so don't assume the existence of `this.spirit` around here. 
 * (the ScriptPlugin residers over in the edbml module, if you wonder).
 * @extends {gui.Tracker}
 */
edb.InputPlugin = gui.Tracker.extend({

    /**
     * True when one of each expected input type has been collected.
     * @type {boolean}
     */
    done: true,

    /**
     * Construction time.
     * @overrides {gui.Tracker#onconstruct}
     */
    onconstruct: function() {
        this._super.onconstruct();
        this.context = self; // TODO: deprecate this whole thing...
        this._watches = [];
        this._matches = [];
        this._needing = [];
    },

    /**
     * Destruction time.
     */
    ondestruct: function() {
        this._super.ondestruct();
        this.remove(this._watches);
    },

    /**
     * Add handler for one or more input types.
     * @param {edb.Type|String|Array<edb.Type|String>} arg
     * @param @optional {IInputHandler} handler Defaults to this.spirit
     * @param @optional {IInputHandler} handler Defaults to this.spirit
     * @returns {gui.InputPlugin}
     */
    add: gui.Combo.chained(function(arg, handler, required) {
        handler = handler ? handler : this.spirit;
        arg = edb.InputPlugin._breakdown(arg, this.context);
        if (arg.length) {
            this.done = this.done && required === false;
            this._add(arg, handler, required);
            this._subscribe(true);
        }
    }),


    /**
     * Remove handler for one or more input types.
     * TODO: Cleanup more stuff?
     * @param {edb.Type|String|Array<edb.Type|String>} arg
     * @param @optional {IInputHandler} handler Defaults to this.spirit
     * @returns {gui.InputPlugin}
     */
    remove: gui.Combo.chained(function(arg, handler) {
        handler = handler ? handler : this.spirit;
        arg = edb.InputPlugin._breakdown(arg, this.context);
        if (arg.length) {
            this._remove(arg, handler);
            this.done = this._done();
        }
    }),

    /**
     * Get data for latest input of type (or closest match).
     * TODO: Safeguard somewhat
     * @param {function} Type
     * @returns {object}
     */
    get: function(Type) {
        var types = this._matches.map(function(input) {
            return input.data.constructor;
        });
        var best = edb.InputPlugin._bestmatch(Type, types, false);
        var input = best ? this._matches.filter(function(input) {
            return input.type === best;
        }).shift() : null;
        return input ? input.data : null;
    },

    /**
     * Evaluate new input.
     * @param {gui.Broadcast} b
     */
    onbroadcast: function(b) {
        if (b.type === edb.BROADCAST_OUTPUT) {
            this.$oninput(b.data);
        }
    },

    /**
     * Collect matching input.
     * @param {edb.Input} input
     */
    match: function(input) {
        var needstesting = !this._matches.length;
        if (needstesting || this._matches.every(function(match) {
            return match.$instanceid !== input.$instanceid;
        })) {
            return this._maybeinput(input);
        }
        return false;
    },


    // Privileged ................................................................

    /**
     * Evaluate input.
     * @param {edb.Input} input
     */
    $oninput: function(input) {
        if (input.data === null) {
            this._mayberevoke(input);
            return false;
        } else {
            return this.match(input);
        }
    },


    // Private ...................................................................

    /**
     * Expecting instances of these types (or best match).
     * @type {Array<constructor>}
     */
    _watches: null,

    /**
     * Latest (best) matches, one of each expected type.
     * @type {Array<edb.Input>}
     */
    _matches: null,

    /**
     * Listing strictly `required` types (or best match).
     * @type {Array<constructor>}
     */
    _needing: null,

    /**
     * Add input handler for types.
     * @param {Array<function>} types
     * @param {IInputHandler} handler
     * @param {boolean} required
     */
    _add: function(types, handler, required) {
        types.forEach(function(Type) {
            if (gui.Type.isDefined(Type)) {
                this._addchecks(Type.$classid, [handler]);
                this._watches.push(Type);
                if (required) {
                    this._needing.push(Type);
                }
            } else {
                throw new TypeError("Could not register input for undefined Type");
            }
        }, this);
        types.forEach(function(Type) {
            gui.Class.descendantsAndSelf(Type, function(T) {
                if (T.out(this.context)) { // type has been output already?
                    this._maybeinput(edb.Output.$get(T));
                }
            }, this);
        }, this);
    },

    /**
     * Remove input handler for types.
     * @param {Array<function>} types
     * @param {IInputHandler} handler
     */
    _remove: function(types, handler) {
        types.forEach(function(Type) {
            gui.Array.remove(this._watches, Type);
            gui.Array.remove(this._needing, Type);
            this._removechecks(Type.$classid, [handler]);
            if (!this._watches.length) {
                this._subscribe(false);
            }
        }, this);
    },

    /**
     * If input matches registered type, update handlers.
     * @param {edb.Input} input
     */
    _maybeinput: function(input) {
        var best = edb.InputPlugin._bestmatch(input.type, this._watches, true);
        if (best) {
            this._updatematch(input, best);
            this.done = this._done();
            this._updatehandlers(input);
            return true;
        }
        return false;
    },

    /**
     * Evaluate revoked output.
     * @param {edb.Input} input
     */
    _mayberevoke: function(input) {
        var matches = this._matches;
        var watches = this._watches;
        var best = edb.InputPlugin._bestmatch(input.type, watches, true);
        if (best) {
            var oldinput = matches.filter(function(input) {
                return input.type === best;
            })[0];
            var index = matches.indexOf(oldinput);
            matches.splice(index, 1);
            this.done = this._done();
            if (!this.done) {
                input.revoked = true;
                this._updatehandlers(input);
            }
        }
    },

    /**
     * Register match for type (remove old match if any).
     * @param {edb.Input} newinput
     * @param {constructor} bestmatch
     */
    _updatematch: function(newinput, bestmatch) {
        var matches = this._matches,
            oldindex = -1,
            oldrating = -1,
            newrating = edb.InputPlugin._rateone(newinput.type, bestmatch);
        matches.forEach(function oldbestmatch(match, i) {
            oldrating = edb.InputPlugin._rateone(match.type, bestmatch);
            if (oldrating > -1 && oldrating <= newrating) {
                oldindex = i;
            }
        });
        if (oldindex > -1) {
            matches[oldindex] = newinput;
        } else {
            matches.push(newinput);
        }
    },

    /**
     * Update input handlers.
     * @param {edb.Input} input
     */
    _updatehandlers: function(input) {
        gui.Class.ancestorsAndSelf(input.type, function(Type) {
            var list = this._trackedtypes[Type.$classid];
            if (list) {
                list.forEach(function(checks) {
                    var handler = checks[0];
                    handler.oninput(input);
                });
            }
        }, this);
    },

    /**
     * All required inputs has been aquired?
     * @returns {boolean}
     */
    _done: function() {
        var needs = this._needing;
        var haves = this._matches;
        return needs.every(function(Type) {
            return haves.some(function(input) {
                return (input.data instanceof Type);
            });
        });
    },

    /**
     * @param {boolean} is
     */
    _subscribe: function(is) {
        gui.Broadcast[is ? "add" : "remove"](edb.BROADCAST_OUTPUT, this);
    }


}, {}, { // Static .............................................................

    /**
     * Breakdown argument into array of one or more types.
     * @param {object} arg
     * @param {Window} context
     * @returns {Array<function>}
     */
    _breakdown: function(arg, context) {
        if (gui.Type.isArray(arg)) {
            return this._breakarray(arg, context);
        } else {
            return this._breakother(arg, context);
        }
    },

    /**
     * Breakdown array.
     * @param {Array<function|String|object>}
     * @returns {Array<function>}
     * @param {Window} context
     * @returns {Array<function>}
     */
    _breakarray: function(array, context) {
        return array.map(function(o) {
            switch (gui.Type.of(o)) {
                case "function":
                    return o;
                case "string":
                    return gui.Object.lookup(o, context);
                case "object":
                    console.error("Expected function. Got object.");
            }
        }, this);
    },

    /**
     * Breakdown unarray.
     * @param {function|String|object} arg
     * @returns {Array<function>}
     * @param {Window} context
     * @returns {Array<function>}
     */
    _breakother: function(arg, context) {
        switch (gui.Type.of(arg)) {
            case "function":
                return [arg];
            case "string":
                return this._breakarray(arg.split(" "), context);
            case "object":
                console.error("Expected function. Got object.");
        }
    },

    /**
     * Lookup identical or ancestor/descandant constructor.
     * @param {function} target type constructor
     * @param {Array<function>} types type constructors
     * @param {boolean} up Lookup ancestor?
     * @returns {constructor}
     */
    _bestmatch: function(target, types, up) {
        var best = null,
            rating = Number.MAX_VALUE;
        this._rateall(target, types, up, function(type, rate) {
            if (rate > -1 && rate < rating) {
                rating = rate;
                best = type;
            }
        });
        return best;
    },

    /**
     * Rate all types.
     * @param {function} t
     * @param {Array<function>} types
     * @param {boolean} up Rate ancestor?
     * @param {function} action
     */
    _rateall: function(target, types, up, action) {
        types.forEach(function(type) {
            action(type, this._rateone(
                up ? target : type, up ? type : target
            ));
        }, this);
    },

    /**
     * Rate single type.
     * TODO: Memoize using `$classname` or something (abort for anonymous types!)
     * @type {constructor} target
     * @type {constructor} type
     * @returns {number} The degree of ancestral separation (-1 for none)
     */
    _rateone: function(target, type) {
        var r = 0,
            rating = -1,
            parent = target;
        if (target === type) {
            rating = 0;
        } else {
            while ((parent = gui.Class.parent(parent))) {
                r++;
                if (parent === type) {
                    parent = null;
                    rating = r;
                }
            }
            /* This would rate the degree of descendant separation ...
                var children;
                (function descend(t, level) {
                    if ((children = gui.Class.children(t)).length) {
                        if(children.indexOf(type) >-1) {
                            rating = level;
                        } else {
                            children.every(function(c) {
                                descend(c,level + 1);
                                return rating === -1;
                            });
                        }
                    }
                }(target,1));
            */
        }
        return rating;
    }

});



/*
 * Register module.
 */
gui.module("edb@wunderbyte.com", {

    /*
     * Register plugins for all spirits 
     * (if the GUI spirits are avilable).
     */
    plugin: {
        input: edb.InputPlugin
    }

});



/**
 * Namepspace edbml.
 */
window.edbml = gui.namespace('edbml', {

    /**
     * Automatically load EDBML scripts by naming convention?
     * (ns.MySpirit would automatically load ns.MySpirit.edbml)
     * @type {boolean}
     */
    bootload: false,

    /**
     * EDBML script declaration micro DSL.
     * @param {String} id
     */
    declare: function(id) {
        var config, script;
        return {
            as: function($edbml) {
                config = edbml.$runtimeconfigure($edbml);
                script = gui.Object.assert(id, config);
                script.$bind = function() {
                    console.error('Deprecated API is deprecated: $bind');
                };
                script.lock = function(out) {
                    return script({
                        $out: out
                    });
                };
                return this;
            },
            withInstructions: function(pis) {
                script.$instructions = pis;
            }
        };
    },


    // Privileged ................................................................

    /**
     * Register action to execute later.
     * @param {function} action
     * @param {object} thisp
     * @returns {function}
     */
    $set: function(action, thisp) {
        return this._assign(action, thisp);
    },

    /**
     * Get something from registered action.
     * NOTE: {gui.ConfigPlugin} hardcoded `$edb.get`
     * TODO: {gui.ConfigPlugin} should not hardcode
     * @param {string} key
     * @param @optional {string} sig
     */
    $get: function(key) {
        return this._request(key);
    },

    /**
     * Execute action with no return value.
     * NOTE: {edb.FunctionUpdate} hardcoded `edb.$run`
     * TODO: why was this split up in two steps? Sandboxing?
     * @param {Event} e
     * @param {string} key
     * @param @optional {string} sig
     */
    $run: function(e, key) {
        this._register(e);
        this._invoke(key);
    },

    /**
     * Garbage collect function that isn't called by the
     * GUI using whatever strategy they prefer nowadays.
     */
    $revoke: function(key) {
        this._invokables[key] = null; // garbage one
        delete this._invokables[key]; // garbage two
    },

    /**
     * Configure EDBML function for runtime use. The method `$input` 
     * will be added just-in-time by the the {ts.gui.ScriptPlugin}.
     * @see {ts.gui.ScriptPlugin#_runtimeconfigure}
     * @param {function} $edbml The (compiled) function as served to the page
     * @returns {function}
     */
    $runtimeconfigure: function($edbml) {
        function configured($in) {
            $edbml.$out = ($in && $in.$out) ? $in.$out : new edbml.Out();
            $edbml.$att = new edbml.Att();
            return $edbml.apply(this, arguments);
        }
        configured.$edbml = $edbml; // support further extension of base function
        return configured;
    },


    // Private ...................................................................

    /**
     * Loggin event details.
     * @type {Map<String,object>}
     */
    _latestevent: null,

    /**
     * Mapping EDBML-internal functions to keys 
     * so that they may later be recalled to run.
     * @type {Map<String,function>}
     */
    _invokables: {},

    /**
     * Map function to generated key and return the key.
     * @param {function} func
     * @param {object} thisp
     * @returns {String}
     */
    _assign: function(func, thisp) {
        var key = gui.KeyMaster.generateKey();
        this._invokables[key] = function(value, checked) {
            return func.apply(thisp, [gui.Type.cast(value), checked]);
        };
        return key;
    },
    
    /**
     * TODO: Revoke invokable on spirit destruct (release memory)
     * @param {string} key
     * @param @optional {String} sig
     * @param @optional {Map<String,object>} log
     */
    _invoke: function(key, sig, log) {
        log = log || this._latestevent;
        if (sig) {
            this._invokeremote(key, sig, log);
        } else {
            this._invokelocal(key, log);
        }
    },

    /**
     * This would relate to the sandbox (not in codebase currently).
     * TODO: Target should only be spirits now, move to data arg...
     */
    _invokeremote: function(key, sig, log) {
        gui.Broadcast.$target = this;
        gui.Broadcast.dispatchGlobal(edb.BROADCAST_SCRIPT_INVOKE, {
            key: key,
            sig: sig,
            log: log
        });
    },

    /*
     * Invoke internal EDBML function in this window context.
     * Timeout is a cosmetic stunt to unfreeze a pressed
     * button in case the function takes a while to complete. 
     * One might think of more events that could be listed.
     */
    _invokelocal: function(key, log) {
        var func = this._invokables[key];
        if (func) {
            if (log) {
                if (log.type === "click") {
                    gui.Tick.time(function() {
                        func(log.value, log.checked);
                    });
                } else {
                    func(log.value, log.checked);
                }
            } else {
                func();
            }
        } else {
            console.error("out of synch");
        }
    },

    /**
     * Yerh.
     */
    _request: function(key, sig) {
        var func;
        if (sig) {
            console.error("Not supported");
        } else {
            if ((func = this._invokables[key])) {
                return func();
            } else {
                console.error("out of synch");
            }
        }
    },

    /**
     * Keep a log on the latest DOM event. Perhaps it's 
     * because events don't take to async implementation, 
     * though it's probably so we can send it to sandbox.
     * @param {Event} e
     */
    _register: function(e) {
        this._latestevent = e ? {
            type: e.type,
            value: e.target.value,
            checked: e.target.checked
        } : null;
    }

});



/**
 * Converts JS props to HTML attributes during EDBML rendering phase.
 * Any methods added to this prototype will become available in EDBML
 * scripts as `$att.mymethod()`
 * @param @optional Map<String,object> atts Default properties
 */
edbml.Att = function Att(atts) {
    if (atts) {
        gui.Object.extend(this, atts);
    }
};

edbml.Att.prototype = gui.Object.create(null, {

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object edbml.Att]";
    },


    // Privileged ................................................................

    /**
     * Resolve key-value to HTML attribute declaration.
     * @param {String} att
     * @returns {String}
     */
    $html: function(att) {
        var val = this[att],
            html = "";
        switch (gui.Type.of(val)) {
            case "null":
            case "undefined":
                break;
            default:
                val = edbml.Att.$encode(this[att]);
                html += att + "=\"" + val + "\" ";
                break;
        }
        return html;
    },

    /**
     * Resolve key-value, then delete it to prevent reuse.
     * @param {String} att
     */
    $pop: function(att) {
        var html = this._out(att);
        delete this[att];
        return html;
    },

    /**
     * Resolve all key-values to HTML attribute declarations.
     * @returns {String}
     */
    $all: function() {
        var html = "";
        gui.Object.nonmethods(this).forEach(function(att) {
            html += this._out(att);
        }, this);
        return html;
    }

});


// Static privileged ...........................................................

/**
 * Stringify stuff to be used as HTML attribute values.
 * @param {object} data
 * @returns {String}
 */
edbml.Att.$encode = function(data) {
    var type = gui.Type.of(data);
    switch (type) {
        case "string":
            break;
        case "number":
        case "boolean":
            data = String(data);
            break;
        case "object":
        case "array":
            try {
                data = encodeURIComponent(JSON.stringify(data));
            } catch (jsonex) {
                throw new Error("Could not create HTML attribute: " + jsonex);
            }
            break;
        case "date":
            throw new Error("TODO: edbml.Att.encode standard date format?");
        default:
            throw new Error("Could not create HTML attribute for " + type);
    }
    return data;
};



/**
 * Collects HTML output during EDBML rendering phase.
 * Any methods added to this prototype will become
 * available in EDBML scripts as: out.mymethod()
 */
edbml.Out = function Out() {};

edbml.Out.prototype = {

    /**
     * HTML string (not well-formed while parsing).
     * @type {String}
     */
    html: "",

    /**
     * Identification.
     * @returns {String}
     */
    toString: function() {
        return "[object edbml.Out]";
    },

    /**
     * Get HTML result (output override scenario).
     * @returns {String}
     */
    write: function() {
        return this.html;
    }
};



/**
 * Utilities for the {edbml.UpdateManager}.
 */
edbml.UpdateAssistant = {

    /**
     * @static
     * Get ID for element.
     * @param {Element} element
     * @returns {String}
     */
    id: function(element) {
        return element.id || null;
    },

    /**
     * @static
     * Parse markup to element.
     * TODO: Use DOMParser versus "text/html" for browsers that support it?
     * TODO: All sorts of edge cases for IE6 compatibility. Hooray for HTML5.
     * TODO: Evaluate well-formedness in debug mode for XHTML documents.
     * @param {Document} doc
     * @param {String} markup
     * @param {String} id
     * @param {Element} element
     * @returns {Element}
     */
    parse: function(doc, markup, id, element) { // gonna need to know the parent element type here...
        /*
         * TODO: run this by the gui.HTMLParser for maximum backwards lameness with TABLE and friends
         */
        element = doc.createElement(element.localName);
        element.innerHTML = markup;
        element.id = id;
        // TODO: Plugin this!
        Array.forEach(element.querySelectorAll("option"), function(option) {
            switch (option.getAttribute("selected")) {
                case "true":
                    option.setAttribute("selected", "selected");
                    break;
                case "false":
                    option.removeAttribute("selected");
                    break;
            }
        });
        // TODO: Plugin this!
        var inputs = "input[type=checkbox],input[type=radio]";
        Array.forEach(element.querySelectorAll(inputs), function(option) {
            switch (option.getAttribute("checked")) {
                case "true":
                    option.setAttribute("checked", "checked");
                    break;
                case "false":
                    option.removeAttribute("checked");
                    break;
            }
        });
        return element;
    },

    /**
     * @static
     * Mapping element id to it's ordinal position.
     * @returns {Map<String,number>}
     */
    order: function(nodes) {
        var order = new Map();
        Array.forEach(nodes, function(node, index) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                order.set(this.id(node), index);
            }
        }, this);
        return order;
    },

    /**
     * @static
     * Convert an NodeList into an ID-to-element map.
     * @param {NodeList} nodes
     * @return {Map<String,Element>}
     */
    index: function(nodes) {
        var result = Object.create(null);
        Array.forEach(nodes, function(node, index) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                result[this.id(node)] = node;
            }
        }, this);
        return result;
    }
};



/**
 * It's the update manager.
 * @param {gui.Spirit} spirit
 */
edbml.UpdateManager = gui.Class.create(Object.prototype, {

    /**
     * @param {gui.Spirit} spirit
     */
    onconstruct: function(spirit) {
        this._keyid = spirit.dom.id() || spirit.$instanceid;
        this._spirit = spirit;
        this._doc = spirit.document;
    },

    /**
     * Update.
     * @param {String} html
     */
    update: function(html) {
        if (!this._spirit.life.destructed) {
            this._updates = new edbml.UpdateCollector();
            this._functions = {};
            if (!this._olddom) {
                this._first(html);
            } else {
                this._next(html);
                this._updates.collect(
                    new edbml.FunctionUpdate(this._doc).setup(
                        this._keyid,
                        this._functions
                    )
                );
            }
            this._updates.eachRelevant(function(update) {
                update.update();
                update.dispose();
            });
            if (this._updates) { // huh? how can it be null?
                this._updates.dispose();
            }
            this._updates = null;
        }
    },


    // Private ...................................................................

    /**
     * This can be one of two:
     * 1) Spirit element ID (if element has ID).
     * 2) Spirits $instanceid (if no element ID).
     * @type {String}
     */
    _keyid: null,

    /**
     * Spirit document.
     * @type {Document}
     */
    _doc: null,

    /**
     * Associated spirit.
     * @type {gui.Spirit}
     */
    _spirit: null,

    /**
     * Current DOM subtree.
     * @type {Document}
     */
    _olddom: null,

    /**
     * Incoming DOM subtree.
     * @type {Document}
     */
    _nedwdom: null,

    /**
     * List of updates to apply.
     * @type {[type]}
     */
    _updates: null,

    /**
     * Assistant utilities.
     * @type {edbml.UpdateAssistant}
     */
    _assistant: edbml.UpdateAssistant,

    /**
     * First update (always a hard update).
     * @param {String} html
     */
    _first: function(html) {
        this._olddom = this._parse(html);
        this._updates.collect(
            new edbml.HardUpdate(this._doc).setup(this._keyid, this._olddom)
        );
    },

    /**
     * Next update.
     * @param {String} html
     */
    _next: function(html) {
        this._newdom = this._parse(html);
        this._crawl(this._newdom, this._olddom, this._newdom, this._keyid, {});
        this._olddom = this._newdom;
    },

    /**
     * Parse markup to element.
     * @param {String} html
     * @returns {Element}
     */
    _parse: function(html) {
        return this._assistant.parse(
            this._doc,
            html,
            this._keyid,
            this._spirit.element
        );
    },

    /**
     * Crawl.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @param {Element} lastnode
     * @param {String} id
     * @param {Map<String,boolean>} ids
     * @returns {boolean}
     */
    _crawl: function(newchild, oldchild, lastnode, id, ids) {
        var result = true;
        while (newchild && oldchild && !this._updates.hardupdates(id)) {
            switch (newchild.nodeType) {
                case Node.TEXT_NODE:
                    result = this._check(newchild, oldchild, lastnode, id, ids);
                    break;
                case Node.ELEMENT_NODE:
                    result = this._scan(newchild, oldchild, lastnode, id, ids);
                    break;
            }
            newchild = newchild.nextSibling;
            oldchild = oldchild.nextSibling;
        }
        return result;
    },

    /**
     * Scan elements.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @param {Element} lastnode
     * @param {String} id
     * @param {Map<String,boolean>} ids
     * @returns {boolean}
     */
    _scan: function(newnode, oldnode, lastnode, id, ids) {
        var result = true,
            oldid = this._assistant.id(oldnode);
        if ((result = this._check(newnode, oldnode, lastnode, id, ids))) {
            if (oldid) {
                ids = gui.Object.copy(ids);
                lastnode = newnode;
                ids[oldid] = true;
                id = oldid;
            }
            result = this._crawl(newnode.firstChild, oldnode.firstChild, lastnode, id, ids);
        }
        return result;
    },

    /**
     * Hello.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @param {Element} lastnode
     * @param {String} id
     * @param {Map<String,boolean>} ids
     * @returns {boolean}
     */
    _check: function(newnode, oldnode, lastnode, id, ids) {
        var result = true;
        var isSoftUpdate = false;
        var isPluginUpdate = false; // TODO: plugins...
        if ((newnode && !oldnode) || (!newnode && oldnode)) {
            result = false;
        } else if ((result = newnode.nodeType === oldnode.nodeType)) {
            switch (oldnode.nodeType) {
                case Node.TEXT_NODE:
                    if (newnode.data !== oldnode.data) {
                        result = false;
                    }
                    break;
                case Node.ELEMENT_NODE:
                    if ((result = this._familiar(newnode, oldnode))) {
                        if ((result = this._checkatts(newnode, oldnode, ids))) {
                            if (this._maybesoft(newnode, oldnode)) {
                                if (this._confirmsoft(newnode, oldnode)) {
                                    this._updatesoft(newnode, oldnode, ids);
                                    isSoftUpdate = true; // prevents the replace update
                                }
                                result = false; // crawling continued in _updatesoft
                            } else {
                                if (oldnode.localName !== "textarea") { // TODO: better forms support!
                                    result = newnode.childNodes.length === oldnode.childNodes.length;
                                    if (!result && oldnode.id) {
                                        lastnode = newnode;
                                        id = oldnode.id;
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }
        if (!result && !isSoftUpdate && !isPluginUpdate) {
            this._updates.collect(new edbml.FunctionUpdate(this._doc).setup(id));
            this._updates.collect(new edbml.HardUpdate(this._doc).setup(id, lastnode));
        }
        return result;
    },

    /**
     * Roughly estimate whether two elements could be identical.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @returns {boolean}
     */
    _familiar: function(newnode, oldnode) {
        return ["namespaceURI", "localName"].every(function(prop) {
            return newnode[prop] === oldnode[prop];
        });
    },

    /**
     * Same id trigges attribute synchronization;
     * different id triggers hard update of ancestor.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @param {Map<String,boolean>} ids
     * @returns {boolean} When false, replace "hard" and stop crawling.
     */
    _checkatts: function(newnode, oldnode, ids) {
        var result = true;
        var update = null;
        if (this._attschanged(newnode.attributes, oldnode.attributes, ids)) {
            var newid = this._assistant.id(newnode);
            var oldid = this._assistant.id(oldnode);
            if (newid && newid === oldid) {
                update = new edbml.AttsUpdate(this._doc).setup(oldid, newnode, oldnode);
                this._updates.collect(update, ids);
            } else {
                result = false;
            }
        }
        return result;
    },

    /**
     * Attributes changed? When an attribute update is triggered by an EDB poke,
     * we verify that this was the *only* thing that changed and substitute the
     * default update with a {edbml.FunctionUpdate}.
     * @see {edbml.FunctionUpdate}
     * @param {NodeList} newatts
     * @param {NodeList} oldatts
     * @param {?} ids
     * @returns {boolean}
     */
    _attschanged: function(newatts, oldatts, ids) {
        var changed = newatts.length !== oldatts.length;
        if (!changed) {
            changed = !Array.every(newatts, function ischanged(newatt) {
                var oldatt = oldatts.getNamedItem(newatt.name);
                return oldatt &&
                    (oldatt.value === newatt.value) ||
                    this._functionchanged(newatt.value, oldatt.value);
            }, this);
        }
        return changed;
    },

    /**
     * Attribute change was only an `edbml.$run` or `edbml.$get` statement?
     * @param {string} newval
     * @param {string} oldval
     * @returns {boolean}
     */
    _functionchanged: function(newval, oldval) {
        if ([newval, oldval].every(function(val) {
            return val.contains('edbml.$');
        })) {
            var newkeys = gui.KeyMaster.extractKey(newval);
            var oldkeys = gui.KeyMaster.extractKey(oldval);
            if (newkeys && oldkeys) {
                oldkeys.forEach(function(oldkey, i) {
                    var newkey = newkeys[i];
                    newval = newval.replace(newkey, '');
                    oldval = oldval.replace(oldkey, '');
                    this._functions[oldkey] = newkey;
                }, this);
                return newval === oldval;
            }
        }
        return false;
    },

    /**
     * Are element children candidates for "soft" sibling updates?
     * 1) Both parents must have the same ID
     * 2) All children must have a specified ID
     * 3) All children must be elements or whitespace-only textnodes
     * @param {Element} newnode
     * @param {Element} oldnode
     * @return {boolean}
     */
    _maybesoft: function(newnode, oldnode) {
        if (newnode && oldnode) {
            return newnode.id && newnode.id === oldnode.id &&
                this._maybesoft(newnode) &&
                this._maybesoft(oldnode);
        } else {
            return Array.every(newnode.childNodes, function(node) {
                var res = true;
                switch (node.nodeType) {
                    case Node.TEXT_NODE:
                        res = node.data.trim() === "";
                        break;
                    case Node.ELEMENT_NODE:
                        res = this._assistant.id(node) !== null;
                        break;
                }
                return res;
            }, this);
        }
    },

    /**
     * "soft" siblings can only be inserted and removed. This method verifies that
     * elements retain their relative positioning before and after an update. Changing
     * the ordinal position of elements is not supported since this might destruct UI
     * state (moving eg. an iframe around using DOM methods would reload the iframe).
     * TODO: Default support ordering and make it opt-out instead?
     * @param {Element} newnode
     * @param {Element} oldnode
     * @returns {boolean}
     */
    _confirmsoft: function(newnode, oldnode) {
        var res = true,
            prev = null;
        var oldorder = this._assistant.order(oldnode.childNodes);
        return Array.every(newnode.childNodes, function(node, index) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                var id = this._assistant.id(node);
                if (oldorder.has(id) && oldorder.has(prev)) {
                    res = oldorder.get(id) > oldorder.get(prev);
                }
                prev = id;
            }
            return res;
        }, this);
    },

    /**
     * Update "soft" siblings.
     * @param {Element} newnode
     * @param {Element} oldnode
     * @param {Map<String,boolean>} ids
     * @return {boolean}
     */
    _updatesoft: function(newnode, oldnode, ids) {
        var updates = [];
        var news = this._assistant.index(newnode.childNodes);
        var olds = this._assistant.index(oldnode.childNodes);
        /*
         * Add elements?
         */
        var child = newnode.lastElementChild,
            topid = this._assistant.id(oldnode),
            oldid = null,
            newid = null;
        while (child) {
            newid = this._assistant.id(child);
            if (!olds[newid]) {
                if (oldid) {
                    updates.push(
                        new edbml.InsertUpdate(this._doc).setup(oldid, child)
                    );
                } else {
                    updates.push(
                        new edbml.AppendUpdate(this._doc).setup(topid, child)
                    );
                }
            } else {
                oldid = newid;
            }
            child = child.previousElementSibling;
        }
        /*
         * Remove elements?
         */
        Object.keys(olds).forEach(function(id) {
            if (!news[id]) {
                updates.push(
                    new edbml.RemoveUpdate(this._doc).setup(id)
                );
                updates.push(
                    new edbml.FunctionUpdate(this._doc).setup(id)
                );
            } else { // note that crawling continues here...
                var n1 = news[id];
                var n2 = olds[id];
                this._scan(n1, n2, n1, id, ids);
            }
        }, this);
        /*
         * Register updates
         */
        updates.reverse().forEach(function(update) {
            this._updates.collect(update, ids);
        }, this);
    }

});



/**
 * We collect updates over-aggresively in an attempt to traverse
 * the DOM tree in one direction only. The fellow will helps us
 * reduce the collected updates to the minimum required subset.
 */
edbml.UpdateCollector = gui.Class.create(Object.prototype, {

    /**
     * Setup.
     */
    onconstruct: function() {
        this._updates = [];
        this._hardupdates = {};
    },

    /**
     * Collect update candidate. All updates may not be evaluated, see below.
     * @param {edbml.Update} update
     * @param {Map<String,boolean>} ids Indexing ID of ancestor elements
     * @returns {edbml.UpdateCollector}
     */
    collect: function(update, ids) {
        this._updates.push(update);
        if (update.type === edbml.Update.TYPE_HARD) {
            this._hardupdates[update.id] = true;
        } else {
            update.ids = ids || {};
        }
        return this;
    },

    /**
     * Will this element be hardupdated?
     * @param {String} id Element ID
     * @returns {boolean}
     */
    hardupdates: function(id) {
        return this._hardupdates[id] ? true : false;
    },

    /**
     * Apply action to all relevant updates. For example:
     * An attribute update is not considered relevant if
     * the parent is scheduled to perform a full replace
     * of it's children.
     * @param {function} action
     */
    eachRelevant: function(action) {
        this._updates.filter(function(update) {
            return (
                update.type === edbml.Update.TYPE_HARD ||
                Object.keys(update.ids).every(function(id) {
                    return !this._hardupdates[id];
                }, this)
            );
        }, this).forEach(function(update) {
            action(update);
        });
    },

    /**
     * TODO: At some point, figure out what exactly to do here.
     */
    dispose: function() {
        this._hardupdates = null;
        this._updates = null;
    },

    // Private ...................................................................

    /**
     * Collecting updates.
     * @type {Array<edbml.Update>}
     */
    _updates: null,

    /**
     * Tracking hard-updated element IDs.
     * @type {Set<String>}
     */
    _hardupdates: null

});



/**
 * Year!
 */
edbml.Update = gui.Class.create(Object.prototype, {

    /**
     * Matches hard|atts|insert|append|remove|function
     * @type {String}
     */
    type: null,

    /**
     * Identifies associated element in one of two ways:
     *
     * 1) It's the id of an element in this.window. Or if no id:
     * 2) It's the $instanceid of a {gui.Spirít} in this.window
     * @see  {edbml.Update#element}
     * @type {String}
     */
    id: null,

    /**
     * Tracking ancestor element IDs. We use this to regulate whether an
     * update should be discarded because a hard replace has obsoleted it.
     * @type {Map<String,boolean>}
     */
    ids: null,

    /**
     * Update context window.
     * @type {Window}
     */
    window: null,

    /**
     * Update context document.
     * @type {Document}
     */
    document: null,

    /**
     * Invoked when update is newed up.
     * @param {Document} doc
     */
    onconstruct: function(doc) {
        this.window = doc.defaultView;
        this.document = doc;
    },

    /**
     * Hello.
     * @returns {edbml.Update}
     */
    setup: function() {
        return this;
    },

    /**
     * The update method performs the actual update. Expect methods
     * _beforeUpdate and _afterUpdate to be invoked at this point.
     */
    update: function() {},

    /**
     * Get element associated to this.id. Depending on update type,
     * this element will be removed or added or updated and so on.
     * The root element (the one whose spirit is assigned the script)
     * may be indexed by "$instanceid" if no ID attribute is specified.
     * @returns {Element}
     */
    element: function() {
        var spirit, element = null;
        if (gui.KeyMaster.isKey(this.id)) {
            if ((spirit = this.window.gui.get(this.id))) {
                element = spirit.element;
            }
        }
        element = element || document.querySelector('#' + this.id);
        if (!element) {
            console.error("No element to match @id: " + this.id);
        }
        return element;
    },

    /**
     * Clean stuff up for what it's worth.
     */
    dispose: function() {
        this.window = null;
        this.document = null;
    },


    // Private ...................................................................

    /**
     * When something changed, dispatch pre-update event.
     * @param {Element} element
     * @return {boolean}
     */
    _beforeUpdate: function(element) {
        var event = "x-beforeupdate-" + this.type;
        return this._dispatch(element, event);
    },

    /**
     * When something changed, dispatch post-update event.
     * @param {Element} element
     * @return {boolean}
     */
    _afterUpdate: function(element) {
        var event = "x-afterupdate-" + this.type;
        return this._dispatch(element, event);
    },

    /**
     * Dispatch bubbling DOM event for potential handlers to intercept the update.
     * TODO: Investigate CustomEvent support in our browser stack...
     * @param {Element} element
     * @param {String} name
     * @return {boolean} False if event was canceled
     */
    _dispatch: function(element, name) {
        var event = this.document.createEvent("UIEvents");
        event.initEvent(name, true, true);
        return element.dispatchEvent(event);
    },

    /**
     * Report update in debug mode.
     * @param {String} report
     */
    _report: function(report) {
        if (edbml.debug) {
            if (gui.KeyMaster.isKey(this.id)) {
                report = report.replace(this.id, "(anonymous)");
            }
            console.debug(report);
        }
    }


}, {}, { // Static .............................................................

    /**
     * Default replace update. A section of the DOM tree is replaced.
     * {@see ReplaceUpdate}
     * @type {String}
     */
    TYPE_HARD: "hard",

    /**
     * Attribute update. The element must have an ID specified.
     * {@see UpdateManager#hasSoftAttributes}
     * {@see AttributesUpdate}
     * @type {String}
     */
    TYPE_ATTS: "atts",

    /**
     * Insertion update: Inserts a child without replacing the parent. Child
     * siblings must all be Elements and they must all have an ID specified.
     * {@see SiblingUpdate}
     * @type {String}
     */
    TYPE_INSERT: "insert",

    /**
     * {@see SiblingUpdate}
     * @type {String}
     */
    TYPE_APPEND: "append",

    /**
     * Removal update: Removes a child without replacing the parent. Child
     * siblings must all be Elements and they must all have an ID specified.
     * {@see SiblingUpdate}
     * @type {String}
     */
    TYPE_REMOVE: "remove",

    /**
     * EDB function update. Dereferencing functions bound to GUI
     * events that are no longer associated to any DOM element.
     * @type {String}
     */
    TYPE_FUNCTION: "function"

});



/**
 * Update attributes. Except for the ID which
 * is required to be the same before and after.
 */
edbml.AttsUpdate = edbml.Update.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_ATTS,

    /**
     * (XML) element before update.
     * @type {Element}
     */
    _xold: null,

    /**
     * (XML) element after update.
     * @type {Element}
     */
    _xnew: null,

    /**
     * Tracking attribute changes for debugging.
     * @type {Array<String>}
     */
    _summary: null,

    /**
     * Construct.
     * @param {Document} doc
     */
    onconstruct: function(doc) {
        this._super.onconstruct(doc);
        this._summary = [];
    },

    /**
     * Setup update.
     * @param {String} id
     * @param {Element} xnew
     * @param {Element} xold
     * @returns {edbml.AttsUpdate}
     */
    setup: function(id, xnew, xold) {
        this._super.setup();
        this.id = id;
        this._xnew = xnew;
        this._xold = xold;
        return this;
    },

    /**
     * Update attributes.
     */
    update: function() {
        this._super.update();
        var element = this.element();
        if (this._beforeUpdate(element)) {
            this._update(element);
            this._afterUpdate(element);
            this._report();
        }
    },

    /**
     * Better not keep a reference to any DOM element around here.
     * @overrides {edbml.Update#dispose}
     */
    dispose: function() {
        this._super.dispose();
        delete this._xold;
        delete this._xnew;
    },


    // Private ...................................................................

    /**
     * Actually update attributes.
     * 1. Create and update attributes.
     * 2. Remove attributes
     * @param {HTMLElement} element
     */
    _update: function(element) {
        Array.forEach(this._xnew.attributes, function(newatt) {
            var oldatt = this._xold.getAttribute(newatt.name);
            if (oldatt === null || oldatt !== newatt.value) {
                this._set(element, newatt.name, newatt.value);
                this._summary.push(
                    "@" + newatt.name + "=\"" + newatt.value + "\"" +
                    (element.id ? ' (#' + element.id + ')' : '')
                );
            }
        }, this);
        Array.forEach(this._xold.attributes, function(oldatt) {
            if (!this._xnew.hasAttribute(oldatt.name)) {
                this._del(element, oldatt.name, null);
                this._summary.push(
                    "removed @" + oldatt.name +
                    (element.id ? ' (#' + element.id + ')' : '')
                );
            }
        }, this);
    },

    /**
     * Set element attribute.
     * @param {Element} element
     * @param {String} name
     * @param {String} value
     * @return
     */
    _set: function(element, name, value) {
        var spirit = element.spirit;
        if (spirit) {
            spirit.att.set(name, value);
        } else {
            element.setAttribute(name, value);
            switch (name) {
                case "checked":
                    if (!element.checked) {
                        element.checked = true;
                    }
                    break;
                case "value":
                    if (element.value !== value) {
                        element.value = String(value); // ?
                    }
                    break;
            }
        }
    },

    /**
     * Set element attribute.
     * @param {Element} element
     * @param {String} name
     * @param {String} value
     * @return
     */
    _del: function(element, name) {
        var spirit = element.spirit;
        if (spirit) {
            spirit.att.del(name);
        } else {
            switch (name) {
                case "checked":
                    element.checked = false;
                    break;
                default:
                    element.removeAttribute(name);
                    break;
            }
        }
    },

    /**
     * Debug changes.
     */
    _report: function() {
        this._super._report("edbml.AttsUpdate \"#" +
            this.id + "\" " + this._summary.join(", "));
    }

});



/**
 * Hey.
 */
edbml.HardUpdate = edbml.Update.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_HARD,

    /**
     * XML element.
     * @type {Element}
     */
    xelement: null,

    /**
     * Setup update.
     * @param {String} id
     * @param {Element} xelement
     * @returns {edbml.HardUpdate}
     */
    setup: function(id, xelement) {
        this._super.setup();
        this.id = id;
        this.xelement = xelement;
        return this;
    },

    /**
     * Replace target subtree.
     */
    update: function() {
        this._super.update();
        var element = this.element();
        if (element && this._beforeUpdate(element)) {
            //gui.DOMPlugin.html ( element, this.xelement.outerHTML );
            gui.DOMPlugin.html(element, this.xelement.innerHTML);
            this._afterUpdate(element);
            this._report();
        }
    },

    /**
     * Clean up.
     */
    dispose: function() {
        this._super.dispose();
        delete this.xelement;
    },


    // Private ...................................................................

    /**
     * Hello.
     */
    _report: function() {
        this._super._report("edbml.HardUpdate #" + this.id);
    }
});



/**
 * Soft update.
 * @extends {edbml.Update}
 */
edbml.SoftUpdate = edbml.Update.extend({

    /**
     * XML element stuff (not used by edbml.RemoveUpdate).
     * @type {Element}
     */
    xelement: null,

    /**
     * Update type defined by descendants.
     * Matches insert|append|remove
     * @type {String}
     */
    type: null,

    /**
     * Clean stuff up for what it's worth.
     */
    dispose: function() {
        this._super.dispose();
        delete this.xelement;
    },

    /**
     * TODO: make static, argument xelement
     * Convert XML element to HTML element. Method document.importNode can not
     * be used in Firefox, it will kill stuff such as the document.forms object.
     * TODO: Support namespaces and what not
     * @param {HTMLElement} element
     */
    _import: function(parent) {
        var temp = this.document.createElement(parent.nodeName);
        temp.innerHTML = this.xelement.outerHTML;
        return temp.firstChild;
    }
});



/**
 * Insert.
 * @extends {edbml.SoftUpdate}
 */
edbml.InsertUpdate = edbml.SoftUpdate.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_INSERT,

    /**
     * XML element.
     * @type {Element}
     */
    xelement: null,

    /**
     * Setup update.
     * @param {String} id Insert before this ID
     * @param {Element} xelement
     * @returns {edbml.InsertUpdate}
     */
    setup: function(id, xelement) {
        this.id = id;
        this.xelement = xelement;
        return this;
    },

    /**
     * Execute update.
     */
    update: function() {
        var sibling = this.element();
        var parent = sibling.parentNode;
        var child = this._import(parent);
        if (this._beforeUpdate(parent)) {
            parent.insertBefore(child, sibling);
            this._afterUpdate(child);
            this._report();
        }
    },

    /**
     * Report.
     * TODO: Push to update manager.
     */
    _report: function() {
        this._super._report(
            "edbml.InsertUpdate #" + this.xelement.getAttribute("id")
        );
    }
});



/**
 * Append.
 * @extends {edbml.SoftUpdate}
 */
edbml.AppendUpdate = edbml.SoftUpdate.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_APPEND,

    /**
     * Setup update.
     * @param {String} id
     * @param {Element} xelement
     * @returns {edbml.AppendUpdate}
     */
    setup: function(id, xelement) {
        this.id = id;
        this.xelement = xelement;
        return this;
    },

    /**
     * Execute update.
     */
    update: function() {
        var parent = this.element();
        var child = this._import(parent);
        if (this._beforeUpdate(parent)) {
            parent.appendChild(child);
            this._afterUpdate(child);
            this._report();
        }
    },

    /**
     * Report.
     * TODO: Push to update manager.
     */
    _report: function() {
        this._super._report(
            "edbml.AppendUpdate #" + this.xelement.getAttribute("id")
        );
    }
});



/**
 * Remove.
 * @extends {edbml.SoftUpdate}
 */
edbml.RemoveUpdate = edbml.SoftUpdate.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_REMOVE,

    /**
     * Setup update.
     * @param {String} id
     * @returns {edbml.RemoveUpdate}
     */
    setup: function(id) {
        this.id = id;
        return this;
    },

    /**
     * Execute update.
     */
    update: function() {
        var element = this.element();
        var parent = element.parentNode;
        if (this._beforeUpdate(element)) {
            parent.removeChild(element);
            this._afterUpdate(parent);
            this._report();
        }
    },

    /**
     * Report.
     * TODO: Push to update manager.
     */
    _report: function() {
        this._super._report("edbml.RemoveUpdate #" + this.id);
    }
});



/**
 * Updating the functions it is.
 * TODO: revoke all functions from destructed spirit (unless window.unload)
 */
edbml.FunctionUpdate = edbml.Update.extend({

    /**
     * Update type.
     * @type {String}
     */
    type: edbml.Update.TYPE_FUNCTION,

    /**
     * Setup update.
     * @param {String} id
     * @param @optional {Map<String,String>} map
     */
    setup: function(id, map) {
        this.id = id;
        this._map = map || null;
        return this;
    },

    /**
     * Do the update.
     */
    update: function() {
        var count = 0,
            elm = this.element();
        if (this._map) {
            if ((count = edbml.FunctionUpdate._remap(elm, this._map))) {
                this._report("remapped " + count + " keys");
            }
        } else {
            if ((count = edbml.FunctionUpdate._revoke(elm))) {
                this._report("revoked " + count + " keys");
            }
        }
    },

    /**
     * Report the update.
     * @param {String} report
     */
    _report: function(report) {
        this._super._report(
            "edbml.FunctionUpdate " + report + " (" + this.$instanceid + ")"
        );
    }


}, { // Static .................................................................

    /**
     * @param {Element} element
     */
    _revoke: function(element) {
        var att, count = 0,
            keys;
        this._getatts(element).forEach(function(x) {
            att = x[1];
            keys = gui.KeyMaster.extractKey(att.value);
            if (keys) {
                keys.forEach(function(key) {
                    edbml.$revoke(key);
                    count++;
                });
            }
        });
        return count;
    },

    /**
     * @param {Element} element
     * @param {Map<String,String>} map
     */
    _remap: function(element, map) {
        var count = 0,
            oldkeys, newkey, newval;
        if (Object.keys(map).length) {
            this._getatts(element).forEach(function(x) {
                var elm = x[0];
                var att = x[1];
                if ((oldkeys = gui.KeyMaster.extractKey(att.value))) {
                    oldkeys.forEach(function(oldkey) {
                        if ((newkey = map[oldkey])) {
                            newval = att.value.replace(oldkey, newkey);
                            elm.setAttribute(att.name, newval);
                            edbml.$revoke(oldkey);
                            count++;
                        }
                    });
                }
            });
        }
        return count;
    },

    /**
     * Collect attributes from DOM subtree that
     * somewhat resemble EDBML poke statements.
     * @returns {Array<Array<Node>>}
     */
    _getatts: function(element) {
        var atts = [];
        new gui.Crawler('functionupdate').descend(element, {
            handleElement: function(elm) {
                if (elm !== element) {
                    Array.forEach(elm.attributes, function(att) {
                        if (att.value.contains("edbml.$run")) {
                            atts.push([elm, att]);
                        }
                    });
                    if (elm.spirit && elm.spirit.script.loaded) { // ... not our DOM tree
                        return gui.Crawler.SKIP_CHILDREN;
                    }
                }
            }
        });
        return atts;
    }

});



/**
 * The ScriptPlugin shall render the spirits HTML.
 * @extends {gui.Plugin}
 * @using {gui.Combo.chained}
 * @using {gui.Arguments.confirmed}
 */
edbml.ScriptPlugin = (function using(chained, confirmed) {

    return gui.Plugin.extend({

        /**
         * Script has been loaded?
         * @type {boolean}
         */
        loaded: false,

        /**
         * Script has been run? Flipped after first run.
         * TODO: deprecate and use 'spirit.life.rendered'
         * @type {boolean}
         */
        ran: false,

        /**
         * Log development stuff to console?
         * @type {boolean}
         */
        debug: false,

        /**
         * Construction time.
         */
        onconstruct: function() {
            this._super.onconstruct();
            this._oldfokkers = {};
            this._newfokkers = {};
        },

        /**
         * Destruction time.
         */
        ondestruct: function() {
            this._super.ondestruct();
            if (this.loaded) {
                gui.Tick.cancelFrame(this._frameindex);
                this.spirit.life.remove(gui.LIFE_ENTER, this);
                gui.Broadcast.remove(edb.BROADCAST_ACCESS, this);
                if (this._input) { // TODO: interface for this (dispose)
                    this._input.ondestruct();
                    this._input.$ondestruct();
                }
            }
        },

        /**
         * Load EDBML script.
         * @param {function|String} script
         * @returns {edb.ScriptPlugin}
         */
        load: chained(confirmed("function|string")(function(script) {
            script = gui.Type.isFunction(script) ? script : gui.Object.lookup(script);
            if (script) {
                this.loaded = true;
                this._script = script;
                this._updater = new edbml.UpdateManager(this.spirit);
                this._process(script.$instructions);
                this._runtimeconfigure(script);
                if (!this._input) {
                    this.run();
                }
            }
        })),

        /**
         * Handle input.
         * @param {edb.Input} input
         */
        oninput: function(input) {
            if (this.loaded) {
                if (input.revoked) {
                    this.write("");
                } else {
                    if (!this._input || this._input.done) {
                        this._schedule();
                    }
                }
            } else {
                this._notloaded();
            }
        },

        /**
         * Run script and write result to DOM (if needed).
         */
        run: function( /* arguments */ ) {
            gui.Tick.cancelFrame(this._frameindex);
            if (this.loaded) {
                if (!this._input || this._input.done) {
                    if (this.spirit.life.entered) {
                        this.write(this._run.apply(this, arguments));
                    } else {
                        this.spirit.life.add(gui.LIFE_ENTER, this);
                        this._arguments = arguments;
                    }
                } else {
                    this._notready();
                }
            } else {
                this._notloaded();
            }
        },

        /**
         * Write the actual HTML to screen. You should probably only
         * call this method if you are producing your own markup
         * somehow, ie. not using EDBML templates out of the box.
         * @param {String} html
         */
        write: function(html) {
            var changed = this._html !== html;
            var focused = this._focusedfield();
            if (changed) {
                this._html = html;
                this._updater.update(html);
                if(focused) {
                    this._restorefocus(focused);
                }
            }
            this._status(this.spirit);
            this.ran = true; // TODO: deprecate and use 'spirit.life.rendered'
        },

        /**
         * Privately input types(s).
         * @param {edb.Type|Array<edb.Type>}
         * @returns {edb.Type|Array<edb.Type>}
         */
        input: function( /*arguments*/ ) {
            var types, input = this._input;
            if (this.loaded) {
                types = gui.Array.make(arguments).map(function(type) {
                    input.$oninput(
                        new edb.Input(type.constructor, type)
                    );
                    return type;
                });
            } else {
                this._notloaded();
            }
            return types.length > 1 ? types : types[0];
        },

        /**
         * Privately revoke type(s). Accepts instances or constructors. Not tested!
         */
        revoke: function( /*arguments*/ ) {
            gui.Array.make(arguments).forEach(function(type) {
                var Type = edb.Type.is(type) ? type.constructor : type;
                this._input.$oninput(
                    new edb.Input(Type, null)
                );
            }, this);
        },

        /**
         * Handle broadcast.
         * @param {gui.Broadcast} broadcast
         */
        onbroadcast: function(b) {
            var keys = this._newfokkers;
            switch (b.type) {
                case edb.BROADCAST_ACCESS:
                    var type = b.data[0];
                    var name = b.data[1];
                    var id = type.$instanceid;
                    if (!keys[id]) {
                        keys[id] = {
                            object: type
                        };
                        if (name) {
                            keys[id].properties = {};
                        }
                    }
                    if (name) {
                        keys[id].properties[name] = true;
                    }
                    break;
            }
        },

        /**
         * Handle change.
         * @param {Array<edb.Change>} changes
         */
        onchange: function(changes) {
            if (changes.some(function(c) {
                var id = c.object.$instanceid,
                    clas = c.object.$classname,
                    name = c.name;
                if(edbml.$rendering && edbml.$rendering[id]) {
                        console.error(
                        'Don\'t update "' + name + '" of the ' + clas +  ' while ' +
                        'rendering, it will cause the rendering to run in an endless loop. '
                    );
                } else {
                    var props = this._oldfokkers[id].properties;
                    try {
                        if (!name || props[name]) {
                            return true;
                        }
                    } catch (todoexception) {
                        //console.error(this._oldfokkers[id].toString(), name);
                        // TODO: fix sceario with selectedIndex................
                    }
                    return false;
                }
            }, this)) {
                this._schedule();
            }
        },

        /**
         * Handle life.
         * @param {gui.Life} life
         */
        onlife: function(l) {
            if (l.type === gui.LIFE_ENTER) {
                if (!this.spirit.life.rendered) { // spirit did a manual run?
                    this.run.apply(this, this._arguments || []);
                }
                this.spirit.life.remove(l.type, this);
                this._arguments = null;
            }
        },


        // Private .................................................................

        /**
         * Script SRC.
         * @type {String}
         */
        _src: null,

        /**
         * It's a function.
         * @type {function}
         */
        _script: null,

        /**
         * Update manager.
         * @type {edbml.UpdateManager}
         */
        _updater: null,

        /**
         * Tracking what arrays and objects (and what properties) to observe.
         * @type {Map<String,boolean>}
         */
        _oldfokkers: null,

        /**
         * Cache arguments for postponed execution.
         * @type {Arguments}
         */
        _arguments: null,

        /**
         * Snapshot latest HTML to avoid parsing duplicates.
         * @type {String}
         */
        _html: null,

        /**
         * AnimationFrame index.
         * @type {number}
         */
        _frameindex: -1,

        /**
         * Hijacking the {edb.InputPlugin} which has been
         * designed to work without an associated spirit.
         * @type {edb.InputPlugin}
         */
        _input: null,

        /**
         * Parse processing instructions. Add input listeners in
         * batch to prevent prematurly getting a `this._input.done`
         * @param {Array<object>} pis
         */
        _process: function(pis) {
            if (pis) {
                var optional = [];
                var required = [];
                if (pis.reduce(function(hasinput, pi) {
                    var keys = Object.keys(pi);
                    var name = keys[0];
                    var atts = pi[name];
                    if (name === "input") {
                        var list = atts.required === false ? optional : required;
                        list.push(gui.Object.lookup(atts.type));
                        return true;
                    }
                    return hasinput;
                }, false)) {
                    this._input = new edb.InputPlugin();
                    this._input.add(required, this, true);
                    this._input.add(optional, this, false);
                }
            }
        },

        /**
         * Setup to lookup inputs from the EDBML script. Note to self: We're
         * expanding the *inner* function that is visisble to runtime script.
         * @param {function} edbml (outer wrapped function)
         */
        _runtimeconfigure: function(edbml) {
            var input = this._input;
            var inner = edbml.$edbml;
            inner.$input = function(Type) {
                return input.get(Type);
            };
        },

        /**
         * Start it.
         */
        _start: function() {
            edbml.$rendering = this._oldfokkers || {};
            gui.Broadcast.add(edb.BROADCAST_ACCESS, this);
            edb.$accessaware = true;
            this._newfokkers = {};
        },

        /**
         * Stop it.
         */
        _stop: function() {
            var oldfokkers = this._oldfokkers,
                newfokkers = this._newfokkers;
                edbml.$rendering = null;
            gui.Broadcast.remove(edb.BROADCAST_ACCESS, this);
            edb.$accessaware = false;
            Object.keys(oldfokkers).forEach(function(id) {
                if (!newfokkers[id]) {
                    oldfokkers[id].object.removeObserver(this);
                    delete oldfokkers[id];
                }
            }, this);
            Object.keys(newfokkers).forEach(function(id) {
                var oldx = oldfokkers[id];
                var newx = newfokkers[id];
                if (oldx) {
                    if (newx.properties) {
                        oldx.properties = newx.properties;
                    }
                } else {
                    oldfokkers[id] = newfokkers[id];
                    oldfokkers[id].object.addObserver(this);
                    delete newfokkers[id];
                }
            }, this);
            this._newfokkers = null;
        },

        /**
         * Schedule rendering.
         */
        _schedule: function() {
            gui.Tick.cancelFrame(this._frameindex);
            var spirit = this.spirit;
            var input = this._input;
            var runnow = function() {
                if (!spirit.life.destructed && (!input || input.done)) {
                    this.run();
                }
            }.bind(this);
            if (spirit.life.entered) {
                if (spirit.life.rendered) {
                    this._frameindex = gui.Tick.nextFrame(runnow);
                } else {
                    runnow();
                }
            } else {
                spirit.life.add(gui.LIFE_ENTER, this);
            }
        },

        /**
         * @param {gui.Spirit} spirit
         */
        _status: function(spirit) {
            spirit.life.rendered = true;
            spirit.onrender({ // TODO: some kind of RenderSummary...
                first: !this.ran
            });
            spirit.life.dispatch(gui.LIFE_RENDER);
        },

        /**
         * Run the script while maintaining broadcast setup.
         * @returns {String}
         */
        _run: function( /* arguments */ ) {
            this._start();
            var html = this._script.apply(this.spirit, arguments);
            this._stop();
            return html;
        },

        /**
         * This seems to hotfix a scenario where the script has multiple
         * (global) inputs defined and you then inject a private input.
         * This action results in calling `run` immediately without
         * waiting for the global inputs to be registered. When fixed,
         * revert back to throwing an error (for manually running a
         * waiting script).
         */
        _notready: function() {
            var input = this._input,
                type;
            (input._watches || []).forEach(function(Type) {
                if ((type = edb.get(Type))) {
                    input.$oninput(
                        new edb.Input(Type, type)
                    );
                }
            }, this);
            /*
            if(gui.debug) {
                // Alert the user when manually running a script that is not ready.
                console.warn ( this.spirit + " can't run (waiting for input)" );
            }
            */
        },

        /**
         * Operation failed because no script was loaded.
         */
        _notloaded: function() {
            console.error("No script loaded for " + this.spirit);
        },

        /**
         * Focus is inside the spirit? Compute a fitting  CSS selector so that we 
         * may restore focus if and when the focused field gets replaced. This will 
         * in given case nuke the undo stack, but you can't both forget to scope 
         * your input fields (with an ID) and have a pleasent website, so please do.
         * TODO: warning in debug mode when an ID is missing.
         * @returns {string}
         */
        _focusedfield: function() {
            var focused = document.activeElement;
            if(gui.DOMPlugin.contains(this.spirit.element, focused)) {
                return this._focusselector(focused);	
            }
            return null;
        },

        /**
         * Compute selector for form field. We scope it to
         * nearest element ID or fallback to document body.
         * @param {Element} element
         * @returns {string}
         */
        _focusselector: function(elm) {
            var index = -1;
            var parts = [];
            function hasid(elm) {
                if (elm.id) {
                    try {
                        gui.DOMPlugin.q(elm.parentNode, elm.id);
                        return true;
                    } catch (malformedexception) {}
                }
                return false;
            }
            while (elm && elm.nodeType === Node.ELEMENT_NODE) {
                if (hasid(elm)) {
                    parts.push("#" + elm.id);
                    elm = null;
                } else {
                    if (elm.localName === "body") {
                        parts.push("body");
                        elm = null;
                    } else {
                        index = gui.DOMPlugin.ordinal(elm) + 1;
                        parts.push(">" + elm.localName + ":nth-child(" + index + ")");
                        elm = elm.parentNode;
                    }
                }
            }
            return parts.reverse().join("");
        },

        /**
         * Refocus that form field.
         * @param {string} selector
         */
        _restorefocus: function(selector) {
            var texts = 'textarea, input:not([type=checkbox]):not([type=radio])';
            var field = gui.DOMPlugin.qdoc(selector);
            if(field && field !== document.activeElement) {
                field.focus();
                if (gui.CSSPlugin.matches(field, texts)) {
                    field.setSelectionRange(
                        field.value.length,
                        field.value.length
                    );
                }
            }
        }

    });

}(gui.Combo.chained, gui.Arguments.confirmed));



/**
 * Spirit of the SCRIPT tag that 
 * contains the (compiled) EDBML.
 */
edbml.ScriptSpirit = gui.Spirit.extend({

    /**
     * Configured via inline HTML (so by Grunt).
     * @type {string}
     */
    scriptid: null,

    /**
     * Load script into parent spirit. This spirit will
     * automatically destruct when the script executes.
     */
    onconfigure: function() {
        this._super.onconfigure();
        if (this.dom.embedded()) {
            var id, parent = this.dom.parent(gui.Spirit);
            if (parent && (id = this.scriptid)) {
                parent.script.load(gui.Object.lookup(id));
            }
        }
    }

});



/*
 * Register module.
 */
gui.module("edbml@wunderbyte.com", {

    /*
     * Mixin properties and method.
     */
    mixin: {

        /**
         * TODO: support accessor and implement as property
         * @param {String|function} script
         */
        src: function(script) {
            if (gui.Type.isString(script)) {
                var func = gui.Object.lookup(script);
                if (func) {
                    script = func;
                } else {
                    throw new Error(this + ' could not locate "' + script + '"');
                }
            }
            if (gui.Type.isFunction(script)) {
                this.script.load(script);
            } else {
                throw new TypeError(this + " could not load script");
            }
        },

        /**
         * Called whenever the EDBML script was evaluated.
         * @param {TODOTHING} summary
         */
        onrender: function(summary) {},

        /**
         * Handle changes.
         * @param {Array<edb.ObjectChange|edb.ArrayChange>}
         */
        onchange: function(changes) {},

        /**
         * Handle input.
         * @param {edb.Input} input
         */
        oninput: function(input) {},

        /**
         * Handle directed input. Setup to require
         * the input listener be to be added first.
         * @see {edb.InputPlugin}
         * TODO: when to destruct the type?
         */
        $oninput: function(input) {
            this.script.input.match(input);
        }
    },

    /*
     * Register plugins for all spirits.
     */
    plugin: {
        script: edbml.ScriptPlugin
    },

    /*
     * Channeling spirits to CSS selectors.
     */
    channel: [
        [".gui-script", "edbml.ScriptSpirit"]
    ],

    /**
     * Setup environment.
     */
    oncontextinitialize: function() {
        
        /*
         * Automatically load spirit scripts by naming convention?
         * ns.MySpirit would automatically load ns.MySpirit.edbml
         */
        var edbmlscript, basespirit = gui.Spirit.prototype;
        gui.Function.decorateAfter(basespirit, 'onconfigure', function() {
            if (edbml.bootload && !this.script.loaded) {
                edbmlscript = gui.Object.lookup(this.$classname + '.edbml');
                if (gui.Type.isFunction(edbmlscript)) {
                    this.script.load(edbmlscript);
                }
            }
        });

        /*
         * Nasty hack to circumvent that we hardcode "event" into inline poke 
         * events, this creates an undesired global variable, but fixes an 
         * exception in the console, at least I think this was the problem.
         */
        if (!window.event) {
            try {
                window.event = null;
            } catch (ieexception) {}
        }
    }

});



/**
 * Synchronization studio.
 */
edb.Synchronizer = (function() {

    /**
     * Setup type for synchronization.
     * @param {edb.Type} type
     * @param {number} ways
     * @param {boolean} global
     */
    function sync(type, ways, global) {
        var id = type.$originalid || type.$instanceid;
        if (ways === 4 || ways === 1) {
            syncto(type, id, global);
        }
        if (ways === 4 || ways === 2) {
            syncas(type, id, global);
        }
        type.$synchronizity = ways;
        type.$synchglobally = global || false;
    }

    /**
     * @param {edb.Type} type
     * @param {string} id
     * @param {boolean} global
     */
    function syncto(type, id, global) {
        var broadcast = edb.SyncTransmitter.BROADCAST + id;
        var addscoped = global ? "addGlobal" : "add";
        gui.Broadcast[addscoped](broadcast,
            new edb.SyncReceiver(type)
        );
    }

    /**
     * @param {edb.Type} type
     * @param {string} id
     * @param {boolean} global
     */
    function syncas(type, id, global) {
        type.addObserver(edb.SyncTransmitter);
        if (global) {
            edb.Synchronizer.globals[id] = true;
        }
    }


    return { // Public ...........................................................

        $NONE: 0,
        $SYNC_AS: 1,
        $SYNC_TO: 2,
        $SYNC: 4,

        /**
         * Tracking globally synchronized $instanceids.
         * @type {Map<string,boolean>}
         */
        globals: Object.create(null),

        /**
         * @param {edb.Type} type
         * @param {number} ways
         * @param {boolean} global
         */
        sync: gui.Arguments.confirmed("object", "number", "(boolean)")(
            function(type, ways, global) {
                new edb.Crawler().crawl(type, {
                    ontype: function(t) {
                        if (!t.$synchronizity) {
                            sync(t, ways, global);
                        }
                    }
                });
                return type;
            }
        )
    };

}());



/**
 *
 * @param {edb.ObjectChange} change
 * @param {String} instanceid
 */
edb.ObjectSync = function(change, instanceid) {
    change = gui.Object.copy(change);
    change = edb.ObjectSync.experimental(change);
    change = edb.ObjectSync.filter(change);
    gui.Object.extend(this, change);
    this.$instanceid = instanceid;
};

edb.ObjectSync.prototype = {
    name: null,
    type: null,
    newValue: null,
    $instanceid: null
};

edb.ObjectSync.experimental = function(change) {
    var old = change.oldValue;
    var neu = change.newValue;
    if (edb.Type.is(old)) {
        change.$synchronizity = old.$synchronizity;
        change.$synchglobally = old.$synchglobally;
        change.newValue = JSON.parse(
            neu.serializeToString()
        );
    }
    return change;
};

/**
 * Reduce the payload by removing `object` and `oldValue`.
 * @param {edb.ObjectChange} change
 * @returns {object}
 */
edb.ObjectSync.filter = function(change) {
    return gui.Object.map(change, function(key, value) {
        if (!key.match(/oldValue|object/)) {
            return value;
        }
    });
};



/**
 *
 * @param {edb.ArrayChange} change
 * @param {String} instanceid
 */
edb.ArraySync = function(change, instanceid) {
    var array = change.object;
    this.$synchronizity = array.$synchronizity;
    this.$synchglobally = array.$synchglobally;
    this.type = edb.ArrayChange.TYPE_SPLICE;
    change.added = change.added.map(function(thing) {
        return edb.Type.is(thing) ?
            JSON.parse(thing.serializeToString()) : thing;
    });
    this.args = edb.ArrayChange.toSpliceParams(change);
    this.$instanceid = instanceid;
};

edb.ArraySync.prototype = {
    type: null,
    args: null,
    $instanceid: null
};



/**
 * Synchronization studio.
 * @using {gui.Arguments.confirmed}
 */
edb.SyncTransmitter = (function using(confirmed) {

    /**
     * Relay all changes from monitored source to
     * synchronized targets via broadcast message.
     * @param {Array<edb.Change>} changes
     */
    function onchange(changes) {
        var dispatch = {};
        var syncdone = [];
        changes.forEach(function(c) {
            maybechange(c, c.object, dispatch, syncdone);
        });
        gui.Object.each(dispatch, function(id, syncs) {
            var method = edb.Synchronizer.globals[id] ? "dispatchGlobal" : "dispatch";
            gui.Broadcast[method](edb.SyncTransmitter.BROADCAST + id, syncs);
        });
        syncdone.forEach(function(type) {
            delete type.$willsync;
        });
    }

    /**
     * @param {gui.Change} change
     * @param {edb.Type} type
     * @param {Map} dispatch
     * @param {Array} syncdone
     */
    function maybechange(change, type, dispatch, syncdone) {
        var sourceid = type.$instanceid;
        var targetid = type.$originalid || sourceid;
        if (type.$willsync) {
            syncdone.push(type);
        } else {
            setupsync(change);
            var changes = dispatch[targetid] = (dispatch[targetid] || []);
            changes.push(getchange(change, sourceid));
        }
    }

    /**
     * @param {edb.Change} change
     * @param {String} sourceid
     * @returns {edb.ObjectSync|edb.ArraySync}
     */
    function getchange(change, sourceid) {
        switch (change.type) {
            case edb.ObjectChange.TYPE_UPDATE:
                return new edb.ObjectSync(change, sourceid);
            case edb.ArrayChange.TYPE_SPLICE:
                return new edb.ArraySync(change, sourceid);
        }
    }

    /**
     * Setup sync for newly introduced types.
     * @param {edb.Change} change
     */
    function setupsync(change) {
        function maybesync(thing) {
            if (edb.Type.is(thing)) {
                edb.Synchronizer.sync(thing,
                    change.object.$synchronizity,
                    change.object.$synchglobally
                );
            }
        }
        switch (change.type) {
            case edb.ObjectChange.TYPE_UPDATE:
                maybesync(change.newValue);
                break;
            case edb.ArrayChange.TYPE_SPLICE:
                change.added.forEach(maybesync);
                break;
        }
    }


    return { // Public .............................................

        /**
         * Synchronization broadcast to be suffixed with `$instanceid`
         * (more unique broadcasts implies less overhead in handlers).
         * @type {String}
         */
        BROADCAST: "edb-synchronize-",

        /**
         * Handle changes.
         * @implements {IChangeHandler}
         */
        onchange: function(changes) {
            onchange(changes);
        }
    };

}(gui.Arguments.confirmed));



/**
 * TODO: nuke this thing on type dispose
 * @param {edb.Type} type
 */
edb.SyncReceiver = function(type) {
    this.type = type;
};

edb.SyncReceiver.prototype = {

    /**
     * Each type associated to an instance of {edb.SyncReceiver}
     * @type {edb.Type}
     */
    type: null,

    /**
     * Handle broadcast.
     * @param {gui.Broadcast} b
     */
    onbroadcast: function(b) {
        var type = this.type;
        var changes = b.data;
        if (changes.some(function(c) {
            return c.$instanceid !== type.$instanceid;
        })) {
            changes.forEach(function(c) {
                this._change(type, c);
            }, this);
        }
    },

    /**
     * Change type somehow.
     * @param {edb.Object|edb.Array} type
     * @param {edb.ObjectSync|edb.ArraySync} c
     */
    _change: function(type, c) {
        switch (c.type) {
            case edb.ObjectChange.TYPE_UPDATE:
                this._objectchange(type, c);
                break;
            case edb.ArrayChange.TYPE_SPLICE:
                this._arraychange(type, c);
                break;
        }
    },

    /**
     * Change object properties.
     * @param {edb.Object|edb.Array} type
     * @param {edb.ObjectSync} c
     */
    _objectchange: function(type, c) {
        var name = c.name,
            value = c.newValue;
        if (type[name] !== value) {
            if (value && (value.$object || value.$array)) { // TODO is-abstract-edb-tree somehow...
                value = JSON.stringify(value);
                value = new edb.Parser().parseFromString(value);
                edb.Synchronizer.sync(value, c.$synchronizity, c.$synchglobally);
            }
            type.$willsync = true;
            type[name] = value;
        }
    },

    /**
     * Change array structure.
     * @param {edb.Array} type
     * @param {edb.ArraySync} c
     */
    _arraychange: function(type, c) {
        type.$willsync = true;
        var x = c.args.slice(2).map(function(thing) {
            if (thing.$object || thing.$array) {
                thing = JSON.stringify(thing);
                thing = new edb.Parser().parseFromString(thing);
                edb.Synchronizer.sync(thing, c.$synchronizity, c.$synchglobally);
            }
            return thing;
        });
        x.unshift(c.args[1]);
        x.unshift(c.args[0]);
        type.splice.apply(type, x);
    }
};



/**
 * Sync module.
 */
gui.module("sync@wunderbyte.com", {

    oncontextinitialize: function() {

        /**
         * Create synchronized instance of Type from source.
         * @param {edb.Type} type
         * @param {edb.Type|String} source
         * @param {number} ways
         * @param @optional {boolean} global
         * @returns {edb.Type}
         */
        function sync(Type, source, ways, global) {
            return edb.Synchronizer.sync(Type.from(source), ways, global);
        }

        /**
         * Hello.
         */
        edb.Type.mixin({ // Instance properties ....................................

            /**
             *
             */
            $synchronizity: edb.SyncTransmitter.$NONE,

            /**
             *
             */
            $synchglobally: false,


        }, { // Recurring static ...................................................

            /**
             * Create out-synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            syncAs: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC_AS);
            },

            /**
             * Create in-synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            syncTo: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC_TO);
            },

            /**
             * Create synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            sync: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC);
            },

            /**
             * Create global out-synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            syncGlobalAs: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC_AS, true);
            },

            /**
             * Create global in-synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            syncGlobalTo: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC_TO, true);
            },

            /**
             * Create global synchronized instance from source.
             * @param {edb.Type|String} source
             * @returns {edb.Type}
             */
            syncGlobal: function(source) {
                return sync(this, source, edb.Synchronizer.$SYNC, true);
            }

        });
    }
});



/**
 * An abstract storage stub. We've rigged this up to
 * store {edb.Object} and {edb.Array} instances only.
 */
edb.Storage = gui.Class.create(Object.prototype, {

}, { // Static .................................................................

    /**
     * Let's make this async and on-demand.
     * @throws {Error}
     */
    length: {
        getter: function() {
            throw new Error("Not supported.");
        }
    },

    /**
     * Get type.
     * @param {String} key
     * @returns {gui.Then}
     */
    getItem: function(key) {
        var then = new gui.Then();
        var type = this[key];
        if (false && type) { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            then.now(type || null);
        } else {
            this.$getItem(key, function(type) {
                gui.Tick.next(function() { // @TODO bug in gui.Then! (still?)
                    then.now(type || null);
                });
            });
        }
        return then;
    },

    /**
     * Set type.
     * @param {String} key
     * @param {object} type
     * @returns {object}
     */
    setItem: function(key, type) {
        var then = new gui.Then();
        if (edb.Storage.$typecheck(type)) {
            this.$setItem(key, type, function() {
                then.now(type);
            });
        }
        return then;
    },

    /**
     * Remove type.
     * @param {String} key
     */
    removeItem: function(key) {
        var then = new gui.Then();
        delete this[key];
        this.$removeItem(key, function() {
            then.now();
        });
        return then;
    },

    /**
     * Clear the store.
     */
    clear: function() {
        var then = new gui.Then();
        this.$clear(function() {
            then.now();
        });
        return then;
    },


    // Privileged ................................................................

    /**
     * Get type.
     * @param {String} key
     * @param {function} callback
     */
    $getItem: function(key, callback) {},

    /**
     * Set type.
     * @param {String} key
     * @param {function} callback
     */
    $setItem: function(key, type, callback) {},

    /**
     * Remove type.
     * @param {String} key
     * @param {function} callback
     */
    $removeItem: function(key, callback) {},

    /**
     * Clear.
     * @param {function} callback
     */
    $clear: function(callback) {}


}, { // Static .................................................................

    /**
     * Clear all subclasses (localstorage, sessionstorage etc) without warning.
     * Note that this clears the designated keys only (see `storagekey` property).
     */
    clearAll: function() {
        gui.Class.descendants(edb.Storage, function(storage) {
            storage.clear();
        });
    },

    /**
     * @param {object} type
     * @returns {boolean}
     */
    $typecheck: function(type) {
        if (edb.Type.is(type)) {
            if (type.constructor.$classname !== gui.Class.ANONYMOUS) {
                return true;
            } else {
                throw new Error("Cannot persist ANONYMOUS Type");
            }
        } else {
            throw new TypeError("Persist only models and collections");
        }
    }

});



/**
 * DOM storage.
 */
edb.DOMStorage = edb.Storage.extend({

}, { // Static .................................................................

    /**
     * We're storing the whole thing under one single hardcoded key (see subclass)
     * @type {String}
     */
    storagekey: null,


    // Private ...................................................................

    /**
     * Mapping Type constructors to (normalized) instance JSON.
     * @type {Map<String,String>}
     */
    _storagemap: null,

    /**
     * Returns is either sessionStorage or localStorage.
     * @returns {Storage}
     */
    _domstorage: function() {},

    /**
     * Timeout key for async write to storage.
     * @type {number}
     */
    _timeout: -1,


    // Privileged ................................................................

    /**
     * Get item.
     * @param {String} key
     * @param {function} callback
     */
    $getItem: function(key, callback) {
        var json = null;
        var type = null;
        var Type = null;
        var map = this.$read();
        if ((json = map[key])) {
            json = JSON.parse(json);
            Type = gui.Object.lookup(key);
            type = Type ? new Type(json) : null;
        }
        callback.call(this, type);
    },

    /**
     * Set item.
     * @param {String} key
     * @param {edb.Model|edb.Collection} item
     * @param {function} callback
     * @param @optional {boolean} now (temp mechanism)
     */
    $setItem: function(key, item, callback, now) {
        var map = this.$read();
        map[key] = JSON.stringify(item); // TODO: edb.Serializer goes here!
        this.$write(gui.unloading);
        callback.call(this);
    },

    /**
     * Remove item.
     * @param {String} key
     * @param {function} callback
     */
    $removeItem: function(key, callback) {
        var map = this.$read();
        delete map[key];
        this.$write(gui.unloading);
        callback.call(this);
    },

    /**
     * Clear the store.
     * @param {function} callback
     */
    $clear: function(callback) {
        if (!gui.Client.isChromeApp && this._domstorage()) {
            this._domstorage().removeItem(this.storagekey);
            this._storagemap = null;
            if (callback) {
                callback.call(this);
            }
        }
    },

    /**
     * Read from storage sync and blocking. We read all stored types
     * only once to minimize further blocking read operations. This
     * may and may not be a good idea.
     * @returns {Map<String,String>}
     */
    $read: function() {
        if (!this._storagemap) {
            var map = this._domstorage().getItem(this.storagekey);
            this._storagemap = map ? JSON.parse(map) : {};
        }
        return this._storagemap;
    },

    /**
     * We write continually in case the browser crashes,
     * but async unless the context is shutting down.
     * @param {boolean} now True when shutting down
     */
    $write: function(now) {
        clearTimeout(this._timeout);
        var map = this._storagemap;
        var key = this.storagekey;
        var dom = this._domstorage();

        function write() {
            dom.setItem(key, JSON.stringify(map));
        }
        if (map) {
            if (now || true) {
                write();
            } else {
                this._timeout = setTimeout(function unfreeze() {
                    write();
                }, 50);
            }
        }
    }

});



/**
 * Device persistant storage.
 * @extends {edb.DOMStorage}
 */
edb.LocalStorage = edb.DOMStorage.extend({

}, { // Static .................................................................

    /**
     * Storage key.
     * @type {String}
     */
    storagekey: "Spiritual.Storage.LocalStorage",


    // Private ...................................................................

    /**
     * Storage target.
     * @returns {LocalStorage}
     */
    _domstorage: function() {
        return localStorage;
    }

});



/**
 * Session persistant storage.
 * @extends {edb.DOMStorage}
 */
edb.SessionStorage = edb.DOMStorage.extend({

}, { // Static .................................................................

    /**
     * Storage key.
     * @type {String}
     */
    storagekey: "Spiritual.Storage.SessionStorage",


    // Private ...................................................................

    /**
     * Storage target.
     * @returns {SessionStorage}
     */
    _domstorage: function() {
        return sessionStorage;
    }

});



/**
 * Chrome (local) storage.
 */
edb.ChromeStorage = edb.Storage.extend({

}, { // Static .................................................................

    /**
     * Storage key.
     * @type {string}
     */
    storagekey: "Spiritual.Storage.ChromeStorage",


    // Private ...................................................................

    /**
     * Mapping Type constructors to (normalized) instance JSON.
     * @type {Map<String,String>}
     */
    _storagemap: null,

    /**
     * Get item.
     * @param {String} key
     * @param {function} callback
     */
    $getItem: function(key, callback) {
        this.$read(function(map) {
            var json = null;
            var type = null;
            var Type = null;
            if ((json = map[key])) {
                Type = gui.Object.lookup(key);
                type = Type ? new Type(json) : null;
            }
            callback.call(this, type);
        }.bind(this));
    },

    /**
     * Set item.
     * @param {String} key
     * @param {edb.Model|edb.Collection} item
     * @param {function} callback
     */
    $setItem: function(key, item, callback) {
        this.$read(function(map) {
            map[key] = item; // TODO: edb.Serializer goes here!
            this.$write(function() {
                callback.call(this);
            });
        }.bind(this));
    },

    /**
     * Remove item.
     * @param {String} key
     * @param {function} callback
     */
    $removeItem: function(key, callback) {
        this.$read(function(map) {
            delete map[key];
            this.$write(callback);
        }.bind(this));
    },

    /**
     * Clear the store.
     * @param {function} callback
     */
    $clear: function(callback) {
        this._storagemap = null;
        var storage = window.chrome.storage.local;
        storage.local.remove(this.storagekey, function() {
            if (callback) {
                callback.call(this);
            }
        }.bind(this));
    },

    /**
     * @param {function} callback
     */
    $read: function(callback) {
        var storage = window.chrome.storage.local;
        if (!this._storagemap) {
            storage.get(this.storagekey, function(map) {
                this._storagemap = map || {};
                callback(this._storagemap);
            }.bind(this));
        } else {
            callback(this._storagemap);
        }
    },

    /**
     * @param {function} callback
     */
    $write: function(callback) {
        var storage = window.chrome.storage.local;
        storage.set(this.storagekey, this._storagemap, callback);
    }

});



/**
 * Device persistant storage.
 */
edb.DeviceStorage = edb.Storage.extend({

    }, // Static ...................................................................

    /**
     * Use Chrome storage or localStorage (for now).
     * @param {edb.Storage} storage
     */
    (function generatecode(storage) {
        var xstatic = {};
        ['getItem', 'setItem', 'removeItem', 'clear'].forEach(function(method) {
            xstatic[method] = function() {
                return storage[method].apply(storage, arguments);
            };
        });
        return xstatic;
    }(gui.Client.isChromeApp ? edb.ChromeStorage : edb.LocalStorage))

);



/**
 * States are a conceptual rebranding of edb.Objects
 * to serve primarily as spirit viewstate.
 */
edb.State = edb.Object.extend({

}, { // Static .................................................................

    /**
     * Non-persistant state. This is not particularly useful.
     * @see {edb.SessionState}
     * @see {edb.LocalState}
     * @type {String}
     */
    storage: null

});



/**
 * Session persistant state.
 * @extends {edb.SessionState}
 */
edb.SessionState = edb.State.extend({

}, { // Static .................................................................

    /**
     * @type {edb.Storage}
     */
    storage: edb.SessionStorage

});



/**
 * Device persistant state.
 * @extends {edb.LocalState}
 */
edb.LocalState = edb.State.extend({

}, { // Static .................................................................

    /**
     * @type {edb.Storage}
     */
    storage: edb.LocalStorage

});



/**
 * Chrome apps local state.
 * @extends {edb.SessionState}
 */
edb.ChromeState = edb.State.extend({

}, { // Static .................................................................

    /**
     * @type {edb.Storage}
     */
    storage: edb.ChromeStorage

});



/**
 * Chrome apps local state.
 * @extends {edb.SessionState}
 */
edb.DeviceState = edb.State.extend({

}, { // Static .................................................................

    /**
     * @type {edb.Storage}
     */
    storage: edb.DeviceStorage

});



/**
 * Restore or create states on startup, then output states in public
 * scope. The spirit may get the state using `this.state.localState'.
 * TODO: Hook some kind of `oninit` into states-started dependency
 * TODO: Support localForage
 */
edb.StatePlugin = gui.Plugin.extend({

    /**
     * State instance, if any. Note that this is not persisted.
     * @type {edb.State}
     */
    state: null,

    /**
     * SessionState instance, if any.
     * @type {edb.SessionState}
     */
    sessionState: null,

    /**
     * LocalState instance, if any.
     * @type {edb.LocalState}
     */
    localState: null,

    /**
     * ChromeState instance, if any.
     * @type {edb.ChromeState}
     */
    chromeState: null,

    /**
     * DeviceState instance, if any.
     * @type {edb.DeviceState}
     */
    deviceState: null,

    /**
     * TODO: Hookup gui.Spirit#oninit to this mechanism...
     */
    onconstruct: function() {
        this._super.onconstruct();
        this._startstates();
    },


    // Private ...................................................................

    /**
     * Has states declared?
     * @type {boolean}
     */
    _states: false,

    /**
     * Fire up potential state models. Returns
     * `true` if any state models are declared.
     * @returns {boolean}
     */
    _startstates: function() {
        var State, Spirit = this.spirit.constructor;
        return Object.keys(edb.StatePlugin.$states).some(function(state) {
            if ((State = Spirit[state])) {
                this[state] = State;
                this._startstate(State);
                return true;
            }
            return false;
        }, this);
    },

    /**
     * Output state model only when the *first* instance of this spirit is
     * constructed. If the state was not already stored, it will be created.
     * @param {constructor} State
     */
    _startstate: function(State) {
        if (!State.out()) {
            State.restore().then(function(state) {
                state = state || new State();
                state.output();
            }, this);
        }
    }


}, { // Static .................................................................

    /**
     * Run on spirit construct.
     * @type {boolean}
     */
    lazy: false,

    /**
     * Mapping constructor identifiers to private property names.
     * @type {Map<String,String>}
     */
    $states: {
        "State": "state",
        "SessionState": "sessionState",
        "LocalState": "localState",
        "ChromeState": "chromeState",
        "DeviceState": "deviceState"
    },

    /**
     * Resolve shorthand notation for State constructors.
     * @param {object} xstatic Recurring static fields
     * @returns {object}
     */
    $longhand: function(xstatic) {
        var State;
        Object.keys(this.$states).forEach(function(typename) {
            if ((State = xstatic[typename])) {
                if (gui.Type.isObject(State) && !State.$classid) {
                    xstatic[typename] = edb[typename].extend(State);
                }
            }
        });
        return xstatic;
    }

});



/**
 * TODO: in debug mode, warn user in case state object was declared
 * on the spirit prototype instead of xstatic members (2nd) section.
 */
gui.module('states@wunderbyte.com', {

    /**
     * Register {edb.StatePlugin} for all spirits.
     */
    plugin: {
        'state': edb.StatePlugin
    },

    /**
     * Apply mixins for GUI spirits and EDB types:
     *
     * - Resolve state shorthands when spirits are declared
     * - Add method `persist` to type instances
     * - Add method `restore` to type constructors.
     */
    oncontextinitialize: function() {
        this._guimixins();
        this._edbmixins();
    },

    /**
     * Fix spirits.
     */
    _guimixins: function() {

        /*
         * We'll override the `extend` method to resolve state constructor
         * shorthands as soon as the spirit class gets declared.
         */
        var oldextend = gui.Spirit.extend;

        /*
         * Resolve shorthand notation for State constructors.
         * @param {object} recurring Recurring static fields.
         * @returns {object}
         */
        function longhand(recurring) {
            var State;
            Object.keys(edb.StatePlugin.$states).forEach(function(typename) {
                if ((State = recurring[typename])) {
                    if (gui.Type.isObject(State) && !State.$classid) {
                        recurring[typename] = edb[typename].extend(State);
                    }
                }
            });
            return recurring;
        }

        gui.Spirit.mixin(null, { // Xstatic .......................................

            /**
             * Optional State constructor. The class will be declared
             * using the spirit classname as a namespacing mechanism
             * of some kind: `myns.MyController.State`.
             * @extends {ts.edb.State}
             */
            State: null,

            /**
             * Optional SessionState constructor.
             * @type {ts.edb.SessionState}
             */
            SessionState: null,

            /**
             * Optional LocalState constructor.
             * @type {ts.edb.LocalState}
             */
            LocalState: null,

            /**
             * Optional ChromeState constructor.
             * @type {ts.edb.ChromeState}
             */
            ChromeState: null,

            /**
             * Optional DeviceState constructor.
             * @type {ts.edb.DeviceState}
             */
            DeviceState: null,

            /**
             * Allow State constructors to be created by nice shorhand notation.
             * Simply declare an object instead of `ts.edb.State.extend(object)`
             * @overrides {gui.Spirit.extend}
             * TODO: If possible, this using gui.Function.decorateAfter
             * TODO: no spirits in worker context
             */
            extend: function() {
                var args = [],
                    def, breakdown = gui.Class.breakdown(arguments);
                ["name", "protos", "recurring", "statics"].forEach(function(key) {
                    if ((def = breakdown[key])) {
                        args.push(key === "recurring" ? longhand(def) : def);
                    }
                }, this);
                return oldextend.apply(this, args);
            }
        });
    },

    /**
     * Fix EDB.
     */
    _edbmixins: function() {

        edb.Type.mixin({

            /**
             * TODO: is `now` even relevant?
             */
            persist: function(now) {
                this.constructor.$persist(this, now);
            }

        }, { // Xstatic .........................................

            /**
             * Persist Type instance.
             * @param {edb.Object|edb.Array} type
             */
            $persist: function(type, now) {
                this.storage.setItem(type.$classname, type, now);
            },

            /**
             * Restore instance from storage.
             * @returns {gui.Then}
             */
            restore: function() {
                return this.storage.getItem(this.$classname, self);
            }

        });
    }

});



}(self));