import gulp from 'gulp';
import jsonfile from 'jsonfile';
import webpack from 'webpack';
import del from 'del';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import webpackConfig from './webpack.config';
import glob from 'globby';

import {
    lintFiles,
    getPrinter
} from 'canonical';

gulp.task('lint', () => {
    return glob(['./src/**/*.js', './test/**/*.js'])
        .then((paths) => {
            let printer,
                report;

            printer = getPrinter();
            report = lintFiles(paths);

            if (report.errorCount || report.warningCount) {
                console.log(printer(report));
            }
        });
});

gulp.task('clean', ['lint'], () => {
    return del([
            './dist/es5/*',
            './dist/browser/*'
        ]);
});

gulp.task('build-browser', ['clean'], (done) => {
    webpack(webpackConfig, (error, stats) => {
        if (error) {
            throw new gutil.PluginError('webpack', error);
        }

        // gutil.log('[webpack]', stats.toString());

        done();
    });
});

gulp.task('build-es5', ['clean'], () => {
    return gulp
        .src('./src/*')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/es5'));
});

gulp.task('test', ['build-browser', 'build-es5'], (done) => {
    return gulp
        .src('./test/*', {
            read: false
        })
        .pipe(mocha());
});

gulp.task('version', ['test'], () => {
    let pkg = jsonfile.readFileSync('./package.json'),
        bower = jsonfile.readFileSync('./bower.json');

    bower.name = pkg.name;
    bower.description = pkg.description;
    bower.keywords = pkg.keywords;
    bower.license = pkg.license;
    bower.authors = [
        pkg.author
    ];

    jsonfile.writeFileSync('./bower.json', bower);
});

gulp.task('build', ['version']);

gulp.task('default', ['build']);

gulp.task('watch', () => {
    gulp.watch(['./src/**/*', './tests/**/*'], ['default']);
});
