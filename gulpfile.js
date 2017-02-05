var gulp = require('gulp'),
    run = require('gulp-run'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    del = require('del'),
    browserSync = require('browser-sync'),
    sourcemap = require('gulp-sourcemap');


gulp.task('releaseBuild', ['version'], function () {
    // clean folders
    del.sync('src/js');
    del.sync('dist/js');
    del.sync('dist/libs');
    del.sync('dist/resources');

    gulp.src([
        'src/ts/AppStart.js'
    ])
        .pipe(gulp.dest('dist/js'))

    // concat and minify javascripts
    gulp.src([
        'src/ts/references.d.js',
        'src/ts/Version.js',
        'src/ts/Core/**/*.js',
        'src/ts/Game/**/*.js'
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify('app.min.js'))
        .pipe(gulp.dest('dist/js'));

    // minify libs
    gulp.src([
        'src/libs/Pixi/pixi.min.js',
        'src/libs/DragonBonesJS/DragonBones/build/dragonBones.min.js',
        'src/libs/DragonBonesJS/Pixi/build/dragonBonesPixi.min.js'
    ])
        .pipe(uglify('libs.min.js'))
        .pipe(gulp.dest('dist/libs'));

    // copy resources
    gulp.src('src/resources/**/*')
        .pipe(gulp.dest('dist/resources'));

    // create server
    browserSync({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});

gulp.task('debugBrowserSync', ['version', 'buildTypeScript'], function () {
    browserSync({
        server: {
            baseDir: 'src'
        },
        port: 3000,
        open: true,
        notify: false
    });

    gulp.watch("src" + '/js/**/*.js');
});

gulp.task('debugWatch', ['version', 'debugBrowserSync'], function () {
    // watch files and reload server
    gulp.watch('src/is/app.js', browserSync.reload);
    gulp.watch('src/ts/index.html', browserSync.reload);
});

gulp.task('version', function () {
    run('version_change.bat').exec();
});

gulp.task('buildTypeScript', function () {
    // delete
    del.sync('src/js');

    //concat
    gulp.src([
        'src/ts/references.d.js',
        'src/ts/Version.js',
        'src/ts/Core/**/*.js',
        'src/ts/Game/**/*.js'
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(sourcemap({
            outSourceMap:'app.js.map',
            sourceRoot:"http://jslite.io",
            write:'src/js/'
        }))
        .pipe(gulp.dest('./src/js/'));
});