var util = {},
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    to5ify = require('6to5ify'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    jsonfile = require('jsonfile');

util.bundler = browserify('./src/playtube.js', watchify.args);
util.bundler.transform(to5ify);
util.bundler = watchify(util.bundler);

util.bundleName = function () {
    var pkg = jsonfile.readFileSync('./package.json');

    return pkg.name + '.' + pkg.version + '.min.js';
};

gulp.task('lint', function () {
    return gulp
        .src(['./src/*.js','./tests/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', ['lint'], function () {
    return gulp
        .src(['./tests/*.js'], {read: false})
        .pipe(mocha());
});

gulp.task('bundle', ['test'], function () {
    return util.bundler
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
        })
        .pipe(source(util.bundleName()))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
})

gulp.task('watch', function () {
    gulp.watch(['./src/**/*', './tests/**/*'], ['default']);
});

gulp.task('default', ['bundle']);
