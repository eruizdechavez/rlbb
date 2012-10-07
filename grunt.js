/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['*.js', 'controllers/*.js', 'public/js/*.js']
    },
    concat: {
      'build-lib': {
        src: ['public/js/lib/jquery-1.8.2.js', 'public/js/lib/bootstrap.js', 'public/js/lib/underscore.js', 'public/js/lib/backbone.js'],
        dest: 'public/js/lib.js',
        separator: ';'
      },
      build: {
        src: ['public/js/lib.js', 'public/js/main.js'],
        dest: 'public/js/<%= pkg.name %>.js',
        separator: ';'
      }
    },
    min: {
      build: {
        src: '<config:concat.build.dest>',
        dest: 'public/js/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      build: {
        files: {
          'build/': ['app.js', 'package.json', 'router.js'],
          'build/controllers/' : 'controllers/**',
          'build/public/': 'public/*',
          'build/public/css/': 'public/css/**',
          'build/public/img/': 'public/img/**',
          'build/public/js/': '<config:min.build.dest>'
        }
      }
    },
    clean: {
      build: ['build/', '<config:min.build.dest>', '<config:concat.build-lib.dest>', '<config:concat.build.dest>']
    },
    replace: {
      'script-tag': {
        files: {
          'build/public/index.html': 'public/index.html'
        },
        options: {
          variables: {
            'js -->(.|\r\n|\r|\n)+(<script .+/script>)+(.|\r\n|\r|\n)+<!-- end:js -->': '<script type="text/javascript" src="@@minjs"></script>'
          },
          prefix: '<!-- start:'
        }
      },
      'script-path': {
        files: {
          'build/public/index.html': 'build/public/index.html'
        },
        options: {
          variables: {
            'minjs': 'js/<%= pkg.name %>.min.js'
          }
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        node: true,
        jquery: true
      },
      globals: {
        Backbone: false,
        _: true
      }
    }
  });

  // External tasks.
  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-replace');

  // Build targets
  grunt.registerTask('default', 'clean lint concat min copy replace');
};
