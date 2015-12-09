var gulp        = require('gulp');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var babelify    = require('babelify');
var watchify    = require('watchify');
var exorcist    = require('exorcist');
var browserify  = require('browserify');
var exec = require('child_process').exec;

// Input file.
watchify.args.debug = true;
var bundler = watchify(browserify('./app/js/popup_init.js', watchify.args));

// Babel transform
bundler.transform(babelify.configure({
    sourceMapRelative: 'app/js'
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {

    gutil.log('Compiling JS...');

    var output = bundler.bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            this.emit("end");
        })
        .pipe(exorcist('app/js/dist/bundle.js.map'))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./app/js/dist'));
        //.pipe(updateExtension());

    //exec('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=/Users/employee/telmate_dev/seejs --pack-extension-key=/Users/employee/telmate_dev/seejs/seejs.pem');
    gutil.log('Finished compiling');

    return output;
}

function updateExtension () {
    //gutil.log('updating Extension');
}

/**
 * Gulp task alias
 */
gulp.task('bundle', function () {
    return bundle();
});

/**
 * First bundle, then serve from the ./app directory
 */
gulp.task('default', ['bundle'], function () {
    //exec('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=/Users/employee/telmate_dev/seejs --pack-extension-key=/Users/employee/telmate_dev/seejs/seejs.pem');
});