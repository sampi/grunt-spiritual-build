var gui = {};
gui.Fisse = (function() {

	gui.Pik = gui.Fokker.extend();

	/*
	gui.Fok = gui.Fokker.extend({
		hans: 'jens'
	});
	*/
	
	return gui.Spasser.extend({

		spastiker: function() {
			this._super.spastiker(23, 5);
		},

		fisting: function() {
			var x = gui.Object.extend({ged:true}, {hest:false});
			return this._super.fisting(23).map(function(x) {
				return 'fisse' + x;
			});
		},

		_breakdown: function(arg) {
			return this._super._breakdown(arg).map(function(type) {
				return type === 'transitionend' ? this._transitionend() : type;
			}, this);
		}

	});

});
