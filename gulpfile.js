var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('webserver', function () {
  gulp.src('./')
    .pipe(webserver({
      host: 'localhost',
      port: 3000,
      livereload: true,
      open: './index.html',
      directoryListing: {
        enable: true,
        path: './'
      }
    //   proxies: [
    //     {
    //         source: '/api', target: 'http://jsonplaceholder.typicode.com'
    //     }
    //   ]
    }))
});
gulp.task('default', ['webserver'], function () {
  console.log('success');
});