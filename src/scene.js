  // Create a glQuery scene hierarchy
  gl.scene = function() {
    logDebug("scene");
    var rootIds = [];
    for (var i = 0; i < arguments.length; ++i) {
      var sceneDef = arguments[i];
      if (typeof sceneDef === 'string') {
        scenes[sceneDef] = [];
        rootIds.push(sceneDef);
      }
      else {
        assert(typeof sceneDef === 'object', "In call to 'scene', expected type 'string' or 'object' for 'sceneDef'. Instead, got type '" + typeof sceneDef + "'.");

        // Normalize the scene node
        var normalizedScene = normalizeNodes(sceneDef);
        for (key in normalizedScene) {
          rootIds.push(key);
          scenes[key] = normalizedScene[key];
        }
      }
    }
    if (rootIds.length === 0) {
      rootIds = generateId();
      scenes[rootIds] = [];
      logWarning("In call to 'scene', no nodes supplied. Generating a single root node.");
    }
    return gl.fn.init(rootIds);
  };
