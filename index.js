'use strict';

var mime = require('mime');

module.exports = function preCompressAssets(urlRegexp) {

    return function compress(request, response, next) {

        //Check if we need to do something
        var acceptEncoding = request.headers['accept-encoding'] || '';
        if(
            !urlRegexp.test(request.url) //Request url matches given regexp?
            || (request.method !== 'GET' && request.method !== 'HEAD') //GET/HEAD request?
        ) {
            return next();
        }

        //Get the original mime type and default character set
        var contentType = mime.lookup(request.url);
        var characterSet = mime.charsets.lookup(contentType);

        //Set the content type and default character set according to the original file
        response.setHeader('Content-Type', contentType + '; charset=' + characterSet);

        if(acceptEncoding.indexOf('br') > -1) {
            //Change url based on encoding type.
            request.url = request.url + ".br";
            //Content encoding
            response.setHeader('Content-Encoding', 'br');
        } else if(acceptEncoding.indexOf('gzip') > -1){
            //Change url based on encoding type.
            request.url = request.url + ".gz";
            //Content encoding
            response.setHeader('Content-Encoding', 'gzip');
        }

        //Vary
        var vary = response.getHeader('Vary');
        if (!vary) {
            response.setHeader('Vary', 'Accept-Encoding');
        } else if (!~vary.indexOf('Accept-Encoding')) {
            response.setHeader('Vary', vary + ', Accept-Encoding');
        }
        return next();
    };
};