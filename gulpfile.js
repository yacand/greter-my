var gulp = require('gulp'),
    run = require('gulp-run'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    del = require('del'),
    browserSync = require('browser-sync'),
    sourcemap = require('gulp-sourcemap'),
    glob = require('glob'),
    gutil = require('gulp-util'),
    es = require('event-stream'),
    ts = require('gulp-typescript'),
    path = require("path"),
    sourcemaps = require('gulp-sourcemaps');


gulp.task('release', ['version','delete','build-ts','resources','libs'], function () {

    // create server
    browserSync({
        server: {
            baseDir: 'dist'
        },
        port: 9900,
        open: true,
        notify: false,
        index: 'index.html'
    });

    // concat and minify javascript
    gulp.src([
        'dist/js/app.js'
    ])
        .pipe(uglify('app.min.js'))
        .pipe(gulp.dest('dist/js/'));
});


gulp.task('debug', ['version','delete','build-ts','resources','libs'], function () {
    browserSync({
        server: {
            baseDir: 'dist'
        },
        port: 9900,
        open: true,
        notify: false,
        index: 'index-debug.html',
        files: ['dist/js/*.js','dist/index-debug.html']
    });
});

// ==================================

// Compiles TS > JS
gulp.task('build-ts',
    function ()
    {
        return glob('./src/ts/AppStart.ts', {ignore:["./src/ts/_*.ts", "./game/ts/**/*.d.ts"]},
            function (err, files)
            {
                var tasks = files.map(
                    function (entry)
                    {
                        gutil.log('TypeScript compiling file: ' + entry);
                        var outFileName = 'app.js';

                        gutil.log('TypeScript out file: ./dist/' + outFileName);

                        return gulp.src(entry)
                            .pipe(sourcemaps.init())
                            .pipe(ts({
                                target: "ES5",
                                noImplicitAny: false,
                                outFile: outFileName,
                                removeComments: true,
                                experimentalDecorators: true,
                                sourceMap: true,
                                allowJs: false
                            }))
                            .pipe(sourcemaps.write())
                            .pipe(gulp.dest('./dist/js'));
                    });
                    return es.merge.apply(null, tasks)
                        .on('end',
                            function ()
                            {
                                gutil.log('End stream');
                            });
            });
    });

gulp.task('version', function () {
    run('version_change.bat').exec();
});

gulp.task('delete', function () {
    del.sync('dist/js');
    del.sync('dist/libs');
    del.sync('dist/resources');
});

gulp.task('resources', function () {
    // copy resources
    gulp.src('src/resources/**/*')
        .pipe(gulp.dest('dist/resources'));
});

gulp.task('libs', function () {
    // minify libs
    gulp.src([
        'src/libs/Pixi/pixi.min.js',
        'src/libs/DragonBonesJS/DragonBones/build/dragonBones.min.js',
        'src/libs/DragonBonesJS/Pixi/build/dragonBonesPixi.min.js'
    ])
        .pipe(uglify('libs.min.js'))
        .pipe(gulp.dest('dist/libs'));
});