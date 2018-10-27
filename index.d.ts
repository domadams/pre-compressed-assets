declare module 'pre-compressed-assets' {
  import express = require('express');

  function preCompressedAssets(urlRegexp: RegExp, publicPath: string): express.RequestHandler;

  export = preCompressedAssets;
}
