const gulp = require('gulp');
const nls = require('vscode-nls-dev');
const del = require('del');

const vscodeLanguages = ['zh-CN', 'en']; // languages an extension has to be translated to

const transifexApiHostname = 'www.transifex.com';
const transifexApiName = 'api';
const transifexApiToken = process.env.TOKEN; // token to talk to Transifex (to obtain it see https://docs.transifex.com/api/introduction#authentication)
const transifexProjectName = 'vscode-favorites'; // your project name in Transifex
const transifexExtensionName = 'favorites'; // your resource name in Transifex


gulp.task('clean', function(cb) {
    return del(['i18n', 'favorites-localization'], cb);;
});

gulp.task('transifex-push', ['clean'], function() {
    return gulp.src('**/*.nls.json')
        .pipe(nls.prepareXlfFiles(transifexProjectName, transifexExtensionName))
        .pipe(nls.pushXlfFiles(transifexApiHostname, transifexApiName, transifexApiToken));
});

gulp.task('transifex-pull', ['transifex-push'], function() {
    return nls.pullXlfFiles(transifexApiHostname, transifexApiName, transifexApiToken, vscodeLanguages, [{
        name: transifexExtensionName,
        project: transifexProjectName
    }])
        .pipe(gulp.dest(`./${transifexExtensionName}-localization`));
});

gulp.task('i18n-import', ['transifex-pull'], function() {
    return gulp.src(`./${transifexExtensionName}-localization/**/*.xlf`)
        .pipe(nls.prepareJsonFiles())
        .pipe(gulp.dest('./i18n'));
});

gulp.task('default', ['i18n-import']);
