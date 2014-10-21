(function(window) {

"use strict";


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



}(self));