var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');

var paths = {
  templates: ['templates/*.jsx'],
  styles: ['styles/*.scss']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['public/css/*', 'public/js/*']);
});

gulp.task('templates', function() {
  gulp.src(paths.templates)
    .pipe(sourcemaps.init())
      .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js'))
    .on('end', function() {
      livereload.reload();
    });
});

 gulp.task('styles', function () {
  gulp.src(paths.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/css'))
    .pipe(livereload());
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.styles, ['styles']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'templates', 'styles']);