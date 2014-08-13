var path = require ( "path" );
var ugli = require ( "uglify-js" );
var hint = require ( "jshint" ).JSHINT;
var chalk = require('chalk');

/**
 * Here it comes.
 * @param {Grunt} grunt
 */
module.exports = function ( grunt ) {

	"use strict";

	var SPACER = "\n\n\n";
	var HEADER = '(function(window) {\n\n"use strict";';
	var FOOTER = '}(self));'; // worker compatible context

	/*
	 * Task to concat and minify files.
	 */
	grunt.registerMultiTask ( "spiritual", "Build Spiritual", function () {
		var options = this.options();
		options.base = grunt.template.process(options.base || ".");
		if(grunt.file.exists(filename('package.json', options))) {
			process ( this.data.files, options);
		} else {
			grunt.log.error('Not a project root: "' + options.base + '"');
		}
	});

	/** 
	 * Concat and minify files.
	 * @param {Map<String,String} files
	 * @param {Map<String,String} options
	 */
	function process ( files, options ) {
		Object.keys ( files ).forEach ( function ( t ) {
			var target = grunt.template.process(t);
			var sources = files [ t ].map(function(s) {
				return path.normalize(options.base + '/' + grunt.template.process(s));
			});
			if ( validate ( sources )) {
				concat ( target, sources, options );
				compress ( target, options );
			}			
		});
	}

	/**
	 * @returns {boolean}
	 */
	function validate ( shortlist ) {
		var filemap = mapcontents ( shortlist );
		var configs = __dirname + "/jshint.json";
		var options = grunt.file.readJSON ( configs );
		var globals = options.globals;
		delete options.globals;
		return allvalid ( filemap, options, globals );
	}

	/**
	 * @returns {boolean}
	 */
	function allvalid ( files, options, globals ) {
		return Object.keys ( files ).every ( function ( filepath ) {
			var content = files [ filepath ];
			if ( hint ( content, options, globals )) {
				return true;
			} else {
				report ( filepath, hint.errors [ 0 ]);
				return false;
			}
		});
	}

	/**
	 *
	 */
	function mapcontents ( shortlist ) {
		var longlist = expand ( shortlist );
		var sources = contents ( longlist );
		var map = {};
		sources.forEach ( function ( src, i ) {
			map [ longlist [ i ]] = src;
		});
		return map;
	}

	/**
	 *
	 */
	function report ( filepath, error ) {
		console.log ( 
			filepath + ": \n" + 
			"line " + error.line + ", " + 
			"char " + error.character  + ": " + 
			error.reason 
		);
	}

	/**
	 * Concatenate files to single file.
	 * @param {String} target
	 * @param {Array<String>} shortlist
	 * @param {Map<String,String} options
	 */
	function concat ( target, shortlist, options ) {
		var longlist = expand ( shortlist );
		var longtext = collect ( longlist );
    writefile ( target, longtext, options );
	}

	/**
	 * Compress concatenated files.
	 * @param {String} filepath
	 * @param {Map<String,String} options
	 */
	function compress ( filepath, options ) {
		var target = filepath.replace ( ".js", ".min.js" );
		writefile ( target, uglify ( filepath ), options );
	}

	/**
	 * Collect file contents as single string.
	 * @param {Array<String>} longlist
	 * @returns {String}
	 */
	function collect ( longlist ) {
		return enclose (
			contents ( longlist ).join ( SPACER )
		);
	}

	/**
	 * @param {Array<String>} longlist
	 * @returns {Array<String>}
	 */
	function contents ( longlist ) {
		return longlist.filter (
			existence
		).map (
			content
		);
	}

	/**
	 * Compute compressed source for file.
	 * @param {String} filepath The file path
	 * @returns {String}
	 */
	function uglify ( filepath ) {
		return ugli.minify ( filepath, {
			compress: {
        warnings: false
      }
    }).code;
	}

	/**
	 * Wrap script in humongous closure.
	 * @param {String} filepath
	 * @returns {String}
	 */
	function enclose ( source ) {
		return HEADER + SPACER + source + SPACER + FOOTER;
	}

	/**
	 * Check file existence.
	 * @param {String} filepath
	 * @returns {boolean}
	 */
	function existence ( filepath ) {
		var does = grunt.file.exists ( filepath );
		if ( !does ) {
			grunt.log.warn ( filepath + "not found." );
		}
		return does;
	}

	/**
	 * Get file content.
	 * @param {String} filepath
	 * @returns {String}
	 */
	function content ( filepath ) {
		return grunt.file.read ( filepath );
	}

	/**
	 * Write file and report to console.
	 * @param {String} filepath
	 * @param {String} filetext
	 */
	function writefile ( filepath, filetext, options ) {
		var version = '-1.0.0';
		var packag = filename('package.json', options);
		var banner = filename('BANNER.txt', options);
		if(grunt.file.exists(banner)) {
			filetext = grunt.file.read(banner) + '\n' + filetext;	
		}
		if(grunt.file.exists(packag)) {
			var json = grunt.file.readJSON(packag);
			version = json.version;
		}
		grunt.file.write ( filepath, grunt.template.process(filetext, {
			data: { version: version }
		}));
		grunt.log.writeln ( "File \"" + chalk.cyan(filepath) + "\" created." );
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
	function expand ( sources ) {
		sources = grunt.file.expand ( sources );
		return explode ( sources.map ( relpath ));
	}

	/**
	 * Source to relative something.
	 * @param {String} filepath
	 * @returns {String}
	 */
	function relpath ( filepath ) {
		return path.relative ( path.dirname ( "." ), filepath );
	}

	/**
	 * If source is a JSON file, resolve the file 
	 * as a new source list relative to that file.
	 * @param {Array<String>} sources
	 * @returns {Array<String>}
	 */
	function explode ( sources ) {
		var json, res = [];
		sources.forEach ( function ( source ) {
			switch ( path.extname ( source )) {
				case ".json" :
					json = grunt.file.readJSON ( source );
					res.push.apply ( res, json.map ( function ( filepath ) {
						return path.dirname ( source ) + "/" + filepath;
					}));
					break;
				case ".js" :
					res.push ( source );
					break;
			}
		});
		return res;
	}
};
