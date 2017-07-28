var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var rename = require('gulp-rename');

gulp.task('styles', function() {
    gulp.src('sass/styles.scss')
        .pipe(rename({basename: "joyride"}))
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/'))
        .pipe(rename({basename: "joyride", suffix: '.min'}))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./dist/'));
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