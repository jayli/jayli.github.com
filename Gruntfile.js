module.exports = function(grunt) {
	var task = grunt.task;
    grunt.initConfig({

        // 对build目录进行清理
        clean: {
            build: {
                src: ['./index.html','./photo/assets/data.js']
			}
        },
		markdown: {
			all: {
				files: [
					{
						expand: true,
						src: ['index.md','gallery/calendar/README.markdown'],
						dest: './',
						ext: '.html'
					}
				]
			},
			options: {
				template: 'markdown-template.jst',
			}
		},
		replace: {
			example: {
				src: ['photo/data.md'],
				dest: 'photo/assets/data.js',
				replacements: [{
					from: /^(http.+(png|jpeg|jpg|gif))$/igm,      // regex replacement ('Fooo' to 'Mooo') 
					to: "{img:'$1',"
				}, {
					from: /^(.+)$/igm,      // regex replacement ('Fooo' to 'Mooo') 
					to: function (matchedWord, index, fullText, regexMatches) {
						if(/(png|jpeg|jpg|gif)$/.test(matchedWord)) {
							return matchedWord;
						} else if (/^\{/.test(matchedWord)) {
							return matchedWord;
						} else if (/^--.+--$/ig.test(matchedWord)) {
							return '';
						} else {
							return "des:'" + matchedWord + "'},";
						}
					}
				}]
			}
		},
		concat: {
			options:{
				stripBanners: true,
				banner:"var PhotoList = [",
				footer:"];",
			},
			dist: {
				src: ['photo/assets/data.js'],
				dest: 'photo/assets/data.js',
			}
		},
		uglify:{
			options: {
				beautify: {
					ascii_only: true
				}
			},
			main: {
				files: [
					{
						expand: true,
						src: ['photo/assets/data.js'],
						dist: 'photo/assets/data.js'
					}
				]
			},
		}

    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-markdown');
    grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

    return grunt.registerTask('default', '',function(type){
		task.run(['clean','markdown','replace:example','concat','uglify']);
	});
};
