var mime = require('mime-types');
var fs = ('fs');

var preCompressedFiles = [];
var extensionRegex = /(\.(br|gz))$/;

module.exports = function preCompressAssets(urlRegexp, publicPath) {
  var fileRegex = new RegExp(urlRegexp.source + extensionRegex.source);
  fs.readdir(publicPath, function(err, files){
    files.forEach(function(file) {
      if (fileRegex.test(file)) {
        preCompressedFiles.push(`/${file}`);
      }
    });
  });

  return function compress(request, response, next) {
    // Check if we need to do something
    var acceptEncoding = request.headers['accept-encoding'] || '';
    if (
      !urlRegexp.test(request.url)
      || (request.method !== 'GET' && request.method !== 'HEAD')
    ) {
      return next();
    }

    // Get the original mime type and default character set
    var contentType = mime.lookup(request.url);
    var characterSet = mime.charset(contentType);

    // Set the content type and default character set according to the original file
    response.setHeader('Content-Type', `${contentType}; charset=${characterSet}`);

    if (acceptEncoding.indexOf('br') > -1 && preCompressedFiles.indexOf(`${request.url}.br`) > -1) {
      request.url = `${request.url}.br`;
      response.setHeader('Content-Encoding', 'br');
    } else if(acceptEncoding.indexOf('gzip') > -1 && preCompressedFiles.indexOf(`${request.url}.gz`) > -1) {
      request.url = `${request.url}.gz`;
      response.setHeader('Content-Encoding', 'gzip');
    }

    var vary = response.getHeader('Vary');
    if (!vary) {
      response.setHeader('Vary', 'Accept-Encoding');
    } else if (!~vary.indexOf('Accept-Encoding')) {
      response.setHeader('Vary', `${vary}, Accept-Encoding`);
    }
    return next();
  };
};