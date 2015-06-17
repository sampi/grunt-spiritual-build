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
					//"test/testing.js" : ['../spiritual-gui/src/gui-spirits@wunderbyte.com/build.json']	
				}
			}
		},
		
	});

	// build
	grunt.registerTask ( "default", [
		//'copy:fake_node_module'
	]);

};
