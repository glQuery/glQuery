  var command = {
    // Hashed state (These commands are sorted by a hash function)
    shaderProgram: 0,
    // Unhashed state (These commands can be updated without resorting)
    geometry: 1,
    vertexAttribBuffer: 2,
    vertexAttrib1: 3,
    vertexAttrib2: 4,
    vertexAttrib3: 5,
    vertexAttrib4: 6,
    vertices: 7,
    normals: 8,
    indices: 9,
    material: 10,
    light: 11,
    // Scene graph
    insert: 12,
    remove: 13
  },
  commandDispatch = [
    // shaderProgram: 0
    function(selector, args) {
      logDebug("dispatch command: shaderProgram");
      if (args.length > 0) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          commandsStruct[command.shaderProgram] = args;
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.shaderProgram];
      }
    },
    // geometry: 1
    function(selector, args) {
      logDebug("dispatch command: geometry");
      if (args.length > 0) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          commandsStruct[command.geometry] = args[0];
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.geometry];
      }
    },
    // vertexAttribBuffer: 2
    function(selector,args) {
      logDebug("dispatch command: vertexAttribBuffer");
      if (args.length > 1) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          commandsStruct[command.vertexAttribute] = args;
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.vertexAttribute];
      }
    },
    // vertexAttrib1: 3
    function(selector,args) {
      logDebug("dispatch command: vertexAttrib1");
    },
    // vertexAttrib2: 4
    function(selector,args) {
      logDebug("dispatch command: vertexAttrib2");
    },
    // vertexAttrib3: 5
    function(selector,args) {
      logDebug("dispatch command: vertexAttrib3");
    },
    // vertexAttrib4: 6
    function(selector,args) {
      logDebug("dispatch command: vertexAttrib4");
    },
    // vertices: 7
    function(selector,args) {
      logDebug("dispatch command: vertices");
      /*if (args.length > 0) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]];
          // TODO: convert argument into a buffer object first... (if it isn't already)
          commandsStruct[command.vertices] = args[0];
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.vertices];
      }*/
    },
    // normals: 8
    function(selector, args) {
      logDebug("dispatch command: normals");
    },
    // indices: 9
    function(selector, args) {
      logDebug("dispatch command: indices");
      /*if (args.length > 0) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]];
          // TODO: convert argument into a buffer object first... (if it isn't already)
          commandsStruct[command.indices] = args[0];
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.indices];
      }*/
    },
    // material: 10
    function(selector, args) {
      logDebug("dispatch command: material");
    },
    // light: 11
    function(selector, args) {
      logDebug("dispatch command: light");
    },
    // insert: 12
    function(selector, args) {
      logDebug("dispatch command: insert");
    },
    // remove: 13
    function(selector, args) {
      logDebug("dispatch command: remove");
    }
  ];
  assert(commandDispatch.length == command.length, "Internal Error: Number of commands in commandDispatch is incorrect.");
  
  // Dispatches all commands in the queue
  var dispatchCommands = function(commands) {
    for (var i = 0; i < commands.length; ++i) {
      var c = commands[i],
      key = c[0],
      selector = c[1],
      commandArgs = c[2];
      commandDispatch[key](selector, commandArgs);
    }
  },
  // Collect and execute webgl commands using a render state structure to keep track of state changes
  evalCommands = function(renderState, commands) {
    for (var i = 0; i < commands.length; ++i) {
      var c = commands[i];

      // Structure:
      // c[0] = command id
      
      // TODO: ... busy here
      //if (renderState[c[0]])
    }
  };
    
  // Append a command to the quey
  gl.command = function() {
    // TODO: consider what should be done if the command is 'insert' or 'remove'
    if (!assertNumberOfArguments(arguments, 1, 'command')) return gl;
    if (!assert(command[arguments[0]] != null, "Unknown command '" + command[arguments[0]] + "' used.")) return gl;
    commands.push([command[arguments[0]], (command[arguments[1]] != null? command[arguments[1]] : null), Array.prototype.slice.call(arguments, 2)]);
    return gl;
  };

