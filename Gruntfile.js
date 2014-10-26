/**
 * TODO: http://stackoverflow.com/questions/13358680/how-to-config-grunt-js-to-minify-files-separately
 * @param {Grunt} grunt
 */
module.exports = function ( grunt ) {

	"use strict";

	// load tasks via package.json
	require('load-grunt-tasks')(grunt);

	try { // first grunt will build a fake module...
		grunt.task.loadNpmTasks('grunt-spiritual-build');
	} catch(missingModuleException) {
		console.log('First build :)');
	}

	/**
	 * Shorthand Spiritual projects on the file system.
	 */
	var path = {
		gui : function ( path ) { return "../spiritual-gui/src/" + path; },
		edb : function ( path ) { return "../spiritual-edb/src/" + path; },
		mix : function ( path ) { return "../spiritual-mix/src/" + path; }
	};

	grunt.initConfig ({
		/*
		 * Manually install a build of this project in the 
		 * the node_modules folder so that we can test it.
		 */
		copy: {
			fake_node_module: {
				files: [{
					expand: true, 
					cwd: '.',
					src: [
						'*.*',
						'tasks/**',
						//'node_modules/**'
					],
					dest: 'node_modules/grunt-spiritual-build'
				}]
			}
		},

		guibundles : {
			testbundle : {
				options: {
					min: false,
					transpile: ['.es'],
					superword: ['this._super']
				},
				files : {
					"test/testing.js" : [ '../spiritual-gui/src/gui-spirits@wunderbyte.com/build.json' ],
					"test/result.js" : [ 'test/src/test1.js', 'test/src/test2.js' ]
				}
			}
		},
		
	});

	// build
	grunt.registerTask ( "default", [
		//'copy:fake_node_module'
	]);

};
