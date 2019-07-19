const fs = require(`fs`).promises;
const path = `./db/`;
const CustomError = require('./middleware/custom-error.js');
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

/**
 * Resets the database (does not touch added files)
 */
function reset() {
  const andrew = fs.writeFile(
    `./andrew.json`,
    JSON.stringify({
      firstname: `Andrew`,
      lastname: `Maney`,
      email: `amaney@talentpath.com`,
    })
  );
  const scott = fs.writeFile(
    `./scott.json`,
    JSON.stringify({
      firstname: `Scott`,
      lastname: `Roberts`,
      email: `sroberts@talentpath.com`,
      username: `scoot`,
    })
  );
  const post = fs.writeFile(
    `./post.json`,
    JSON.stringify({
      title: `Async/Await lesson`,
      description: `How to write asynchronous JavaScript`,
      date: `July 15, 2019`,
    })
  );
  const logPromise = fs.writeFile(`./log.txt`, ``);
  return Promise.all([andrew, scott, post, logPromise]);
}

/**
 * Logs actions to the log.txt and throws err if passed
 * @param {string} value
 * @param {Error} [err]
 */
async function log(value, err, errorCode) {
  await fs.appendFile(`log.txt`, `${err ? 'ERROR' : 'SUCCESS'} - ${value} ${Date.now()}\n`);
  // pass along (throw) the error if it exists
  if (err) throw new CustomError(err.message, errorCode);
  // If not throwing an error, return the value
  return value;
}

/**
 * Logs the value of object[key]
 * @param {string} file
 * @param {string} key
 */
async function get(file, key) {
  console.log('getting... value...');
  /* Async/await approach */
  try {
    // 1. read file
    // 2. handle promise -> data
    const data = await fs.readFile(path + file, `utf8`);
    // 3. parse data from string -> JSON
    const parsed = JSON.parse(data);
    // 4. use the key to get the value at object[key]
    const value = parsed[key];
    // 5. append the log file with the above value
    if (!value) return log(`ERROR ${key} invalid key on ${file}`);
    return log(value);
  } catch (err) {
    log(`no such file or directory ${file}`);
    throw err;
  }
  /* Promise-based approach
  return fs
    .readFile(file, 'utf8')
    .then(data => {
      const parsed = JSON.parse(data);
      const value = parsed[key];
      if (!value) return log(`ERROR ${key} invalid key on ${file}`);
      return log(value);
    })
    .catch(err => log(`ERROR no such file or directory ${file}`));
    */
}

/**
 * Gets the content of a file and returns it
 * @param {string} fileName
 * @returns {object} content of file
 */
async function getFile(fileName) {
  try {
    const fileContent = await fs.readFile(path + fileName);
    return log(fileContent);
  } catch (err) {
    return log('Something went wrong', err);
  }
}

/**
 * Sets the value of object[key] and rewrites object to file
 * @param {string} file
 * @param {string} key
 * @param {string} value
 */
async function set(file, key, value) {
  /* Promise
  return (
    fs
      // reads
      .readFile(file, 'utf8')
      .then(data => {
        // parse
        const parsed = JSON.parse(data);
        // adds property the converts back to JSON format
        parsed[key] = value;
        const newObj = JSON.stringify(parsed);
        return fs.writeFile(file, newObj);
      })
      .then(() => log(`${key}: ${value} set in ${file}`))
      .catch(err => log(`ERROR no such file or directory ${file}`))
  );
  */
  /* Async/await */
  try {
    console.log(file, key, value);
    // read file
    const data = await fs.readFile(path + file, `utf8`);
    // handle promise data
    const parsed = JSON.parse(data);
    parsed[key] = value;
    // return object to JSON string.
    const newObj = JSON.stringify(parsed);
    await fs.writeFile(path + file, newObj);
    return log(`${key}: ${value} set in ${file}`);
  } catch (err) {
    return log(`No such file or directory ${file}`, err, 404);
  }
}

/**
 * Deletes key from object and rewrites object to file
 * @param {string} file
 * @param {string} key
 */
async function remove(file, key) {
  try {
    // 1. Read File
    // 2. Handle Promise → Data
    const data = await fs.readFile(path + file, `utf-8`);
    // 3. Parse data from string → JSON
    const parsed = JSON.parse(data);
    // 4. Delete key
    delete parsed[key];
    // 5. Write file with new value
    await fs.writeFile(path + file, JSON.stringify(parsed), `utf-8`);
    return log(`${key} deleted from ${file}`);
  } catch (err) {
    return log(`ERROR no such file or directory ${file}`);
  }
}

/**
 * Deletes file.
 * Gracefully errors if the file does not exist.
 * @param {string} file
 */
async function deleteFile(file) {
  /*
  // check if it exists
  // delete file
  return fs
    .access(file)
    .then(() => fs.unlink(file))
    .then(() => log(`${file} succesfully deleted`))
    .catch(() => log(`ERROR ${file} does not exist`));
    */
  try {
    await fs.unlink(path + file);
    return log(`${file} succesfully deleted`);
  } catch (err) {
    return log(`ERROR ${file} does not exist`);
  }
}

/**
 * Promise constructor.
 * Resolves if no access, rejects if access.
 * @param {string} file file to test access
 */

const noAccess = file =>
  new Promise((resolve, reject) =>
    fs
      .access(path + file)
      .then(() => reject(new Error(`${file} all ready exists`)))
      .catch(resolve)
  );

/**
 * Creates file with an content inside.
 * Gracefully errors if the file already exists.
 * @param {string} file JSON filename
 */

async function createFile(file, content) {
  try {
    await noAccess(file);
    await fs.writeFile(path + file, `{}`);
    return log(`${file}: created`);
  } catch (err) {
    await log(err.message, err, 409);
    throw err;
  }
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
async function mergeData() {
  try {
    const files = await fs.readdir(`.`);
    const filteredFiles = files.filter(file => file.includes(`.json`) && !file.includes(`package`));
    const promises = filteredFiles.map(file => fs.readFile(path + file));
    const datas = await Promise.all(promises);
    const merged = datas.reduce(
      (accum, data, i) => ({
        ...accum,
        [filteredFiles[i].split(`.`)[0]]: JSON.parse(data),
      }),
      {}
    );
    await fs.writeFile(`merge.json`, JSON.stringify(merged));
    return log(`Merged successfully`);
  } catch (err) {
    return log(`ERROR merged unsuccessfully ${err}`);
  }
  /* Another async/await solution
  try {
    const megaObj = {};
    const files = await fs.readdir('.');
    const filteredFiles = files.filter(
      file => file.includes('.json') && !file.includes('package')
    );
    for await (const file of filteredFiles) {
      const trimmedFileName = file.slice(0, file.indexOf('.'));
      megaObj[trimmedFileName] = JSON.parse(await fs.readFile(file, 'utf8'));
    }
    return log(JSON.stringify(megaObj));
  } catch (err) {
    return log(`ERROR ${err}`);
  }
  */

  /* Promie solution
  return fs
    .readdir('./')
    .then(files => {
      const jsonFiles = files.filter(
        file =>
          file.includes('.json') &&
          file !== 'package.json' &&
          file !== 'package-lock.json'
      );
      return [jsonFiles.map(file => fs.readFile(file, 'utf8')), jsonFiles];
    })
    .then(async resultsArr => [await Promise.all(resultsArr[0]), resultsArr[1]])
    .then(dataArr => {
      const mergedData = {};
      const fileData = dataArr[0];
      const filenames = dataArr[1];
      fileData.forEach((field, i) => {
        const filename = filenames[i].slice(0, filenames[i].indexOf('.'));
        mergedData[filename] = JSON.parse(field);
        // mergedData = { ...mergedData, ...JSON.parse(field) };
      });
      return mergedData;
    })
    .then(data => fs.writeFile('mergedData.json', JSON.stringify(data)))
    .then(() => log('Succesfully merged'))
    .catch(() => log(`ERROR: Files were not merged successfully`));
    */
}

/**
 * Takes two files and logs all the properties as a list without duplicates
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *  union('scott.json', 'andrew.json')
 *  // ['firstname', 'lastname', 'email', 'username']
 */
function union(fileA, fileB) {}

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
  getFile,
  set,
  remove,
  deleteFile,
  createFile,
  mergeData,
  union,
  intersect,
  difference,
  reset,
};
