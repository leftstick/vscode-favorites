const gulp = require('gulp')
const path = require('path')

const ts = require('gulp-typescript')
const typescript = require('typescript')
const sourcemaps = require('gulp-sourcemaps')
const runSequence = require('run-sequence')
const es = require('event-stream')
const vsce = require('@vscode/vsce')

const tsProject = ts.createProject('./tsconfig.json', { typescript })

const inlineMap = true
const inlineSource = false
const outDest = 'out'

const cleanTask = function () {
  return import('del')
    .then((res) => {
      return res.deleteAsync(['out', '*.vsix'])
    })
    .then(() => {
      console.log('del finished')
    })
}

const doCompile = function () {
  var r = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject()).js.pipe(es.through()).pipe(es.through())

  if (inlineMap && inlineSource) {
    r = r.pipe(sourcemaps.write())
  } else {
    r = r.pipe(
      sourcemaps.write('../out', {
        // no inlined source
        includeContent: inlineSource,
        // Return relative source map root directories per file.
        sourceRoot: '../src',
      })
    )
  }

  return r.pipe(gulp.dest(outDest))
}

const buildTask = gulp.series(cleanTask, doCompile)

const vscePublishTask = function () {
  return vsce.publish()
}

const vscePackageTask = function () {
  return vsce.createVSIX()
}

gulp.task('default', buildTask)

gulp.task('clean', cleanTask)

gulp.task('build', buildTask)

gulp.task('publish', gulp.series(buildTask, vscePublishTask))

gulp.task('package', gulp.series(buildTask, vscePackageTask))
