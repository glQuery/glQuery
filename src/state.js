  // A module for managing (WebGL) state
  var collectCommands = function(tags, commandsStack, commandsState) {
    for (var i = 0; i < tags.length; ++i) {
      // TODO: (Optimization) 
      //       How fast is a lookup for an item that doesn't exist? 
      //       Would this be worst-case performance?
      //       Could it be faster to create separate a structure for storing tags that have no commands?
      //       Or perhaps create empty states for these...
      var tagCommandsState = tagCommands[tags[i]];
      if (typeof tagCommandsState === 'undefined')
        continue;
      commandsStack.splice.apply(commandsStack, [commandsStack.length, 0].concat(tagCommandsState)); // Concatenate tagCommandsState to commandsStack (mutating the original array)
      var shaderState = tagCommandsState[command.shaderProgram];
      if (shaderState != null) {
        commandsState[0] = shaderState;
      }
    }
  },
  updateStateHashes = function(node, commandsStack, commandsState) {
    // Meaning of the lastUpdate flag:
    // -1  Update this node and all its children (happens when a key in
    //     {key: [...]} changes before some time before this node is updated)
    // 0   Update this node and possibly (but not necessarily) some of its
    //     children (happens when a tag in a leaf node changes, i.e. a tag in a
    //     string value, or when one of the child nodes changes)
    // 1   This node has just been updated
    // 2   This node was up to date before updateStateHashes was called

    // Hash the state structure returned by collectCommands
    var hashState = function(commandsState) {
      return commandsState[0].join('$');
    };
    assertInternal(node.hashes != null && typeof node.lastUpdate !== 'undefined', "Node properties are not properly initialized.");
    // Test whether this node needs to be updated
    if (node.lastUpdate > 0) {
      // Test if any of the child nodes need to be updated
      var dirtyHash = false;
      for (var i = 0; i < node.length; ++i)
        if (typeof node[i] !== 'string')
          for (var key in node[i]) {
            var childNode = node[i][key];
            if (Array.isArray(childNode)) {
              updateStateHashes(childNode);
              dirtyHash |= childNode.lastUpdate == 1;
            }
          } 
      // Collect the hashes if any of the children's hashes changed
      if (dirtyHash) {
        // TODO: Busy here... Update the node.hashes with children's hashes
        //....
        node.lastUpdate = 1;
      }
      else
        node.lastUpdate = 2;
      return;
    }
    // Update hashes
    node.hashes = {};
    if (typeof commandsStack === 'undefined')
      commandsStack = [];
    if (typeof commandsState === 'undefined')
      commandsState = [[]];
    for (var i = 0; i < node.length; ++i) {
      if (typeof node[i] === 'string') {
        // Collect commands
        var childCommandsStack = [];
        var childCommandsState = commandsState.slice(); // Shallow copy of the state (TODO: this will not work for all types of commands, only basic ones like shaderProgram)
        collectCommands(node[i].split(' '), childCommandsStack, childCommandsState);
        // Store commands in the corresponding state hash
        var stateHash = hashState(childCommandsState);
        var hashCommandsStack = node.hashes[stateHash];
        if (typeof hashCommandsStack === 'undefined')
          hashCommandsStack = node.hashes[stateHash] = [];
        hashCommandsStack.push(commandsStack.concat(childCommandsStack));
      }
      else {
        for (var key in node[i]) {
          // Collect commands
          var childCommandsStack = [];
          var childCommandsState = commandsState.slice(); // Shallow copy of the state (TODO: this will not work for all types of commands, only basic ones like shaderProgram)
          collectCommands(node[i].split(' '), childCommandsStack, childCommandsState);
          // Update the state hashes for the children
          var childNode = node[i][key];
          if (node.lastUpdate === -1)
            childNode.lastUpdate = -1;
          childCommandsStack = commandsStack.concat(childCommandsStack);
          updateStateHashes(childNode, childCommandsStack, childCommandsState);
          // Merge the child node's hashes with this node's hashes
          for (var stateHash in childNode.hashes) {
            var hashCommandsStack = node.hashes[stateHash];
            if (typeof hashCommandsStack === 'undefined')
              node.hashes[stateHash] = childNode.hashes[stateHash];
            else
              node.hashes[stateHash] = hashCommandsStack.concat(childNode.hashes[stateHash]);
          }
        }
      }
    }
    node.lastUpdate = 1;
  },
  updateSceneHashes = function(id) {
    if (typeof scenes[id] === 'undefined')
      return;
    // Collect commands
    var commandsStack = [];
    var commandsState = [[]];
    collectCommands(id.split(' '), commandsStack, commandsState);
    // Update the state hashes
    updateStateHashes(scenes[id], commandsStack, commandsState);
  },
  updateDirtyHashes = function(dirtyTags) {
    var update = function(dirtyTags, key, node) {
      if (containsAnyTags(key, dirtyTags)) {
        node.lastUpdate = -1;
        // No need to update the children too because they'll automatically be updated
      }
      else {
        // Look for dirty tags in the children 
        for (var i = 0; i < node.length; ++i) {
          var n = node[i];
          if (typeof n === 'string') {
            if (node.lastUpdate < 1)
              continue; // We already know this node must be updated
            if (containsAnyTags(n, dirtyTags))
              // This node should be updated regardless of whether any children 
              // need to be updated
              node.lastUpdate = 0;
          }
          else
            for (var key in n) {
              var n = n[key];
              update(dirtyTags, key, n);
              if (n.lastUpdate < 1) {
                node.lastUpdate = 0;
              }
            }
        }
      }
    };
    for (var key in scenes) {
      update(dirtyTags, key, scenes[key]);
    }
  };
