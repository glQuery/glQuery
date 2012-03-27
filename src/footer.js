  // Export glQuery to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.glQuery = gl;
  return gl;
})();

