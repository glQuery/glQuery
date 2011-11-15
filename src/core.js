  // Define a local copy of glQuery
  var gl = function(selector) {
    return gl.fn.init(selector);
  },
  // The scenes, each of which contains a hierarchy of identifiers
  scenes = {},
  // All shader definitions
  shaders = {},
  // Buckets that hold renderer state
  buckets = {},
  // Logging / information methods
  logDebug = function(msg) { console.log(msg); },
  logInfo = function(msg) { console.log(msg); },
  logWarning = function(msg) { console.log(msg); },
  logError = function(msg) { console.log(msg); },
  // Run-time checks
  // TODO: Should we provide checks that throw exceptions rather than logging messages?
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
  },
  // The last identifer number that was generated automatically
  lastId = 0,
  // Automatically generate a new object identifier
  generateId = function() { var r = '__glq__' + lastId; ++lastId; return r; },
  // Generate a key-value map for the given nodes and id's for anonymous nodes
  normalizeNodes = function(nodes) {
    if (Array.isArray(nodes)) {
      // Automatically generate a parent id and normalize all child nodes
      for (var i = 0; i < nodes.length; ++i)
        nodes[i] = normalizeNodes(nodes[i]);
      var r = {};
      r[generateId()] = nodes;
      return r;
    }
    // TODO: normalize key-value pairs
    var r = {};
    for (var key in nodes) {
      var val = nodes[key];
      if (key === 'prototype') {
        logError("The given nodes contain a 'prototype' object. ");
        continue;
      } 
      switch (typeof val) {
        case 'string': 
          r[key] = val;
          break;
        case 'object':
          r[key] = val;
          break;
        default:
          
      }
    }
    return r;
  };

  // Cross-browser initialization
  window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(callback, element){ window.setTimeout(callback, 1000 / 60); };
  })();

  window.cancelRequestAnimationFrame = (function(){
    return window.cancelRequestAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || window.clearTimeout;
  })();
