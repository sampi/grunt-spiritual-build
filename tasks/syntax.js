var esprima = require('esprima');
// var hint = require("jshint").JSHINT; // //__dirname + "/jshint.json";

/**
 * Basic syntax valid?
 * @param {string} js
 */
exports.valid = function(grunt, js, filepath) {
	return isvalid(grunt, js, filepath);
};


// Private .....................................................................

/**
 * @param {Grunt} grunt
 * @param {Array<string>} files
 * @returns {boolean}
 *
function validate(grunt, longlist) {
	var filemap = mapcontents(grunt, longlist);
	return allvalid(grunt, filemap);
}

/**
 * @param {Grunt} grunt
 * @param {Array<string>} files
 * @returns {boolean}
 *
function allvalid(grunt, files) {
	return Object.keys(files).every(function(filepath) {
		var js = files[filepath];
		return isvalid(grunt, js, filepath);
	});
}

/**
 * @param {Grunt} grunt
 * @param {string} js
 * @param {string} filepath
 * @returns {boolean}
 */
function isvalid(grunt, filepath, js) {
	var config;
	var syntax;
	try {
		config = {tolerant: true};
		syntax = esprima.parse(js, config);
		if (syntax.errors.length) {
			syntax.errors.forEach(function(error) {
				grunt.log.error(filepath, error.message);
			});
			return false;
		}
		return true;
	} catch (exception) {
		grunt.log.write('\n');
		grunt.log.error(filepath, exception.message);
		grunt.fail.errorcount++;
		return false;
	}
}

/**
 * Map file path to file content.
 * @param {Grunt} grunt
 * @param {Array<string>} longlist
 *
function mapcontents(grunt, longlist) {
	var sources = longlist.map(function(filepath) {
		return grunt.file.read(filepath);
	});
	var map = {};
	sources.forEach(function(src, i) {
		map[longlist[i]] = src;
	});
	return map;
}
/


/* JSHINT STUFF.................................................................

if (hint(content, options, globals)) {
	return true;
} else {
	report(filepath, hint.errors[0]);
	return false;
}
function report(filepath, error) {
	console.log(
		filepath + ": \n" +
		"line " + error.line + ", " +
		"char " + error.character + ": " +
		error.reason
	);
}
*/
