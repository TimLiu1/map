var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('webserver', function () {
  gulp.src('./')
    .pipe(webserver({
      host: 'localhost',
      port: 3008,
      livereload: true,
      open: './index.html',
      directoryListing: {
        enable: true,
        path: './'
      }
    }))
});
gulp.task('default', ['webserver'], function () {
  console.log('success');
});