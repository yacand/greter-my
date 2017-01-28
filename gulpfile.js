var gulp = require('gulp'),
    run = require('gulp-run')
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs');
    del = require('del');
    browserSync = require('browser-sync');


gulp.task('buildRelease', ['_clean','_version','_minifyLibs','_minifyJs','_browserSyncRelease'], function() {
    var buildResources = gulp.src('src/resources/**/*')
        .pipe(gulp.dest('dist/resources'))
});

gulp.task('_version', function () {
    run('version_change.bat').exec();
});

gulp.task('_clean', function() {
    del.sync('src/js');
    del.sync('dist/js');
    del.sync('dist/libs');
    return del.sync('dist/resources');
});

gulp.task('_minifyLibs', function() {
    return gulp.src([
        'node_modules/pixi.js/dist/pixi.min.js',
        'src/libs/DragonBonesJS/DragonBones/build/dragonBones.min.js',
        'src/libs/DragonBonesJS/Pixi/build/dragonBonesPixi.min.js'
    ])
        .pipe(uglify('libs.min.js'))
        .pipe(gulp.dest('dist/libs'));
});

gulp.task('_minifyJs', function() {
    return gulp.src([
        'src/ts/**/*.js'
    ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify('app.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('_browserSyncRelease', function() {
    browserSync({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });
});


gulp.task('buildDebug', ['_version','_browserSyncDebug'], function() {

});

gulp.task('_browserSyncDebug', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
        notify: false
    });
});

// gulp.task('watch', function() {
//     gulp.watch('src/ts/**/*.js', ['_minifyJs']);
// });
