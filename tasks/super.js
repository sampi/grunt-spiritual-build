/**
 * Replace all psudosuperkeywords with 
 * regular prototype `call` statements.
 * @param {string} js
 * @param {string} keyword
 */
exports.pseudokeyword = function(js, keywords) {
	keywords = keywords === true ? 'super' : keywords; 
	keywords = keywords.charAt ? [keywords] : keywords;
	keywords = keywords.map(function(keyword) {
		return keyword + '.';
	});
	return run(js, keywords, js.length - 1);
};


// Private .....................................................................

/**
 * Run the computer on all characters in input.
 * @param {string} input
 * @param {Array<string>} keywords
 * @param {number} endindex
 */
function run(input, keywords, endindex) {

	var METHODNAME = /\w|\$/;
	var CLASSNAME = /\w|\$|\./;

	var output = '',
		character = '',
		prototype = null,
		charindex = 0,
		curlcount = 0,
		prencount = 0,
		stringmode = false,
		commentmode = false,
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
	 * Did the code just itend to extend or mixin something? 
	 * If so, we switch to super keyword replacement modus.
	 * @param {string} subword
	 * @returns {boolean} True if no match (so check another match)
	 */
	function checkextension(subword) {
		var checknext = true;
		if(findbehind(subword) && endshere(subword)) {
			wordindex = startindex(subword);
			prototype = getprototypeat(wordindex);
			curlcount = 0;
			prencount = 0;
			checknext = false;
		}
		return checknext;
	}

	/**
	 * Did the code just intend a supercall?
	 */
	function checksupercall() {
		keywords.every(function(keyword) {
			if (findbehind(keyword)) {
				supercall = true;
				methodname = true;
				buffer = buffer.substr(0, startindex(keyword));
				buffer += prototype;
				return false;
			}
			return true;
		});
	}

	/**
	 * TODO: zero-index singularity?
	 * @param {number} index
	 * @returns {string} 
	 */
	function getprototypeat(index) {
		var prev = buffer.substr(0, index);
		var indx = prev.length;
		while(--indx && prev[indx].match(CLASSNAME)) {}
		return prev.substring(indx + 1) + '.prototype.';
	}

	/**
	 * @param {string} string
	 * @returns {booleans}
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
	 * Magic word is not a substring of a longer word?
	 * @param {string} subword
	 * @returns {booleans}
	 */
	function endshere(subword) {
		var nextindex = charindex + 1;
		return input.length === nextindex ||
			!input[nextindex].match(METHODNAME);
	}

	/**
	 * Sugar.
	 * @returns {number}
	 */
	function bufferlength() {
		return buffer.length;
	}

	/**
	 * Compute index of string in buffer.
	 * @param {string} string
	 * @return {number}
	 */
	function startindex(string) {
		return bufferlength() - string.length;
	}

	/**
	 * TODO: all sorts of edge cases
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
	 * Flush buffer to output.
	 */
	function flush() {
		output += buffer;
		output += character;
		buffer = '';
		supercall = false;
		methodname = false;
		superargs = false;
	}

	/**
	 * Process chars in one way.
	 * TODO: This ain't right :/
	 */
	function somechars() {
		var was = false;
		if(!stringmode && !commentmode) {
			if(prototype) {
				switch (character) {
					case '(':
						prencount ++;
						break;
					case ')':
						was = prencount > 0;
						prencount --;
						if(was && prencount === 0) {
							prototype = null;
						}
						break;
					case '{':
						curlcount ++;
						break;
					case '}':
						was = curlcount > 0;
						curlcount --;
						if(was && curlcount === 0) {
							prototype = null;
						}
						break;
				}
			}
		}
	}

	/**
	 * Process chars in another way.
	 */
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

	// flush all to output
	return output + buffer;
}
