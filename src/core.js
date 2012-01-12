  // Define a local copy of glQuery
  var gl = function(selector) {
    return gl.fn.init(selector);
  },
  // The scenes, each of which contains a hierarchy of identifiers
  scenes = {},
  // Commands to be executed
  // TODO: Should commands be associated with a specific scene id?
  commands = [],
  // Commands associated with a tag
  tagCommands = {},
  // Tags for which commands have been dispatched that affect the state hashes
  dirtyTags = [],
  // All shader definitions
  shaders = {},
  // All shader uniform and attribute locations
  shaderLocations = {},
  // Counters for identifiers
  shaderProgramCounter = 0,
  // Logging / information methods
  logDebug = function(msg) { console.log(msg); },
  logInfo = function(msg) { console.log(msg); },
  logWarning = function(msg) { console.warn(msg); },
  logError = function(msg) { console.error(msg); },
  logApiError = function(func,msg) { console.error("In call to '" + func + "', " + msg); },
  // Run-time checks
  // TODO: Should we provide checks that throw exceptions rather than logging messages?
  assert = function(condition, msg) { if (!condition) logError(msg); return condition; },
  assertType = function(param, typeStr, parentFunction, paramStr) {
    if (paramStr != null && parentFunction != null)
      return assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else if (parentFunction != null)
      return assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
    else if (paramStr != null)
      return assert(typeof param === typeStr, "Expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else
      return assert(typeof param === typeStr, "Expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
  },
  assertNumberOfArguments = function(args, minNumber, parentFunction) {
    if (parentFunction != null)
      return assert(args.length >= minNumber, "In call to '" + parentFunction + "', expected at least " + minNumber + " arguments. Instead, got " + args.length + ".");
    else
      return assert(args.length >= minNumber, "Expected at least " + minNumber + " arguments. Instead, got " + args.length + ".");
  },
  assertInternal = assert,
  // The last identifer number that was generated automatically
  lastId = 0,
  // Automatically generate a new object identifier
  generateId = function() { var r = '__glq__' + lastId; ++lastId; return r; },
  // Generate a key-value map for the given nodes and id's for anonymous nodes
  normalizeNodes = function(nodes) {
    if (Array.isArray(nodes)) {
      // Automatically generate a parent id and normalize all child nodes
      var resultNodes = [];
      resultNodes.hashes = {};
      resultNodes.lastUpdate = 0;
      for (var i = 0; i < nodes.length; ++i) {
        var resultNode = normalizeNodes(nodes[i])
        if (Array.isArray(nodes)) {
          // Don't nest arrays, generate a new id for the node instead
          var obj = {};
          obj[generateId()] = resultNodes;
          resultNodes.push(obj);
        }
        if (resultNode != null)
          resultNodes.push(resultNode);
        else
          // TODO: In call to either scene or insert....
          logApiError('scene', "could not normalize the node with type '" + (typeof nodes[i]) + "'.");
      }
      return resultNodes;
    }
    switch (typeof nodes) {
      case 'string':
        // Make sure tags have a commands stack associated (so that hashes do not need to be rebuilt when non-hashed commands are added to empty tags)
        var tags = nodes.split(' ');
        for (var i = 0; i < tags.length; ++i)
          if (typeof tagCommands[tags[i]] === 'undefined')
            tagCommands[tags[i]] = new Array(commandEval.length);
        return nodes;
      case 'number':
        var str = String(nodes);
        // Make sure tags have a commands stack associated (so that hashes do not need to be rebuilt when non-hashed commands are added to empty tags)
        if (typeof tagCommands[str] === 'undefined')
          tagCommands[str] = new Array(commandEval.length);
        return str;
      case 'object':
        var result = {};
        // TODO: normalize key-value pairs
        for (var key in nodes) {
          if (key === 'prototype') {
            logError("The given nodes contain a 'prototype' object. ");
            continue;
          }
          normalizeNodes(key);
          var node = normalizeNodes(nodes[key]);
          if (Array.isArray(node))
            result[key] = node;
          else {
            var n = (node != null? [node] : []);
            n.hashes = {};
            n.lastUpdate = 0;
            result[key] = n;
          }
        }
        return result;
    }
  };

  // Cross-browser initialization
  gl.requestAnimationFrame = (function(){
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(callback, element){ window.setTimeout(callback, 1000 / 60); };
  })();

  gl.cancelRequestAnimationFrame = (function(){
    return window.cancelRequestAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || window.clearTimeout;
  })();

  var webglTypeSize = [
    1, // BYTE
    1, // UNSIGNED_BYTE
    2, // SHORT
    2, // UNSIGNED_SHORT
    4, // INT
    4, // UNSIGNED_INT
    4  // FLOAT
  ];

