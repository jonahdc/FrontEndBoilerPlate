;
(function() {
  var gulp = require('gulp');
  var sass = require('gulp-sass');
  var jshint = require('gulp-jshint');
  var minifycss = require('gulp-minify-css');
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var notify = require('gulp-notify');
  var replace = require('gulp-replace');
  var plumber = require('gulp-plumber');
  var rename = require('gulp-rename');
  var browserSync = require('browser-sync').create();
  var lr = require('tiny-lr');
  var server = lr();

  /*
   * Config
   */
  var config = {
    scripts: {
      srcPath: 'scripts/**/*.js',
      destPath: 'dist/scripts/src',
      outputFile: 'main.js'
    },
    styles: {
      srcPath: './sass/**/*.scss',
      destPath: 'dist/css',
      outputFile: 'base.min.css',
    },
    suffix: {
      min: '.min'
    }
  };

  /*
   * Tasks
   */

  // Compiles Scss files and minify
  gulp.task('styles', function() {
    return gulp.src(config.styles.srcPath)
      .pipe(plumber({
        errorHandler: handleError
      }))
      .pipe(sass())
      .pipe(rename({
        suffix: config.suffix.min
      }))
      .pipe(minifycss())
      .pipe(gulp.dest(config.styles.destPath))
      .pipe(notify({
        message: 'Styles task complete'
      }))

  });

  //Lints JS files
  gulp.task('lint', function() {
    return gulp.src(config.scripts.srcPath)
      .pipe(plumber({
        errorHandler: handleError
      }))
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('default'))
  });

  //Concat all the JS scripts and uglify
  gulp.task('scripts', function() {
    return gulp.src(config.scripts.srcPath)
      .pipe(plumber({
        errorHandler: handleError
      }))
      .pipe(concat(config.scripts.outputFile))
      .pipe(rename({
        suffix: config.suffix.min
      }))
      .pipe(uglify())
      .pipe(gulp.dest(config.scripts.destPath))
      .pipe(notify({
        message: 'Scripts task complete'
      }))
  });

  gulp.task('default', ['styles',
    'lint',
    'scripts',
    'watch'
  ]);

  // Watch Files For Changes
  gulp.task('watch', function() {
    browserSync.init({
      server: "./dist"
    });

    gulp.watch(config.scripts.srcPath, ['lint', 'scripts']).on('change', browserSync.reload);
    gulp.watch(config.styles.srcPath, ['styles']).on('change', browserSync.reload);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
  });


  //Cachebust JS/CSS files called in html files
  gulp.task('cachebust', function() {
    var regex = new RegExp(config.scripts.outputFile + "\?([0-9]*)/g");

    return gulp.src('dist/*.html')
      .pipe(plumber({
        errorHandler: handleError
      }))
      .pipe(replace(regex, config.scripts.outputFile + '?' + timeStamp()))
      .pipe(gulp.dest('dist/'))
      .pipe(notify({
        message: 'CSS/JS Cachebust task complete'
      }));
  });
}());

/*
 * Helper functions
 */

function handleError(error) {
  console.log(error);
  this.emit('end');
}

//captures timestamp
function timeStamp() {
  var date = new Date();
  return date.getFullYear().toString() +
    ('0' + date.getMonth().toString()).slice(-2) +
    ('0' + date.getDate().toString()).slice(-2) +
    date.getTime();
}
