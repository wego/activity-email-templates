const gulp = require('gulp'),
  mjml = require('gulp-mjml'),
  jr = require('@yodasws/gulp-json-replace'),
  fs = require("fs"),
  del = require('del'),
  replace = require('gulp-replace');

const { GoogleSpreadsheet } = require('google-spreadsheet');
const serviceAccount = require('./email-templates-324214-d1dd74707b42.json');
let langPath;


// Get Data from spread sheet and store in json ripo as json file
const getSheetData = async () => {

  // Check whether json ripo is available or not
  const dir = './json';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  try {
    const doc = new GoogleSpreadsheet('1PNbiZhhLGex3ABCFQt-B3C4uGeTBGvXjHO3p2WMlMUA')
    doc.useServiceAccountAuth(serviceAccount)

    await doc.loadInfo();
    const sheetCount = doc.sheetCount;

    if (sheetCount > 0) {
      for (let sC = 0; sC < sheetCount; sC++) {
        const sheet = doc.sheetsByIndex[sC];
        const rows = await sheet.getRows();
        const allData = rows.map(a => a._rawData);

        var tempData = {};
        allData.map(async function (str) {
          tempData[str[0]] = str[1];
        });

        // Store as json file
        fs.writeFileSync('json/' + sheet.title + '.json', JSON.stringify(tempData));
      }
    }

  } catch (error) {
    console.error(error)
    return null
  }
}

// Run task to get sheet data
gulp.task('getSheetData', async () => {
  await getSheetData();
  //Get files name from repo
  langPath = await fs.readdirSync('json');
  console.log(langPath)
});

// Remove the html folder
gulp.task('clean', async function () {
  return await del.sync('html', { force: true });
});

// Convert MJML to HTML
gulp.task('mjmlToHTML', async function () {
  langPath.map(async function (langItem) {
    const lang = langItem.split('.').slice(0, -1).join('.')
    console.log('lang', lang)
    return await gulp.src('mjml/*.mjml')
      .pipe(mjml())
      .pipe(gulp.dest('./html/' + lang))
  });
});

// Get JSON files
gulp.task('stringReplace', async function () {
  setTimeout(() => {
    langPath.map(async function (langItem) {
      const lang = await langItem.split('.').slice(0, -1).join('.');

      let dir = lang == 'ar' || lang == 'fa' ? 'rtl;' : 'ltr;';
      let alg = lang == 'ar' || lang == 'fa' ? 'right;' : 'left;';
      return await gulp.src(`./html/${lang}/**/*.html`)
        // Replace the string from html based on language 
        .pipe(replace('ltr;', dir))
        .pipe(replace('left;', alg))
        // Replace the HTML string based on json data
        .pipe(jr({ src: `./json/${langItem}`, identify: '%%' })).pipe(gulp.dest(`./build/${lang}`))
    });
  }, 2000);
});

// // Compile all data
gulp.task('default', gulp.series('getSheetData', 'clean', 'mjmlToHTML', 'stringReplace'))

// https://docs.google.com/spreadsheets/d/18Te5QUl3oSEBcvJDBQK7PsCrNrXprPX_FfzTv5CQ5Jw/edit#gid=1383661424