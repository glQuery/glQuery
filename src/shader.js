  // Load a scenejs shader
  gl.shader = function(id, code) {
    logDebug("shader");
    // TODO: shaders[id] already exists, make sure all related resources are cleaned up
    if (typeof code == null) {
      delete shaders[id];
    } else {
      if (!assertType(code, 'string', 'shader', 'code')) return gl;
      shaders[id] = code;
    }
    return gl;
  };
