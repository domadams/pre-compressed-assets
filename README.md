pre-compressed-assets
=======================

Middleware for using pre-compressed gzip or brotli files based on regex url pattern for Node.js

Scans the public folder and Serves compressed files for the given regexp url pattern. If the url requested matches the regular expression and the client accepts gzip encoding the the url is appended with ".gz" or ".br" and the necessary headers are added.

Dynamic compression hurts performance of the server.

This solution can be used with any static server as long as this middleware is added before the express.static path. This means it can be used with express static https://www.npmjs.org/package/express.

You can still add dynamic compression for files that you don't have a static version for, just add the dynamic compression middleware layer after this one (ex. app.use(compression()))

## Installation
	  $ npm install pre-compressed-assets --save
	  
## Usage ES5
```javascript
preCompressedAssets =  require('pre-compressed-assets');
compression = require('compression');

//Add the middleware express way:
app.use(preCompressedAssets(/\.(html|js|css)$/, path.join(__dirname, 'public')));

//Add dynamic compression if you don't handle all files static
app.use(compression());

//Add a static web handler you prefer
app.use(express.static('path'));
```

## Usage ES6

```javascript
import preCompressedAssets from 'pre-compressed-assets';
import compression from 'compression';

//Add the middleware express way:
app.use(preCompressedAssets(/\.(html|js|css)$/, path.join(__dirname, 'public')));

//Add dynamic compression if you don't handle all files static
app.use(compression());

//Add a static web handler you prefer
app.use(express.static('path'));
```

# License
MIT
