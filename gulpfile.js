var gulp = require('gulp');
var transpile  = require('gulp-es6-module-transpiler');

gulp.task('build', function() {
  return gulp.src('top-shelf.js')
    .pipe(transpile({
      formatter: 'bundle',
      importPaths: ['.', './bower_components']
    }))
    .pipe(gulp.dest('build/'));
})
