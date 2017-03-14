var gulp = require("gulp"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    mocha = require("gulp-mocha");
var clean = require('gulp-clean');

var tsSourceAndTestFiles = [
    "src/**/**.ts",
    "!src/**/**.d.ts",
    "test/**/**.test.ts"
];

var tsSourceFiles = [
    "!src/**/**.d.ts",
    "src/**/**.ts"
];

var jsTestFiles = ['lib/**/*.test.js', "!lib/**/*.d.test.js",];

var buildOutput = "./lib";

gulp.task("lint", function () {
    var config = {
        formatter: "verbose",
        emitError: (process.env.test) ? true : false
    };

    return gulp.src(tsSourceAndTestFiles)
        .pipe(tslint(config))
        .pipe(tslint.report());
});

//******************************************************************************
//* BUILD TEST
//******************************************************************************
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function () {
    return gulp.src(tsSourceAndTestFiles, {
            base: "."
        })
        .pipe(tsProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js
        .pipe(gulp.dest(buildOutput));
});

//******************************************************************************
//* TEST
//******************************************************************************
gulp.task("test", function () {
    return gulp.src(jsTestFiles)
        .pipe(mocha());
});

//******************************************************************************
//* CLEAN
//******************************************************************************

gulp.task('clean-scripts', function () {
  return gulp.src(buildOutput, {read: false})
    .pipe(clean());
});

//******************************************************************************
//* BUILD
//******************************************************************************
gulp.task("build-release", function () {
    return gulp.src(tsSourceFiles, {
            base: "."
        })
        .pipe(tsProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js
        .pipe(gulp.dest(buildOutput));
});


//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
    runSequence("lint", "build-test", "test", "clean-scripts", "build-release", cb);
});
