var gulp = require('gulp'),
    run = require('gulp-run')
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs');
    del = require('del');
    browserSync = require('browser-sync');


gulp.task('releaseBuild', ['version'], function () {
    // clean folders
    del.sync('src/js');
    del.sync('dist/js');
    del.sync('dist/libs');
    del.sync('dist/resources');

    // minify libs
    gulp.src([
        'src/libs/Pixi/pixi.min.js',
        'src/libs/DragonBonesJS/DragonBones/build/dragonBones.min.js',
        'src/libs/DragonBonesJS/Pixi/build/dragonBonesPixi.min.js'
    ])
        .pipe(uglify('libs.min.js'))
        .pipe(gulp.dest('dist/libs'));

    // minify javascripts
    gulp.src([
        'src/ts/**/*.js'
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify('app.min.js'))
        .pipe(gulp.dest('dist/js'));

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

gulp.task('debugWatch', ['version', 'debugBrowserSync'], function () {
    // watch files and reload server
    gulp.watch('src/ts/**/*.ts', browserSync.reload);
    gulp.watch('src/ts/index.html', browserSync.reload);
});

gulp.task('debugBrowserSync', function () {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});

gulp.task('version', function () {
    run('version_change.bat').exec();
});
