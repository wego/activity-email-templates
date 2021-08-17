const gulp = require('gulp'),
  mjml = require('gulp-mjml'),
  jr = require('@yodasws/gulp-json-replace'),
  fs = require("fs"),
  del = require('del'),
  replace = require('gulp-replace');
  
// const langList = ['en', 'ar', 'de', 'fa', 'fr', 'hi', 'id', 'ms', 'ru', 'vi', 'zh-cn', 'zh-hk'];

//Get files name from repo
const langPath = fs.readdirSync('json');

// Remove the html folder
gulp.task('clean', async function(){
  return await del.sync('html', {force:true});
});

// Convert MJML to HTML
gulp.task('mjmlToHTML', async function(){
  langPath.map(async function (langItem) {
    const lang = langItem.split('.').slice(0, -1).join('.')
    return await gulp.src('mjml/*.mjml')
      .pipe(mjml())
      .pipe(gulp.dest('./html/' + lang))
  });
});

// Get JSON files
gulp.task('stringReplace', async function(){
  setTimeout(() => {
    langPath.map(async function (langItem) {
      const lang = langItem.split('.').slice(0, -1).join('.');

      let dir = lang == 'ar' || lang == 'fa' ? 'rtl;': 'ltr;';
      let alg = lang == 'ar' || lang == 'fa' ? 'right;': 'left;';
      return await gulp.src(`./html/${lang}/**/*.html`)
        // Replace the string from html based on language 
        .pipe(replace('ltr;', dir))
        .pipe(replace('left;', alg))
        // Replace the HTML string based on json data
        .pipe(jr({ src: `./json/${lang}.json`, identify: '%%'})).pipe(gulp.dest(`./build/${lang}`))
    });
  }, 2000);
});

// Compile all data
const compile = gulp.parallel(['clean', 'mjmlToHTML','stringReplace']);
gulp.task('default', compile);

// https://docs.google.com/spreadsheets/d/18Te5QUl3oSEBcvJDBQK7PsCrNrXprPX_FfzTv5CQ5Jw/edit#gid=1383661424