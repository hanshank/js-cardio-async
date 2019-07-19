const url = require('url');
const {
  getHome,
  deleteFile,
  getStatus,
  getPropertyValue,
  removeProperty,
  getFile,
  patchSet,
  postWrite,
  notFound,
} = require('./controller');

const handleRoutes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { method } = req;
  const { pathname, query } = parsedUrl;

  // check if request was a GET to '/
  if (req.url === '/' && method === 'GET') {
    return getHome(req, res);
  }

  if (req.url === '/status' && method === 'GET') {
    return getStatus(req, res);
  }

  if (pathname === '/file/key' && method === 'PATCH') {
    return patchSet(req, res);
  }

  if (pathname === '/file' && method === 'POST') {
    return postWrite(req, res, pathname);
  }

  if (pathname === `/file/key` && method === 'GET') {
    return getPropertyValue(req, res, query);
  }

  if (pathname === `/file/key` && method === 'DELETE') {
    return removeProperty(req, res);
  }

  if (pathname === `/file` && method === 'DELETE') {
    return deleteFile(req, res);
  }

  if (pathname === `/file` && method === 'GET') {
    return getFile(req, res);
  }

  return notFound(req, res);
};

module.exports = handleRoutes;
