module.exports = function(grunt) {
	var task = grunt.task;
    grunt.initConfig({

        // 对build目录进行清理
        clean: {
            build: {
                src: './index.html'
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
			}
		}

    });

    // 使用到的任务，可以增加其他任务
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-markdown');

    return grunt.registerTask('default', '',function(type){
		task.run(['clean','markdown']);
	});
};
