/*
 * glQuery
 * Originaly copyright glQuery authors 2011, but is released into the public domain.
 * (Also available under an MIT license and a GPL v2.0 license)
 */
"use strict";
var glQuery = (function() {

  // Define a local copy of glQuery
  var glQuery = function(selector) {
    return glQuery.fn.init(selector);
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

  var command = {
    insert: 0,
    remove: 1,
    triangles: 2,
    indices: 3,
    vertices: 4,
    material: 5,
    light: 6
  },
  commandDispatch = [
    // insert: 0
    function() {
    },
    // remove: 1
    function() {
    },
    // triangles: 2
    function() {
    },
    // indices: 3
    function() {
    },
    // vertices: 4
    function() {
    },
    // material: 5
    function() {
    },
    // light: 6
    function() {
    },
  ];
  

  // glQuery API
  glQuery.fn = glQuery.prototype = {
    init: function(selector) {
      //logDebug("init");
      this._selector = selector;
      return this;
    },
    render: function(context) {
      //logDebug("render");
      assertType(context, 'object', 'render', 'context');
      return this;
    },
    triangles: function() {
      logDebug("triangles");
      return this;
    },
    indices: function() {
      logDebug("indices");
      return this;
    },
    vertices: function() {
      logDebug("vertices");
      return this;
    },
    material: function() {
      logDebug("material");
      return this;
    },
    light: function() {
      logDebug("light");
      return this;
    },
    length: 0
  };

  // Initialize a webgl canvas
  glQuery.canvas = function(htmlCanvas, contextAttr, width, height) {
    var canvasId, canvasEl;
    logDebug("canvas");
    if (typeof htmlCanvas === 'undefined') {
      // Create canvas element
      canvasId = 'glqueryCanvas';
      document.write("<canvas id='" + canvasId + "' width='" + (width != null? width : 800) + "' height='" + (height != null? height : 800) + "'></canvas>");
      canvasEl = document.getElementById(canvasId);
    }
    else {
      // Get existing canvas element
      assert(typeof htmlCanvas === 'string' || (typeof htmlCanvas === 'object' && htmlCanvas.nodeName !== 'CANVAS'), "In call to 'canvas', expected type 'string', 'undefined' or 'canvas element' for 'htmlCanvas'. Instead, got type '" + typeof htmlCanvas + "'.");
      canvasId = typeof htmlCanvas === 'string'? htmlCanvas : htmlCanvas.id;
      canvasEl = typeof htmlCanvas === 'object'? htmlCanvas : document.getElementById(canvasId);
    }
    assert(canvasEl != null && typeof canvasEl === 'object' && canvasEl.nodeName === 'CANVAS', "In call to 'canvas', could not initialize canvas element.");
    if (canvasId != null)
      logInfo("Initialized canvas: " + canvasId);
    else
      logInfo("Initialized canvas");
    // Initialize the WebGL context
    var canvasCtx = canvasEl.getContext('experimental-webgl', contextAttr);
    if (!canvasCtx)
      assert(false, "Could not get a 'experimental-webgl' context.");

    // Wrap glQuery canvas
    return (function() { 
      var self = { // Private
        ctx: canvasCtx,
        rootId: null,
        nextFrame: null,
        callback: function() {
          self = this;
          return function callback() {
            glQuery(self.rootId).render(self.ctx);
            self.nextFrame = window.requestAnimationFrame(callback, self.ctx.canvas);
          };
        }
      };
      return { // Public
        start: function(rootId) {
          logDebug("canvas.start");
          if (rootId != null) {
            assertType(rootId, 'string', 'canvas.start', 'rootId');
            self.rootId = rootId;
            self.nextFrame = window.requestAnimationFrame(self.callback(), self.ctx.canvas);
          }
          return this;
        },
        clear: function(mask) {
          logDebug("canvas.clear");

          return this;
        },
        clearColor: function(r,g,b,a) {
          logDebug("canvas.clearColor");
          self.ctx.clearColor(r,g,b,a);
          return this;
        },
        clearDepth: function(d) {
          logDebug("canvas.clearDepth");
          self.ctx.clearDepth(d);
          return this;
        },
        clearStencil: function(s) {
          logDebug("canvas.clearStencil");
          self.ctx.clearStencil(s);
          return this;
        }
      };
    })();
  };

  // Create a glQuery scene hierarchy
  glQuery.scene = function() {
    logDebug("scene");
    var rootIds = [];
    for (var i = 0; i < arguments.length; ++i) {
      var sceneDef = arguments[i];
      if (typeof sceneDef === 'string') {
        scene[sceneDef] = [];
        rootIds.push(sceneDef);
      }
      else {
        assert(typeof sceneDef === 'object', "In call to 'scene', expected type 'string' or 'object' for 'sceneDef'. Instead, got type '" + typeof sceneDef + "'.");

        // Normalize the scene node
        var normalizedScene = normalizeNodes(sceneDef);
        for (key in normalizedScene) {
          rootIds.push(key);
          scene[key] = normalizedScene[key];
        }
      }
    }
    if (rootIds.length === 0) {
      rootIds = generateId();
      scene[rootIds] = [];
      logWarning("In call to 'scene', no nodes supplied. Generating a single root node.");
    }
    return glQuery.fn.init(rootIds);
  };

  glQuery.worker = function(workerId, js) {
    // TODO:
    logError("(TODO) Workers are not yet implemented...");
  };

  return glQuery;
})();

