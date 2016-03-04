;
(function() {
  var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    replace = require('gulp-replace'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

  //captures timestamp
  var timeStamp = function() {
    var date = new Date();
    return date.getFullYear().toString() +
      ('0' + date.getMonth().toString()).slice(-2) +
      ('0' + date.getDate().toString()).slice(-2) +
      date.getTime();
  };

  var config = {
    scripts: {
      srcPath: 'scripts/*.js',
      destPath: config.scripts.destPath,
      mainFile: 'main.js'
    },
    styles: {
      srcPath: 'sass/*.scss',
      destPath: 'dist/css',
      minFile: 'base.min.css',
    },
    suffix: {
      min: '.min'
    }
  };

  // Styles
  gulp.task('styles', function() {
    return gulp.src(config.styles.srcPath)
      .pipe(sass())
      .pipe(rename({
        suffix: config.suffix.min
      }))
      .pipe(minifycss())
      .pipe(plumber({
        errorHandler: handleError
      }))
      .pipe(gulp.dest(config.styles.destPath))
      .pipe(livereload(server))
      .pipe(notify({
        message: 'Styles task complete'
      }))

  });

  gulp.task('lint', function() {
    return gulp.src(config.scripts.srcPath)
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('default'))
  });

  //Concat all the js scripts, uglify and move to dist
  gulp.task('scripts', function() {
    return gulp.src(config.scripts.srcPath)
      .pipe(concat(config.scripts.mainFile))
      .pipe(rename({
        suffix: config.suffix.min
      }))
      .pipe(uglify())
      .pipe(gulp.dest(config.scripts.destPath))
      .pipe(livereload(server))
      .pipe(notify({
        message: 'Scripts task complete'
      }))
  });

  gulp.task('default', ['styles', 'lint', 'scripts', 'watch']);


  // Watch Files For Changes
  gulp.task('watch', function() {
    server.listen(40000, function(err) {
      if (err) {
        return console.log(err);
      }
      gulp.watch('scripts/**/*.js', ['lint', 'scripts']);
      gulp.watch('sass/**/*.scss', ['styles']);
    });

  });

  function handleError(error) {
    console.log(error);
    this.emit('end');
  }

  gulp.task('cachebust', function() {
    console.log(config.scripts.mainFile + '?' + timeStamp());
    var regex = new RegExp(config.scripts.mainFile + "\?([0-9]*)/g");
    console.log(regex);
    return gulp.src('dist/*.html')
      .pipe(replace(regex, config.scripts.mainFile + '?' + timeStamp()))
      .pipe(gulp.dest('dist/'))
      .pipe(notify({
        message: 'CSS/JS Cachebust task complete'
      }));
  });
}());
