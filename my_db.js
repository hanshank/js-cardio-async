const fs = require('fs').promises;
/*
All of your functions must return a promise!
*/

/* 
Every function should be logged with a timestamp.
If the function logs data, then put that data into the log
ex after running get('user.json', 'email'):
  sroberts@talentpath.com 1563221866619

If the function just completes an operation, then mention that
ex after running delete('user.json'):
  user.json succesfully delete 1563221866619

Errors should also be logged (preferably in a human-readable format)
*/

function log(value, err = false) {
  return fs.appendFile('./log.txt', `${err ? 'ERROR' : 'SUCCESS'} - ${value} ${Date.now()}\n`);
}

/**
 * Logs the value of object[key]
 * @param {string} file
 * @param {string} key
 */
// get "scott.json" "email"
async function get(file, key) {
  try {
    const data = await fs.readFile(`./${file}`);
    const parsed = JSON.parse(data);
    const value = parsed[key];
    if (!value) return log(`ERROR key invalid on ${file}`);
    return log(value);
  } catch (err) {
    return log(`ERROR no such file or directory ${file}`);
  }

  /*
  return fs
    .readFile(`./${file}`)
    .then(data => {
      const parsed = JSON.parse(data);
      const value = parsed[key];
      if (!value) {
        return log(`ERROR key invalid on ${file}`);
      }
      return log(value);
    })
    .catch(err => log(`ERROR no such file or directory ${file}`));
  */
}

/**
 * Sets the value of object[key] and rewrites object to file
 * @param {string} file
 * @param {string} key
 * @param {string} value
 */
// set "scott.json" "email" "hans@hanken.org"
async function set(file, key, value) {
  // try {
  //   // console.log(file + key + value);
  //   const object = await fs.readFile(`./${file}`);
  //   const parsed = JSON.parse(object);
  //   parsed[key] = value;
  //   console.log(parsed);
  //   return fs.writeFile(`./${file}`, JSON.stringify(parsed));
  // } catch (err) {
  //   if (err) {
  //     console.log(err);
  //   }
  // }
  return fs
    .readFile(`./${file}`)
    .then(object => {
      const parsed = JSON.parse(object);
      parsed[key] = value;
      fs.writeFile(`./${file}`, JSON.stringify(parsed));
    })
    .then(() => log(`${file} - ${key} was updated to ${value}`))
    .catch(() => log(`${file} - ${key} could not be updated to ${value}`, true));
}

/**
 * Deletes key from object and rewrites object to file
 * @param {string} file
 * @param {string} key
 */
function remove(file, key) {
  return fs
    .readFile(`./${file}`)
    .then(object => {
      const parsed = JSON.parse(object);
      delete parsed[key];
      return fs.writeFile(`./${file}`, JSON.stringify(parsed));
    })
    .then(() => log(`the key ${key} was removed from ${file}`))
    .catch(() => log(`the key ${key} could not be removed from ${file}`, true));
}

/**
 * Deletes file.
 * Gracefully errors if the file does not exist.
 * @param {string} file
 */
function deleteFile(file) {
  return fs
    .unlink(`./${file}`)
    .then(() => log(`SUCCESS ${file} was removed`))
    .catch(err => log(`${file} could not be deleted`, true));
}

/**
 * Creates file with an empty object inside.
 * Gracefully errors if the file already exists.
 * @param {string} file JSON filename
 */
async function createFile(file) {
  // const fileExists = new Promise(resolve, reject) {
  //   fs.access("file", (err) => {
  //     if (err) resolve();
  //     else reject();
  //   });
  // }
  // fileExists.then(() => log(`ERROR ${file} all ready exists`)).catch(() => fs.writeFile(`./${file}`, JSON.stringify({})).then(() => log(`SUCCESS ${file} was created`)));
}

/**
 * Merges all data into a mega object and logs it.
 * Each object key should be the filename (without the .json) and the value should be the contents
 * ex:
 *  {
 *  user: {
 *      "firstname": "Scott",
 *      "lastname": "Roberts",
 *      "email": "sroberts@talentpath.com",
 *      "username": "scoot"
 *    },
 *  post: {
 *      "title": "Async/Await lesson",
 *      "description": "How to write asynchronous JavaScript",
 *      "date": "July 15, 2019"
 *    }
 * }
 */
function mergeData() {
  return fs
    .readdir('./')
    .then(folder => {
      const jsonFiles = folder.filter(file => file.includes('json') && !file.includes('package'));
      Promise.all([
        jsonFiles.map(fileName =>
          fs
            .readFile(`./${fileName}`)
            .then(res => ({ [fileName]: JSON.parse(res) }))
            .catch(err => log(err))
        ),
        jsonFiles,
      ]);
    })
    .then(data => data.reduce((acc, current) => Object.assign(acc, current), {}))
    .then(object => log(JSON.stringify(object)))
    .catch(err => log(err));
}

/**
 * Takes two files and logs all the properties as a list without duplicates
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *  union('scott.json', 'andrew.json')
 *  // ['firstname', 'lastname', 'email', 'username']
 */
async function union(fileA, fileB) {
  const array = [];
  const a = await fs.readFile(fileA);
  const b = await fs.readFile(fileB);
  array.push(JSON.parse(a));
  array.push(JSON.parse(b));
  return log(array.reduce((acc, curr) => Object.assign(acc + curr), {}));
}

/**
 * Takes two files and logs all the properties that both objects share
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    intersect('scott.json', 'andrew.json')
 *    // ['firstname', 'lastname', 'email']
 */
function intersect(fileA, fileB) {}

/**
 * Takes two files and logs all properties that are different between the two objects
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    difference('scott.json', 'andrew.json')
 *    // ['username']
 */
function difference(fileA, fileB) {}

module.exports = {
  get,
  set,
  remove,
  deleteFile,
  createFile,
  mergeData,
  union,
  intersect,
  difference,
};
