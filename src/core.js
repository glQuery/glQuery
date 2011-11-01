var glQuery = (function() {
  // Define a local copy of glQuery
  var glQuery = function(selector, context) {
    return glQuery.fn.init(selector, context);
  },
  // The scene which contains the hierarchy of identifiers
  scene = {},
  // Buckets that hold renderer state
  buckets = {},
  // Logging / information methods
  logInfo = function(msg) { console.log(msg); },
  logWarning = function(msg) { console.log(msg); },
  logError = function(msg) { console.log(msg); },
  // Run-time checks
  assert = function(condition, msg) { if (!condition) logError(msg); },
  assertType = function(param, typeStr, parentFunction, paramStr) {
    if (paramStr != null && parentFunction != null)
      assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else if (parentFunction != null)
      assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
    else if (paramStr != null)
      assert(typeof param === typeStr, "Expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else
      assert(typeof param === typeStr, "Expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
  };

  // glQuery API
  glQuery.fn = glQuery.prototype = {
    init: function(selector, context) {
      logInfo("init");
    },
    scene: function(sceneDef) {
      logInfo("scene");
      if (typeof sceneDef === 'string') {
        // TODO...
      }
    },
    render: function() {
      logInfo("render");
    },
    triangles: function() {
      logInfo("triangles");
    },
    indices: function() {
      logInfo("indices");
    },
    vertices: function() {
      logInfo("vertices");
    },
    material: function() {
      logInfo("material");
    },
    light: function() {
      logInfo("light");
    },
    length: 0,
  };

  glQuery.canvas = function(htmlId) {
    assertType(htmlId, 'string', 'canvas', 'htmlId');
    logInfo("canvas: " + htmlId);
  };

  return glQuery;

})();
