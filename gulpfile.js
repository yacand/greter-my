var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs');
    del = require('del');


gulp.task('build', ['_clean', '_libs','_resources','_minify'], function() {
    var buildResources = gulp.src('src/resources/**/*')
        .pipe(gulp.dest('dist/resources'))
});

gulp.task('_clean', function() {
    del.sync('src/js');
    del.sync('dist/js');
    del.sync('dist/libs');
    return del.sync('dist/resources');
});

gulp.task('_libs', function() {
    return gulp.src([
        'node_modules/pixi.js/dist/pixi.min.js',
        'src/libs/DragonBonesJS/DragonBones/build/dragonBones.min.js',
        'src/libs/DragonBonesJS/Pixi/build/dragonBonesPixi.min.js'
    ])
        .pipe(gulp.dest('dist/libs'));
});

gulp.task('_resources', function() {
    return gulp.src([
        'src/resources/**'
    ])
        .pipe(gulp.dest('dist/resources'));
});

// gulp.task('_scripts', function() {
//     return gulp.src([
//         'src/ts/**/*.js'
//     ])
//         .pipe(concat('main.js'))
//         .pipe(gulp.dest('src/js'));
// });

gulp.task('_minify', function() {
    return gulp.src([
        'src/ts/**/*.js'
    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('src/js'))
        .pipe(uglify('main.min.js'))
        .pipe(gulp.dest('dist/js'));
});