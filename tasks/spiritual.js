var path = require ( "path" );
var ugli = require ( "uglify-js" );

/**
 * Here it comes.
 * @param {Grunt} grunt
 */
module.exports = function ( grunt ) {

	"use strict";

	var SPACER = "\n\n\n";
	var HEADER = '( function ( window ) {\n\n"use strict";';
	var FOOTER = '}( this ));';

	/*
	 * Task to concat and minify files.
	 */
	grunt.registerMultiTask ( "spiritual", "Build Spiritual", function () {
		process ( this.data.files, this.options ());
	});

	/** 
	 * Concat and minify files.
	 * @param {Map<String,String} files
	 * @param {Map<String,String} options
	 */
	function process ( files, options ) {
		Object.keys ( files ).forEach ( function ( target ) {
			concat ( target, files [ target ], options );
			compress ( target, options );
		});
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
			longlist.filter (
				existence
			).map (
				content
			).join ( SPACER )
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
		filetext = ( options.banner || "" ) + filetext;
		grunt.file.write ( filepath, filetext );
		grunt.log.writeln ( "File \"" + filepath + "\" created." );
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