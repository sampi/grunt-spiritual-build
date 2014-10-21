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

		spiritual : {
			test : {
				files : {
					"test/testing.js" : [ '../spiritual-gui/src/modules/spirits.module/TEMP.json' ]
				}
			}
			/*
			gui : {
				options : {
					jshintrc : path.gui ( ".jshintrc" )
				},
				files : {
					"js/libs/spiritual/spiritual-gui.js" : [
						path.gui ( "build.json" ),
						path.gui ( "modules/spirits.module/build.json" ),
						path.mix ( "layout.module/build.json" ),
						path.mix ( "flex.module/build.json" ),
						path.mix ( "keys.module/build.json" )
					]
				}
			},
			edb : {
				options : {
					jshintrc : path.edb ( ".jshintrc" )
				},
				files : {
					"js/libs/spiritual/spiritual-edb.js" : [
						path.edb ( "edb.module/build.json" ),
						path.edb ( "edbml.module/build.json" ),
						path.edb ( "sync.module/build.json" ),
						path.mix ( "states.module/build.json" )
					]
				}
			}
			*/
		},
		
	});

	// build
	grunt.registerTask ( "default", [
		'copy:fake_node_module'
	]);

};
