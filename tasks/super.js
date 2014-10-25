/**
 * @param {string} js
 * @param {string} keyword
 */
exports.pseudokeyword = function(js, keyword) {
	return run(js, '', (keyword || 'this._super') + '.', js.length - 1);
};


// Private .....................................................................

/**
 * @param {string} input
 * @param {string} output
 * @param {string} keyword
 * @param {number} endindex
 */
function run(input, output, keyword, endindex) {

	var METHODNAME = /\w|\$/;
	var CLASSNAME = /\w|\$|\./;

	var 
		character = '',
		prototype = null,
		charindex = 0,
		curlcount = 0,
		stringmode = false,
		supercall = false,
		methodname = false,
		superargs = false,
		buffer = '',
		wordindex = -1,
		subwords = [
			'.extend', 
			'.mixin'
		];

	/**
	 * Check if we hit a `MyClass.extend` or `MyClass.mixin` pattern.
	 */
	function checkextensions() {
		subwords.every(checkextension);
	}

	/**
	 * @param {string} subword
	 */
	function checkextension(subword) {
		var checknext = true;
		if(findbehind(subword) && endshere(subword)) {
			wordindex = startindex(subword);
			prototype = getprototypeat(wordindex);
			curlcount = -1;
			checknext = false;
		}
		return checknext;
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
	 * TODO: zero-index singularity?
	 * @
	 */
	function getprototypeat(index) {
		var prev = buffer.substr(0, index);
		var indx = prev.length;
		while(--indx && prev[indx].match(CLASSNAME)) {}
		return prev.substring(indx + 1) + '.prototype.';
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

	function endshere(subword) {
		var nextindex = charindex + 1;
		return input.length === nextindex ||
			!input[nextindex].match(METHODNAME);
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
		output += buffer;
		output += character;
		buffer = '';
		supercall = false;
		methodname = false;
		superargs = false;
	}

	function somechars() {
		if(!stringmode) {
			switch (character) {
				case '{':
					curlcount --;
					break;
				case '}':
					curlcount --;
					if(curlcount === 0) {
						prototype = null;
					}
					break;
			}
		}
		if(!stringmode) {
			if(prototype) {
				switch (character) {
					case '{':
						curlcount --;
						break;
					case '}':
						curlcount --;
						if(curlcount === 0) {
							prototype = null;
						}
						break;
				}
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
					checkextensions();
				}
				break;
		}
	}

	// iterate all characters
	while (charindex <= endindex) {
		character = input[charindex];
		somechars();
		morechars();
		charindex++;
	}

	// flush and cover
	return output + buffer;
}
