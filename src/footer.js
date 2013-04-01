  // Export glQuery to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.gl = exports.glQuery = gl;
  return gl;
})();
var gl = typeof gl === 'undefined'? glQuery : gl;

