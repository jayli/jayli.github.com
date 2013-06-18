/*
 * 源文件：http://jayli.github.com/Gruntfile.js
 * 项目初始化：http://jayli.github.com/tripinit.sh
 */

var path = require('path'),
	fs = require('fs'),
	os = require('os');

var pathname = path.basename(__dirname);

var walk = function(uri, files) {

	var stat = fs.lstatSync(uri);
	if (stat.isFile() && !/(build|node_modules|demo|\.git|\.+)[\\|\/]/i.test(uri) && !/grunt.+/i.test(uri)) {

		switch (path.extname(uri)) {
		case '.css':
			files.css.push(uri);
			break;
		case '.js':
			files.js.push(uri);
			break;
		default:
			files.other.push(uri);
		}
	}
	if (stat.isDirectory()) {
		fs.readdirSync(uri).forEach(function(part) {
			walk(path.join(uri, part), files);
		});
	}
};


// 得到目标数据结构
var doWalk = function(rootDir) {
	var files = {
		css: [],
		js: [],
		other: [] // 暂时没用
	};
	walk(rootDir, files);
	return files;
};

var files = doWalk('./');

module.exports = function(grunt) {
    grunt.initConfig({
        // 添加
        kmc: {
            options: {
                packages: [
                    {
                        name: pathname,
                        path: './',
						charset:'utf-8'
                    }
                ]
            },
            main: {
                files: [
                    {
                        src: "index.js",
                        dest: "build/index.js"
                    }
                ]
            },
			/*
			"another-task":{
                files: [
                    {
                        src: "index.js",
                        dest: "build/index.js"
                    }
                ]
			}
			*/
        },
        // 打包后压缩文件
        // 压缩文件和入口文件一一对应
        uglify: {
            options: {
                banner: ''
            },
            base: {
                files: {
                    'build/index-min.js': ['build/index.js']
                }
            }
        },
		// 合并css
		concat:{
			options:{},
			dist:{
				src:files.css,
				dest:'build/index.css'
			}
		},

		cssmin: {
			add_banner: {
				options: {},
				files: {
					'build/index-min.css': ['build/index.css']
				}
			}
		},

		copy : {
			main: {
				files:[
					{
						src: files.js, 
						dest: 'build/', 
						filter: 'isFile'
					},
					{
						src: files.css, 
						dest: 'build/', 
						filter: 'isFile'
					}
				]
			}
		}
    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-kmc');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

    return grunt.registerTask('default', ['kmc','copy','concat', 'uglify','cssmin']);
};


