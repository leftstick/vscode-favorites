const gulp = require('gulp');
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');
const nls = require('vscode-nls-dev');
const del = require('del');

const vscodeLanguages = ['zh-cn', 'zh-tw']; // languages an extension has to be translated to

const transifexApiHostname = 'www.transifex.com';
const transifexApiName = 'api';
const transifexApiToken = process.env.TOKEN; // token to talk to Transifex (to obtain it see https://docs.transifex.com/api/introduction#authentication)
const transifexProjectName = 'vscode-favorites'; // your project name in Transifex
const transifexExtensionName = 'favorites'; // your resource name in Transifex


const iso639_3_to_2 = {chs: 'zh-cn', cht: 'zh-tw'};

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

gulp.task('prepare-package-nls-json', ['i18n-import'], function() {
    return new Promise(function(res) {
        fs.readdir('./i18n/', function(err, languages) {
            Promise
                .all(languages.map(language => {
                    return new Promise(resolve => {
                        gulp
                            .src(path.join('./i18n/', language, 'package.i18n.json'))
                            .pipe(rename(`package.nls.${iso639_3_to_2[language]}.json`))
                            .pipe(gulp.dest('.'))
                            .on('end', resolve);
                    });
                }))
                .then(res);
        })
    });
});

gulp.task('default', ['prepare-package-nls-json']);
