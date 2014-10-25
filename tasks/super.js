/**
 *
 */
exports.pseudokeyword = function(js, keyword) {
	return run(js, '', (keyword || 'this._super') + '.', js.length - 1);
};

/**
 *
 */
function run(input, out, keyword, stop) {

	var METHODNAME = /\w|\$/;
	var CLASSNAME = /\w|\$|\./;

	var character = '',
		prototype = null,
		charindex = 0,
		curlycount = 0,
		supercall = false,
		methodname = false,
		superargs = false,
		buffer = '';

	/**
	 *
	 */
	function checkextension() {
		var extend = '.extend';
		if(findbehind(extend)) {
			prototype = getprototypeof(extend);
			console.log(prototype);
			curlycount = -1;
		}
	}

	/**
	 * TODO: zero-index singularity?
	 */
	function getprototypeof(extend) {
		var prev = buffer.substr(0, startindex(extend));
		var indx = prev.length;
		while(--indx && prev[indx].match(CLASSNAME)) {}
		return prev.substring(indx + 1) + '.prototype.';
	}

	/**
	 * TODO:
	 */
	function checksupercall() {
		if (findbehind(keyword)) {
			supercall = true;
			methodname = true;
			buffer = buffer.substr(0, startindex(keyword));
			buffer += prototype;
		}
	}

	/**
	 *
	 */
	function findbehind(string) {
		var nowlength, hindsight;
		if (bufferlength() >= string.length) {
			nowlength = startindex(string);
			hindsight = buffer.substr(nowlength, string.length);
			if (hindsight === string) {
				return true;
			}
		}
		return false;
	}

	/**
	 *
	 */
	function bufferlength() {
		return buffer.length;
	}

	/**
	 *
	 */
	function startindex(string) {
		return bufferlength() - string.length;
	}

	/**
	 *
	 */
	function processsupercall() {
		if (methodname) {
			if (!character.match(METHODNAME)) {
				buffer += '.call';
				methodname = false;
			}
		} else if (superargs) {
			if (character.match(METHODNAME)) {
				buffer += ', ';
				superargs = false;
			}
		}
		switch (character) {
			case '(':
				character = '(this';
				superargs = true;
				break;
			case ')':
				supercall = false;
				superargs = false;
				break;
		}
	}

	/**
	 *
	 */
	function flush() {
		out += buffer;
		out += character;
		buffer = '';
		supercall = false;
		methodname = false;
		superargs = false;
	}

	function somechars() {
		if(prototype) {
			switch (character) {
				case '{':
					curlycount --;
					break;
				case '}':
					curlycount --;
					if(curlycount === 0) {
						prototype = null;
					}
					break;
			}
		}
	}

	function morechars() {
		switch (character) {
			case ';':
				flush();
				break;
			case '=':
			case '\'':
			case '"':
				if(!supercall) {
					flush();
				}
				break;
			default:
				if (supercall) {
					processsupercall();
				}
				buffer += character;
				if (prototype && !supercall) {
					checksupercall();
				}
				if(!prototype) {
					checkextension();
				}
				break;
		}
	}

	// iterate all characters
	while (charindex <= stop) {
		character = input[charindex];
		somechars();
		morechars();
		charindex++;
	}

	// flush and return
	out += buffer;
	return out;
}
