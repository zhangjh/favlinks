/**
 * Created by jihong.zjh on 2016/5/24.
 */
var gulp = require('gulp');
var gulpif   = require('gulp-if');
var debug = false;
/*var minifyCss = require('gulp-minify-css');
 var rename = require('gulp-rename');
 var uglify = require('gulp-uglify');
 */
var babel = require('gulp-babel');
var plugins = require('gulp-load-plugins')();

gulp.task("clean",function() {
    return gulp.src(["./public/js/*.min.js","./public/css/*.min.css","./views/*_min.ejs"])
        .pipe(plugins.clean());
});

gulp.task('css',["clean"],function(){
    return gulp.src('public/css/*.css')
        .pipe(gulpif(!debug, plugins.minifyCss({compatibility: 'ie8'})))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('public/css'));
});

gulp.task('js',['clean'],function(){
    return gulp.src('public/js/*.js')
        .pipe(babel())
        .pipe(gulpif(!debug, plugins.uglify().on('error',function (err) {
            console.error(err);
            this.emit('end');
        })))
        .pipe(plugins.rename({suffix:'.min'}))
        .pipe(gulp.dest('public/js/'));
});

gulp.task('html',['clean'],function () {
    return gulp.src('views/*.ejs')
        .pipe(gulpif(!debug, plugins.minifyEjs()))
        .pipe(plugins.rename({suffix:'_min'}))
        .pipe(gulp.dest('views/'));
});

gulp.task("default",["css","js","html"],function(){
    //task codes      
    console.log("gulp tasks ok!");
});