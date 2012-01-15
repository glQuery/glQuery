  gl.refresh = function(obj) {
    if (obj instanceof WebGLProgram && obj['_glquery_id'] != null) {
      shaderLocations[obj._glquery_id] = {};
    }
  };
