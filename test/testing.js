(function(window) {

"use strict";


/**
 * Extend `gui` to support spirits.
 */
gui = gui.Object.extend(gui, {

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

	/*
	 * Broadcasts
	 */
	BROADCAST_KICKSTART: "gui-broadcast-kickstart",
	BROADCAST_WILL_SPIRITUALIZE: "gui-broadcast-will-spiritualize",
	BROADCAST_DID_SPIRITUALIZE: "gui-broadcast-did-spiritualize",

	/*
	 * Actions
	 */
	ACTION_DOC_ONSPIRITUALIZED: "gui-action-document-spiritualized",

	/*
	 * Framework-internal stuff (most should eventually dollarprefix!)
	 */
	$ACTION_XFRAME_VISIBILITY: "gui-action-xframe-visibility",

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
	$TICK_INSIDE: "gui-tick-spirits-inside",
	$TICK_OUTSIDE: "gui-tick-spirits-outside",

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

	/** 
	 * CSS classnames
	 */
	CLASS_NOSPIRITS: "gui-nospirits", // declare spirit-free zone (performance)
	CLASS_INVISIBLE: "_gui-invisible",
	CLASS_HIDDEN: "_gui-hidden",

	/**
	 * Flipped by the {gui.Guide} after initial spiritualization
	 * @type {boolean}
	 */
	spiritualized: false,

	/**
	 * Magic attributes to trigger spirit association and configuration.
	 * By default we support "gui" but you may prefer to use "data-gui".
	 */
	attributes: ["gui"], // @TODO: move from proto to constructor?

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
		return gui.DOMObserver.suspend(function() {
			return gui.Guide.suspend(operation);
		});
	},

	/**
	 * Channel spirits on startup.
	 * Called by the {gui.Guide}
	 * @see {gui.Guide}
	 */
	start: function() {
		this._oninit();
		this._gone = true;
		this._then = new gui.Then();
		if (this._todochannels) {
			this._channelAll(this._todochannels);
			this._todochannels = null;
		}
		if (!this._pingpong) {
			gui.Tick.add([gui.$TICK_INSIDE, gui.$TICK_OUTSIDE], this, this.$contextid);
			//this._spinatkrampe();
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
	 * @TODO
	 */
	getAll: function(arg) {
		console.error("TODO: gui.getAll");
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

	/**
	 *
	 */
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


	// Private ...................................................................

	/**
	 * Tracking spirits by $instanceid (detached
	 * spirits are subject to impending destruction).
	 * @type {Map<String,Map<String,gui.Spirit>>}
	 */
	_spirits: null,

  /**
	 * Lisitng CSS selectors associated to Spirit constructors.
	 * Order is important: First spirit to match selector is it.
	 * @type {Array<Array<String,function>>}
	 */
	_channels: null,

	/**
	 * Some kind of temp fix.
	 * @type {Array<object>}
	 */
	_todochannels: null,

	/**
	 * Invoked at parse time (so right now).
	 */
	_initspirits: function() {
		this._arrivals = Object.create(null);
		this._channels = [];
		this._spaces = ["gui"];
		this._spirits = {
			incoming: [], // spirits just entered the DOM (some milliseconds ago)
			inside: Object.create(null), // spirits positioned in page DOM ("entered" and "attached")
			outside: Object.create(null) // spirits removed from page DOM (currently "detached")
		};
		return this;
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

	/**
	 *
	 */
	_channelAll: function(channels) {
		if (this._gone) {
			channels.forEach(function(c) {
				this._channelOne(c[0], c[1]);
			}, this);
		} else {
			// TODO: the 'reverse()' should really not be done here, but in 
			// the condition above, however, that screws it up, huge disaster 
			// and something must be done about it !!!!!!!!!!!!!!!!!!!!!!!!!!
			this._todochannels = this._todochannels || [];
			this._todochannels = this._todochannels.concat(channels.reverse());
		}
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
				res = gui.Object.lookup(att, win);
				if(!res) {
					console.error(att + " is not defined.");
				}
			} else {
				res = false; // strange return value implies no spirit for empty string
			}
		}
		return res;
	},

}._initspirits());



/**
 * Support spirits.
 */
gui.Module.mixin ({

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
	 * Called before spirits kick in.
	 * @return {Window} context
	 */
	onbeforespiritualize: function() {},

	/**
	 * Called after spirits kicked in.
	 * @return {Window} context
	 */
	onafterspiritualize: function() {},

	
	// Privileged ................................................................

	/**
	 * Secret constructor.
	 *
	 * 1. extend {gui.Spirit} with mixins
	 * 2. inject plugins for (all) spirits
	 * 3. channel spirits to CSS selectors
	 * @overwrites {gui.Module.$onconstruct}
	 */
	$onconstruct: function() {
		['channels', 'mixins', 'plugins'].forEach(function(x) {
			if (this[x]) {
				console.error('Deprecated API is deprecated: ' + x);
			}
		}, this);
		if (gui.Type.isObject(this.mixin)) {
			gui.Spirit.mixin(this.mixin);
		}
		if (gui.Type.isObject(this.plugin)) {
			gui.Object.each(this.plugin, function(prefix, plugin) {
				if (gui.Type.isDefined(plugin)) {
					gui.Spirit.plugin(prefix, plugin);
				} else {
					console.error("Undefined plugin for prefix: " + prefix);
				}
			});
		}
		if (gui.Type.isArray(this.channel)) {
			gui.channel(this.channel);
		}
		if(gui.Type.isFunction(this.oncontextinitialize)) {
			this.oncontextinitialize(window); // TODO: just use onconstruct!
		}
		this._monitorspirits();
	},


	// Private ...................................................................

	/**
	 * Support `onbeforespiritualize` and `onafterspiritualize`.
	 */
	_monitorspirits: function() {
		var that = this;
		var msg1 = gui.BROADCAST_WILL_SPIRITUALIZE;
		var msg2 = gui.BROADCAST_DID_SPIRITUALIZE;
		gui.Broadcast.addGlobal([msg1, msg2], {
			onbroadcast: function(b) {
				if (b.data === gui.$contextid) {
					gui.Broadcast.removeGlobal(b.type, this);
					switch (b.type) {
						case msg1:
							if (gui.Type.isFunction(that.onbeforespiritualize)) {
								that.onbeforespiritualize(window); // TODO: kill arg
							}
							break;
						case msg2:
							if (gui.Type.isFunction(that.onafterspiritualize)) {
								that.onafterspiritualize(window); // TODO: kill arg
							}
							break;
					}
				}
			}
		});
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
		gui.Tracker.prototype.onconstruct.call(this);
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
 * @using {gui.DOMObserver}
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
				if (gui.hasModule("gui-layout@wunderbyte.com")) { // TODO: - fix
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
				if (gui.hasModule("gui-layout@wunderbyte.com")) {
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
	gui.DOMObserver
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
			return gui.Tracker.prototype._breakdown.call(this, arg).map(function(type) {
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
		gui.Plugin.prototype.onconstruct.call(this);
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
		gui.Spirit.prototype.onready.call(this);
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
		gui.Spirit.prototype.onaction.call(this, a);
		this.action.$handleownaction = false;
		switch (a.type) {
			case gui.$ACTION_XFRAME_VISIBILITY:
				this._waiting = false;
				if (gui.hasModule("gui-layout@wunderbyte.com")) { // TODO: - fix
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
		var dir = gui.Spirit.prototype.oncrawler.call(this, crawler);
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
		gui.Spirit.prototype.onvisible.call(this);
	},

	/**
	 * Relay visibility from ancestor frame (match iframe visibility).
	 */
	oninvisible: function() {
		this.css.add(gui.CLASS_INVISIBLE);
		gui.Spirit.prototype.oninvisible.call(this);
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
		gui.Spirit.prototype.onconstruct.call(this);
		this.event.add("message", this.window);
		this._postbox = [];
	},

	/**
	 * Stamp SRC on startup.
	 * Configure content document events in order of
	 * appearance and resolve current contentLocation.
	 */
	onenter: function() {
		gui.Spirit.prototype.onenter.call(this);
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
		gui.Spirit.prototype.onaction.call(this, a);
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
		gui.Spirit.prototype.onevent.call(this, e);
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
		gui.Spirit.prototype.onvisible.call(this);
		if (this.spiritualized) {
			this._visibility();
		}
	},

	/*
	 * Status invisible.
	 */
	oninvisible: function() {
		gui.Spirit.prototype.oninvisible.call(this);
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
		if (gui.hasModule("gui-layout@wunderbyte.com")) { // TODO: - fix
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
				// WebKit/Safari/Blink relies on the {gui.DOMObserver}
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
 * DOM decoration time.
 * TODO: Standard DOM exceptions (at our level) for missing arguments and so on.
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
		if (gui.DOMObserver.observes) {
			return gui.DOMObserver.suspend(function() {
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
		//console.log(position);
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
 * Monitor document for unsolicitated DOM changes and spiritualize
 * elements accordingly. This patches a missing feature in
 * WebKit/Safari/Blink that blocks us from overriding native
 * DOM getters and setters (eg. innerHTML). Importantly note that
 * spirits will be attached and detached *asynchronously* with this. 
 *
 * TODO: If this was forced synchronous via DOMPlugin methods, we
 * may be crawling the DOM twice - let's make sure we don't do that.
 * @see http://code.google.com/p/chromium/issues/detail?id=13175
 */
gui.DOMObserver = {

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
						gui.DOMObserver._handleMutation(mutation);
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
				//this._ondom();
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
		switch (b.type) {
			case gui.BROADCAST_KICKSTART:
				gui.Broadcast.removeGlobal(b.type, this);
				this._step1(window, document);
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
	 * TODO: gui.DOMObserver crashes with JQuery when both do stuff on DOMContentLoaded
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
	 * @param {Window} win
	 * @param {Document} doc
	 */
	_step1: function(win, doc) {
		gui.Broadcast.removeGlobal(gui.BROADCAST_KICKSTART, this);
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
		if (gui.mode !== gui.MODE_HUMAN) {
			gui.DOMChanger.change(win);
			if (gui.Client.isWebKit) {
				gui.DOMObserver.observe(win);
			}
			if (gui.debugmutations) {
				console.warn('Deprecated API is deprecated: gui.debugmutations');
			}
			gui.spiritualizeSub(root);
			gui.$onready();
		}
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
		if (gui.hasModule("gui-layout@wunderbyte.com")) {
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
 * Spirits module.
 */
gui.module('gui-spirits@wunderbyte.com', {

	/**
	 * Channel spirits for CSS selectors.
	 */
	channel: [
		['html', gui.DocumentSpirit],
		['.gui-iframe', gui.IframeSpirit],
		['.gui-spirit', gui.Spirit]
	],

	/**
	 * Assign plugins to prefixes.
	 */
	plugin: {
		'action': gui.ActionPlugin,
		'broadcast': gui.BroadcastPlugin,
		'tick': gui.TickPlugin,
		'att': gui.AttPlugin,
		'config': gui.ConfigPlugin,
		'box': gui.BoxPlugin,
		'css': gui.CSSPlugin,
		'dom': gui.DOMPlugin,
		'event': gui.EventPlugin,
		'life': gui.LifePlugin,
		'sprite': gui.SpritePlugin
	},

	/**
	 * Add methods to spirits.
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
			if (e.type === 'webkitTransitionEnd') {
				e = {
					type: 'transitionend',
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



}(self));