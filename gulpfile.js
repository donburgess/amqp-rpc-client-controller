const gulp = require('gulp'),
      ts = require('gulp-typescript'),
      tslint = require('gulp-tslint'),
      jasmine = require('gulp-jasmine'),
      del = require('del'),
      merge = require('merge2');

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', () => {
  return del(['dist'])
});

gulp.task('transpile', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());
  
  return merge([
    tsResult.dts.pipe(gulp.dest('dist')),
    tsResult.js.pipe(gulp.dest('dist'))
  ]);
});

gulp.task('lint', () => {
  return gulp.src('./src/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report());
});

gulp.task('test', () => {
  gulp.src('dist/*.spec.js')
    .pipe(jasmine());
});

gulp.task('watch', ['lint', 'transpile', 'test'], () => {
  gulp.watch('src/**/*.ts', ['lint', 'transpile']);
});

gulp.task('default', ['clean', 'lint', 'transpile']);
