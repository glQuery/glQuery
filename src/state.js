  // A module for managing (WebGL) state
  var updateStateHashes = function(node, commandsStack, commandsState) {
    // Collect all commands in a child node
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
        var shaderState = tagCommandsState[command.shaderProgram];
        commandsStack.splice.apply(commandsStack, [commandsStack.length, 0].concat(tagCommandsState)); // Concatenate tagCommandsState to commandsStack (mutating the original array)
        if (tagCommandsState != null && shaderState != null) {
          commandsState[0] = shaderState;
        }
      }
    },
    // Hash the state structure returned by collectCommands
    hashState = function(commandsState) {
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
      var childCommandsStack = [];
      var childCommandsState = commandsState.slice(0); // Shallow copy of the array (TODO: this will not work for all types of commands, only basic ones like shaderProgram)
      if (typeof node[i] === 'string') {
        collectCommands(node[i].split(' '), childCommandsStack, childCommandsState);
        var hashStack = node.hashes[hashState(childCommandsState)];
        if (typeof hashStack === 'undefined')
          node.hashes[hashState(childCommandsState)] = [childCommandsStack];
        else
          hashStack.push(childCommandsStack);
      }
      /* TODO:
      else {
        for (var key in node[i]) {
          var childTags = tags.slice(0); // Shallow copy of the array
          childTags.concat();
        }
      }*/
    }
    node.lastUpdate = 1;
  }
