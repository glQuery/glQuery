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
    // Hash the state structure returned by collectCommands
    var hashState = function(commandsState) {
      return commandsState[0].join('$');
    };

    assertInternal(node.hashes != null && typeof node.lastUpdate !== 'undefined', "Node properties are not properly initialized.");
    if (node.lastUpdate > 0) {
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
  };
