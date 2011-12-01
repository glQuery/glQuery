  // Create a glQuery scene hierarchy
  gl.scene = function() {
    logDebug("scene");
    var rootIds = [];
    for (var i = 0; i < arguments.length; ++i) {
      var sceneDef = arguments[i];
      if (Array.isArray(sceneDef)) {
        // Don't nest arrays, generate a new id for the node instead
        var id = generateId();
        scenes[id] = normalizeNodes(sceneDef);
        rootIds.push(id);
        continue;
      }
      switch (typeof sceneDef) {
        case 'string':
          scenes[sceneDef] = [];
          rootIds.push(sceneDef);
          continue;
        case 'number':
          var id = String(sceneDef);
          scenes[id] = [];
          rootIds.push(id);
          continue;
        default:
          if (!assert(typeof sceneDef === 'object', "In call to 'scene', expected type 'string' ,'number' or 'object' for 'sceneDef'. Instead, got type '" + typeof sceneDef + "'."))
            return apiDummy;
          var normalizedScene = normalizeNodes(sceneDef);
          if (normalizedScene != null) {
            for (key in normalizedScene) {
              rootIds.push(key);
              scenes[key] = normalizedScene[key];
            }
          }
      }
    }
    if (rootIds.length === 0) {
      rootIds = generateId();
      scenes[rootIds] = [];
      logWarning("In call to 'scene', no nodes supplied. Generating a single root node.");
    }
    // TODO: generate the paths for each tag in the normalized scene?
    return gl.fn.init(rootIds);
  };

