var path = require("path");
var ugli = require("uglify-js");
var chalk = require('chalk');
var sixto5 = require('6to5');
var suber = require('./super');
var syntax = require('./syntax');

/**
 * Here it comes.
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {

	"use strict";

	var SPACER = "\n\n\n";
	var HEADER = '(function(window) {\n\n"use strict";';
	var FOOTER = '}(self));'; // worker compatible context
	
	/*
	 * Task to concat and minify files.
	 */
	grunt.registerMultiTask("guibundles", "Spiritual bundles", function() {
		var sources, content, options = this.options({
			superword: ['super'],
			transpile: ['.es'],
			min: true,
			max: true,
			map: false
		});
		this.files.forEach(function(pair) {
      sources = grunt.file.expand({nonull: true}, pair.orig.src);
      if(sources.every(exists)) {
      	content = process(sources, options);
      	if(options.max) {
	      	writefile(pair.dest, content, options);
	      } else if(options.map) {
	      	grunt.log.error('Sourcemap expects a maxified file');
	      }
	      if(options.min) {
					uglyfile(pair.dest, content, options);
				} else if(options.map) {
					grunt.log.error('Sourcemap expects a minfied file');
				}
      }
    });
	});

	/**
	 * Process sources with options.
	 * @param {Array<string>} sources
	 * @param {object} options
	 * @returns {string}
	 */
	function process(sources, options) {
		sources = explodeall(sources);
		if(!grunt.fail.errorcount) {
			var content = extract(sources, options);
			return enclose(content.join(SPACER));
		}
	}

	/**
	 * Extract content from files and 
	 * parse through various options.
	 * @param {Array<string>} sources
	 * @param {object} options
	 * @returns {Array<string>}
	 */
	function extract(sources, options) {
		return sources.map(function(src) {
			return [src, grunt.file.read(src)];
		}).filter(function(list) {
			return syntax.valid(grunt, list[0], list[1]);
		}).map(function(list) {
			return extras(list[0], list[1], options);
		});
	}

	/**
	 * Apply source code extras:
 	 * 
	 * 1. Replace pseudosuperkeyword with `proto.call(this)`
	 * 2. Transpile from ES6 to ES5 if file name matches
	 * @param {string} src
	 * @param {string} js
	 * @param {object} options
	 */
	function extras(src, js, options) {
		if(options.superword) {
			js = suber.pseudokeyword(js, options.superword);
		}
		if(options.transpile) {
			js = maybetranspile(src, js, options.transpile);
		}
		return js;
	}

	/**
	 * Transpile from ES6 to ES5 if filename matches something 
	 * specified. Default transpiling everything with '.es'.
	 * @param {string|Array<string>} js
	 * @returns {string}
	 */
	function maybetranspile(src, js, transpile) {
		transpile = transpile.charAt ? [transpile] : transpile;
		if(transpile.indexOf(path.extname(src)) >-1) {
			js = sixto5.transform(js).code;
			js = js.replace(/"use strict";\n/, '');
		}
		return js;
	}

	/**
	 * Wrap script in humongous closure.
	 * @param {String} filepath
	 * @returns {String}
	 */
	function enclose(source) {
		return HEADER + SPACER + source + SPACER + FOOTER;
	}

	/**
	 * File exists?
	 * @param {String} filepath
	 * @returns {boolean}
	 */
	function exists(filepath) {
		var does = grunt.file.exists(filepath);
		if (!does) {
			grunt.log.error('Human error: ' + chalk.cyan(filepath) + ' not found.');
			grunt.fail.errorcount++;
		}
		return does;
	}

	/**
	 * Write file and report to console.
	 * @param {String} filepath
	 * @param {String} filetext
	 */
	function writefile(filepath, filetext, options) {
		var version = '-1.0.0';
		var packag = filename('package.json', options);
		var banner = filename('BANNER.txt', options);
		if (grunt.file.exists(banner)) {
			filetext = grunt.file.read(banner) + '\n' + filetext;
		}
		if (grunt.file.exists(packag)) {
			var json = grunt.file.readJSON(packag);
			version = json.version;
		}
		grunt.file.write(filepath, grunt.template.process(filetext, {
			data: {
				version: version
			}
		}));
		grunt.log.writeln("File \"" + chalk.cyan(filepath) + "\" created.");
	}

	/**
	 * Write uglified file
	 * @param {string} prettyfile
	 * @param {object} options
	 */
	function uglyfile(prettyfile, sourcecode, options) {
		var mintarget = prettyfile.replace('.js', '.min.js');
		var maptarget = prettyfile.replace('.js', '.js.map');
		var uglycodes = uglify(options.max ? prettyfile : sourcecode);
		writefile(mintarget, uglycodes.code, options);
		if(options.map) {
			writefile(maptarget, uglycodes.map, options);
		}
	}

	/**
	 * Uglify file or sourcecode string.
	 * @param {string} prettyfile
	 * @param @optional {string} sourcecode
	 */
	function uglify(prettyfile, sourcecode) {
		console.warn('Not quite getting the right path to source in the map :/');
		return ugli.minify(sourcecode || prettyfile, {
			fromString: sourcecode !== undefined,
			outSourceMap: path.basename(prettyfile) + '.map',
			compress: {
				warnings: false
			}
		});
	}

	/**
	 * Get weirdo filename relative to base.
	 * @param {string} name
	 * @param {Map} options
	 * @returns {string}
	 */
	function filename(name, options) {
		return path.normalize(options.base + '/' + name);
	}

	/**
	 * Expand sources via JSON files.
	 * @param {Array<String>} sources
	 * @returns {Array<String>}
	 */
	function explodeall(sources) {
		sources = grunt.file.expand({nonull: true}, sources);
		return explode(sources.filter(exists).map(relpath));
	}

	/**
	 * Source to relative something.
	 * @param {String} filepath
	 * @returns {String}
	 */
	function relpath(filepath) {
		return path.relative(path.dirname("."), filepath);
	}

	/**
	 * If source is a JSON file, resolve the file
	 * as a new source list relative to that file.
	 * @param {Array<String>} sources
	 * @returns {Array<String>}
	 */
	function explode(sources) {
		var json, res = [];
		sources.forEach(function(source) {
			switch (path.extname(source)) {
				case ".json":
					json = grunt.file.readJSON(source);
					res.push.apply(res, json.map(function(filepath) {
						return path.dirname(source) + "/" + filepath;
					}));
					break;
				case ".js":
					res.push(source);
					break;
			}
		});
		return res;
	}
};
