var express = require('express');
var mime = require('mime-types');
var glob = require('glob');

var preCompressedFiles = [];
var extensionRegex = /(\.(br|gz))$/;

module.exports = function preCompressAssets(urlRegexp, publicPath) {
  var fileRegex = new RegExp(urlRegexp.source + extensionRegex.source);
  var indexRegex = new RegExp('index.html' + extensionRegex.source);

  glob(publicPath + '/**/*', function (err, filePaths) {
    filePaths.forEach(function(filePath) {
      if (fileRegex.test(filePath)) {
        var reducedFilePath = filePath.replace(publicPath, '');
        preCompressedFiles.push(reducedFilePath);

        // Add additional entry for `/` if contains compressed index.html
        var index = indexRegex.exec(reducedFilePath);
        if (index) {
          preCompressedFiles.push(
            reducedFilePath.replace(indexRegex, '') + index[1]
          );
        }
      }
    });
  });

  return function compress(request, response, next) {
    // Check if we need to do something
    var acceptEncoding = request.headers['accept-encoding'] || '';
    if (
      (request.url.slice(-1) !== '/' && !urlRegexp.test(request.url))
      || (request.method !== 'GET' && request.method !== 'HEAD')
    ) {
      return next();
    }

    // Remove and store trailing query string
    var queryIndex = request.url.lastIndexOf('?');
    var slashIndex = request.url.lastIndexOf('/');
    var query = '';
    if (queryIndex > -1 && slashIndex < queryIndex) {
      query = request.url.slice(
        queryIndex,
        request.url.length
      );
      request.url = request.url.slice(0, queryIndex);
    }

    // Get the original mime type and default character set
    var contentType = mime.lookup(request.url === '/' ? 'index.html' : request.url);
    var characterSet = mime.charset(contentType);

    // Set the content type and default character set according to the original file
    response.setHeader('Content-Type', contentType + '; charset=' + characterSet);

    if (acceptEncoding.indexOf('br') > -1 && preCompressedFiles.indexOf(request.url + '.br') > -1) {
      request.url = (request.url === '/' ? 'index.html' : request.url) + '.br' + query;
      response.setHeader('Content-Encoding', 'br');
    } else if(acceptEncoding.indexOf('gzip') > -1 && preCompressedFiles.indexOf(request.url + '.gz') > -1) {
      request.url = (request.url === '/' ? 'index.html' : request.url) + '.gz' + query;
      response.setHeader('Content-Encoding', 'gzip');
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