var gulp        = require('gulp');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var babelify    = require('babelify');
var watchify    = require('watchify');
var exorcist    = require('exorcist');
var browserify  = require('browserify');

// Input file.
watchify.args.debug = true;
var bundler = watchify(browserify('./app/js/popup_init.js', watchify.args));
var bundler2 = watchify(browserify('./app/js/bubble.js', watchify.args));

// Babel transform
bundler.transform(babelify.configure({
    sourceMapRelative: 'app/js'
}));
bundler2.transform(babelify.configure({
    sourceMapRelative: 'app/js'
}));

// On updates recompile
bundler.on('update', bundle);
bundler2.on('update', bundle2);

function bundle () {
    gutil.log('Compiling Popup JS...');

    var output = bundler.bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            this.emit("end");
        })
        .pipe(exorcist('app/js/dist/popup_bundle.js.map'))
        .pipe(source('popup_bundle.js'))
        .pipe(gulp.dest('./app/js/dist'));

    gutil.log('Finished compiling popup');

    return output;
}

function bundle2 () {
    gutil.log('Compiling Bubble JS...');

    var output = bundler2.bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            this.emit("end");
        })
        .pipe(exorcist('app/js/dist/bubble_bundle.js.map'))
        .pipe(source('bubble_bundle.js'))
        .pipe(gulp.dest('./app/js/dist'));

    gutil.log('Finished compiling bubble');

    return output;
}

/**
 * Gulp task alias
 */
gulp.task('bundle', function () {
    return bundle();
});

gulp.task('bundle2', function () {
    return bundle2();
})

/**
 * First bundle, then serve from the ./app directory
 */
gulp.task('default', ['bundle', 'bundle2'], function () {
});