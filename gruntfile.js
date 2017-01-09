module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                expand: true,
                cwd: 'src',
                src: '**',
                dest: 'C:\\Users\\jbassett\\AppData\\Local\\Screeps\\scripts\\ssvnormandy_com___21025\\screeps',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
}
