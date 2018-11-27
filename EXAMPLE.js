/*
 * Example Gruntfile for building spiritual projects into other projects.
 */

/**
 * Shorthand Spiritual projects somewhere on the file system.
 */
var path = {
	gui: function(path) {
		return '../spiritual-gui/src/' + path;
	},
	edb: function(path) {
		return '../spiritual-edb/src/' + path;
	},
	mix: function(path) {
		return '../spiritual-mix/src/' + path;
	}
};

/**
 * Spiritual banner or you will hear from our lawyers.
 */
var banner =
	'/**\n' +
	' * Spiritual $$$\n' +
	' * 2013 Wunderbyte\n' +
	' * Spiritual is freely distributable under the MIT license.\n' +
	' */\n';

/**
 * Here it comes.
 * @param {Grunt} grunt
 */
module.exports = function(grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-spiritual');

	grunt.initConfig({
		spiritual: {
			gui: {
				// build Spiritual GUI with module extras
				options: {
					banner: banner.replace('$$$', 'GUI')
				},
				files: {
					'my/target/js/spiritual-gui.js': [
						path.gui('gui.json'),
						path.mix('jquery.module/jquery.module.json'),
						path.mix('layout.module/layout.module.json'),
						path.mix('flex.module/flex.module.json'),
						path.mix('keys.module/keys.module.json')
					]
				}
			},
			edb: {
				// uild Spiritual EDB module
				options: {
					banner: banner.replace('$$$', 'EDB')
				},
				files: {
					'my/target/js/spiritual-edb.js': [
						path.edb('edb.module/edb.module.json')
					]
				}
			}
		}
	});

	grunt.registerTask('default', 'spiritual');
};
