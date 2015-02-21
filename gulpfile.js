'use strict';

var util = {},
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    sourcemaps = require('gulp-sourcemaps'),
    header = require('gulp-header'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    jsonfile = require('jsonfile');

util.bundler = browserify('./src/playtube.js', watchify.args);
util.bundler.transform(babelify);
util.bundler = watchify(util.bundler);

util.bundleName = function () {
    var pkg = jsonfile.readFileSync('./package.json');

    return pkg.name + '.min.js';
};

gulp.task('lint', function () {
    return gulp
        .src(['./src/*.js','./tests/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('bundle', ['lint'], function () {
    return util.bundler
        .bundle()
        .on('error', function(err) {
            console.log(err.message);
        })
        .pipe(source(util.bundleName()))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('version', ['bundle'], function () {
    var name = 'contents',
        pkg = jsonfile.readFileSync('./package.json'),
        bower = jsonfile.readFileSync('./bower.json');

    gulp
        .src('./dist/' + util.bundleName())
        .pipe(header('/**\n * @version <%= version %>\n * @link https://github.com/gajus/' + name + ' for the canonical source repository\n * @license https://github.com/gajus/' + name + '/blob/master/LICENSE BSD 3-Clause\n */\n', {version: pkg.version}))
        .pipe(gulp.dest('./dist/'));

    bower.name = pkg.name;
    bower.description = pkg.description;
    bower.version = pkg.version;
    bower.keywords = pkg.keywords;
    bower.license = pkg.license;
    bower.authors = [pkg.author];

    jsonfile.writeFileSync('./bower.json', bower);
});

gulp.task('watch', function () {
    gulp.watch(['./src/**/*', './tests/**/*'], ['default']);
});

gulp.task('default', ['version']);
