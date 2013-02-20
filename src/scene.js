  // Create a glQuery scene hierarchy
  gl.scene = function() {
    logDebug("scene");
    var rootIds = [];
    for (var i = 0; i < arguments.length; ++i) {
      var sceneDef = arguments[i];
      if (Array.isArray(sceneDef)) {
        // Don't nest arrays, generate a new id for the node instead
        var id = normalizeNodes(generateId());
        scenes[id] = normalizeNodes(sceneDef);
        rootIds.push(id);
        continue;
      }
      switch (typeof sceneDef) {
        case 'string':
          var id = normalizeNodes(sceneDef);
          scenes[id] = [];
          rootIds.push(id);
          continue;
        case 'number':
          var id = normalizeNodes(String(sceneDef));
          scenes[id] = [];
          rootIds.push(id);
          continue;
        default:
          if (!assert(typeof sceneDef === 'object', "In call to 'scene', expected type 'string' ,'number' or 'object' for 'sceneDef'. Instead, got type '" + typeof sceneDef + "'."))
            continue;
          var normalizedScene = normalizeNodes(sceneDef);
          if (normalizedScene != null) {
            for (key in normalizedScene) {
              rootIds.push(key);
              scenes[key] = normalizedScene[key];
            }
          }
      }
    }
    if (arguments.length === 0) {
      scenes = {}; // Clear the scenes
      return apiDummy;
    }
    if (rootIds.length === 0) {
      logApiError("could not create scene from the given scene definition.");
      return apiDummy;
    }
    // Generate the paths for each tag in the normalized scene?
    // TODO
    // Update the state hashes for each of the root ids
    for (var i = 0; i < rootIds.length; ++i) {
      updateSceneHashes(rootIds[i]);
    }
    return gl.fn.init.apply(gl.fn, rootIds);
  };
