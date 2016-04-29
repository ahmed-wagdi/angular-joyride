var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');

gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css/'));
});

//Watch task
gulp.task('default',function() {
    gulp.watch('sass/**/*.scss',['styles']);
});

gulp.task('compress', function() {
  gulp.src('js/*.js')
    .pipe(minify({
        ext:{
            src:'.js',
            min:'.min.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist'))
});