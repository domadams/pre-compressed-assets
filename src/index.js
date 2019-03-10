var mime = require('mime-types');
var fs = require('fs');
var path = require('path');

var preCompressedFiles = {};
var extensionRegex = /(\.(br|gz))$/;

function addDir(prefix,dir,fileRegex) {
  const files = fs.readdirSync(path.join(prefix,dir));
  files.forEach(function(filename) {
    const file = path.join(prefix,dir,filename);
    const url = path.join(dir,filename);
    if (fs.statSync(file).isDirectory()) {
      addDir(prefix,path.join(dir,filename),fileRegex);
    } else if (fileRegex.test(url)) {
      preCompressedFiles['/' + url] = true;
    }
  });
}

module.exports = function preCompressAssets(urlRegexp, publicPath) {
  var fileRegex = new RegExp(urlRegexp.source + extensionRegex.source);
  addDir(publicPath,'',fileRegex);

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
    response.setHeader('Content-Type', contentType + '; charset=' + characterSet);

    if (acceptEncoding.indexOf('br') > -1 && preCompressedFiles[request.url + '.br']) {
      request.url = request.url + '.br';
      response.setHeader('Content-Encoding','br');
    } else if(acceptEncoding.indexOf('gzip') > -1 && preCompressedFiles[request.url + '.gz']) {
      request.url = request.url + '.gz';
      response.setHeader('Content-Encoding','gzip');
    }

    var vary = response.getHeader('Vary');
    if (!vary) {
      response.setHeader('Vary', 'Accept-Encoding');
    } else if (!~vary.indexOf('Accept-Encoding')) {
      response.setHeader('Vary', vary + ', Accept-Encoding');
    }
    return next();
  };
};
