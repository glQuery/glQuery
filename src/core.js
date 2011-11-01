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
  logDebug = function(msg) { console.log(msg); },
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
      logDebug("init");
    },
    scene: function(sceneDef) {
      logDebug("scene");
      if (typeof sceneDef === 'string') {
        // TODO...
      }
    },
    render: function() {
      logDebug("render");
    },
    triangles: function() {
      logDebug("triangles");
    },
    indices: function() {
      logDebug("indices");
    },
    vertices: function() {
      logDebug("vertices");
    },
    material: function() {
      logInfo("material");
    },
    light: function() {
      logDebug("light");
    },
    length: 0,
  };

  glQuery.canvas = function(htmlId) {
    logDebug("canvas");
    assertType(htmlId, 'string', 'canvas', 'htmlId');
    logInfo("Initialized canvas: " + htmlId);
  };

  return glQuery;

})();
