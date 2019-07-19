const fs = require('fs').promises;
const db = require('./db');
const ErrorWithCode = require('./middleware/error-with-code');

/**
 *  A function that listens for data passed with a request and returns it in a promise.
 * @param {object} req http request object
 * @returns {promise} Resolves with parsed body data, or rejects with an error
 */
function getBody(req) {
  return new Promise((resolve, reject) => {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', () => resolve(JSON.parse(data)));
    req.on('error', err => reject(err));
  });
}

/**
 * Gets the content of a db file and sends it back in a http response
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function getFile(req, res) {
  getBody(req, async data => {
    try {
      const { fileName } = data;
      const value = await db.getFile(fileName);
      return res.end(value);
    } catch (err) {
      res.end(err.message);
    }
  });
}

/**
 * Gets a property value from db file and sends it back in a http response
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function getPropertyValue(req, res) {
  getBody(req, async data => {
    try {
      const { fileName, keyName } = data;
      const value = await db.get(fileName, keyName);
      return res.end(value);
    } catch (err) {
      res.end(err.message);
    }
  });
}

/**
 * Deletes a property from db file
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function removeProperty(req, res) {
  // deletes key from object
  getBody(req, async data => {
    try {
      const { fileName, keyName } = data;
      await db.remove(fileName, keyName);
      return res.end('key removed');
    } catch (err) {
      return res.end(err.message);
    }
  });
}

/**
 * Deletes a file from the db
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function deleteFile(req, res) {
  try {
    const body = await getBody(req);
    const { fileName } = body;
    const value = await db.deleteFile(fileName);
    return res.end(value);
  } catch (err) {
    res.writeHead(400);
    res.end(err.message);
  }
}

/**
 * Sends a http response with a 404 error html page
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function notFound(req, res) {
  const html = await fs.readFile('./views/404.html');
  res.writeHead(404);
  return res.end(html);
}

/**
 * Sends a http response with the html homepage
 * @param {object} req http request object
 * @param {object} res http response object
 */
function getHome(req, res) {
  // sets the status code and writes the header
  res.writeHead(200, {
    'My-custom-header': 'This is a great API',
  });
  // sending the response to the client with data
  res.write('Welcome to my Server');
  // sending the response to the client with data
  return res.end('Welcome to the homepage!');
}

/**
 * Sends a http response with the server status
 * @param {object} req http request object
 * @param {object} res http response object
 */
function getStatus(req, res) {
  const status = {
    up: true,
    owner: 'Hans Martin Hanken',
    timestamp: Date.now(),
  };
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  return res.end(JSON.stringify(status));
}

/**
 * Updates the value of an exisiting property in the db, or adds a new one if it doesn't exist all ready
 * @param {object} req http request object
 * @param {object} res http response object
 */
async function patchSet(req, res) {
  try {
    const body = await getBody(req);
    const { fileName, keyName, value } = body;
    await db.set(fileName, keyName, value);
    res.writeHead(200);
    return res.end('File Written');
  } catch (err) {
    if (err.code) res.writeHead(err.code);
    return res.end(err.message);
  }
}

/**
 * Creates a new file with an empty object in the db
 * @param {object} req http request object
 * @param {object} res http response object
 */
const postWrite = async (req, res) => {
  try {
    const { fileName } = await getBody(req);
    if (!fileName) throw new ErrorWithCode('Filename is missing', 400);
    if (!fileName.endsWith('.json')) throw new ErrorWithCode('only files with .json extension allowed', 400);
    await db.createFile(fileName);
    res.writeHead(201);
    res.end(`${fileName} successfully created`);
  } catch (err) {
    res.writeHead(err.code || 400);
    res.end(err.message);
  }
};

module.exports = {
  getHome,
  getStatus,
  getFile,
  deleteFile,
  getPropertyValue,
  patchSet,
  notFound,
  postWrite,
  removeProperty,
};
