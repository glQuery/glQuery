/*
 * glQuery
 * Originaly copyright glQuery authors 2011, but is released into the public domain.
 * (Also available under an MIT license and a GPL v2.0 license)
 */
"use strict";



var glQuery = (function() {
  // Define a local copy of glQuery
  var glQuery = function(selector, context) {
    return glQuery.fn.init(selector, context);
  },
  // The scene which contains the hierarchy of identifiers
  scene = {},
  // Buckets that hold renderer state
  buckets = {};

  logInfo = function(msg) { console.log(msg); };
  logWarning = function(msg) { console.log(msg); };
  logError = function(msg) { console.log(msg); };

  // glQuery API
  glQuery.fn = glQuery.prototype = {
    init: function(selector, context) {
      logInfo("init");
    },
    scene: function(sceneDef) {
      logInfo("scene");
      if (typeof sceneDef === 'String') {
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

  return glQuery;

})();
