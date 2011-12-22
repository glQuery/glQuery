  var command = {
    // Hashed state (These commands are sorted by a hash function)
    shaderProgram: 0,
    // Unhashed state (These commands can be updated without resorting)
    geometry: 1,
    vertices: 2,
    normals: 3,
    indices: 4,
    material: 5,
    light: 6,
    // Unhashed state dictionaries (These commands have an extra key for a variable identifier)
    vertexAttribBuffer: 7,
    vertexAttrib1: 8,
    vertexAttrib2: 9,
    vertexAttrib3: 10,
    vertexAttrib4: 11,
    // Scene graph
    insert: 12,
    remove: 13
  },
  commandsSize = {
    hashedState: 1,
    unhashedState: 6,
    unhashedStateDictionary: 5,
    sceneGraph: 2
  },
  commandDispatch = [
    // shaderProgram: 0
    function(selector, args) {
      logDebug("dispatch command: shaderProgram");

      if (args.length > 0) {
        // TODO: Generate shader program if necessary
        var shaderProgram = args[0]; // (TODO if args[0] == WebGLProgram)....
        // Cache all associated shader locations (attributes and uniforms)
        if (shaderLocations[shaderProgram] == null) {
          var activeAttributes = context.getProgramParameter(shaderProgram, context.ACTIVE_ATTRIBUTES),
          activeUniforms = context.getProgramParameter(shaderProgram, context.ACTIVE_UNIFORMS),
          locations = shaderLocations[shaderProgram] = { attributes: {}, uniforms: {} };
          for (var i = 0; i < activeAttributes; ++i) {
            var attrib = context.getActiveAttrib(shaderProgram, i);
            locations.attributes[attrib.name] = context.getAttribLocation(shaderProgram, attrib.name);
          }
          for (var i = 0; i < activeUniforms; ++i) {
            var uniform = context.getActiveUniform(shaderProgram, i);
            locations.attributes[uniform.name] = context.getAttribLocation(shaderProgram, uniform.name);
          }
        }
        // Add shader program associations to tags
        for (var i = 0; i < selector.length; ++i) {
          //var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          var commandsStruct = tagCommands[selector[i]];
          commandsStruct[command.shaderProgram] = shaderProgram; // Only one argument is ever need
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
          //var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          var commandsStruct = tagCommands[selector[i]];
          commandsStruct[command.geometry] = args[0]; // Only one argument is ever needed
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.geometry];
      }
    },
    // vertices: 2
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
    // normals: 3
    function(selector, args) {
      logDebug("dispatch command: normals");
    },
    // indices: 4
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
    // material: 5
    function(selector, args) {
      logDebug("dispatch command: material");
    },
    // light: 6
    function(selector, args) {
      logDebug("dispatch command: light");
    },
    // vertexAttribBuffer: 7
    function(selector, args) {
      logDebug("dispatch command: vertexAttribBuffer");
      if (args.length > 1) {
        for (var i = 0; i < selector.length; ++i) {
          var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          commandsStruct[command.vertexAttribBuffer] = args;
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.vertexAttribBuffer];
      }
    },
    // vertexAttrib1: 8
    function(selector, args) {
      logDebug("dispatch command: vertexAttrib1");
    },
    // vertexAttrib2: 9
    function(selector, args) {
      logDebug("dispatch command: vertexAttrib2");
    },
    // vertexAttrib3: 10
    function(selector, args) {
      logDebug("dispatch command: vertexAttrib3");
    },
    // vertexAttrib4: 11
    function(selector, args) {
      logDebug("dispatch command: vertexAttrib4");
    },
    // insert: 12
    function(selector, args) {
      logDebug("dispatch command: insert");
    },
    // remove: 13
    function(selector, args) {
      logDebug("dispatch command: remove");
    }
  ],
  commandEval = [
    // shaderProgram: 0
    function(context, renderState, args) {
      logDebug("eval command: shaderProgram");
      context.useProgram(args);
      renderState.shaderProgram = args;
    },
    // geometry: 1
    function(context, renderState, args) {
      logDebug("eval command: geometry");
      context.drawArrays(args, 0, renderState.numVertices);
      /*context.drawArrays(args, 0,
        args === gl.TRIANGLES? renderState.numVertices / 3 : (
        args === gl.TRIANGLE_FAN || args === TRIANGLE_STRIP? renderState.numVertices - 2 : (
        args === gl.LINES? renderState.numVertices / 2 : (
        args === gl.LINE_STRIP? renderState.numVertices - 1 : (
        /*args === gl.POINTS || args === gl.LINE_LOOP?* renderState.numVertices)))));*/
    },
    // vertices: 2
    function(context, renderState, args) {
      logDebug("eval command: vertices");
    },
    // normals: 3
    function(context, renderState, args) {
      logDebug("eval command: normals");
    },
    // indices: 4
    function(context, renderState, args) {
      logDebug("eval command: indices");
    },
    // material: 5
    function(context, renderState, args) {
      logDebug("eval command: material");
    },
    // light: 6
    function(context, renderState, args) {
      logDebug("eval command: light");
    },
    // vertexAttribBuffer: 7
    function(context, renderState, args) {
      logDebug("eval command: vertexAttribBuffer");
      var locations = (renderState.shaderProgram != null? shaderLocations[shaderProgram] : null);
      if (typeof locations !== 'undefined') {
        var attribLocation = (typeof args[0] == 'number'? args[0] : locations.attributes[args[0]]);
        if (typeof attribLocation !== 'undefined' && attribLocation !== -1) {
          // TODO: Don't rebind buffer if not necessary?
          context.bindBuffer(context.ARRAY_BUFFER, args[1]); 
          // TODO: Don't re-enable attribute array if not necessary?
          context.enableVertexAttribArray(attribLocation);
          // TODO: Use additional information from the WebGLActiveInfo struct for parameters?
          // TODO: Get type (e.g. gl.FLOAT) from WebGLActiveInfo
          context.vertexAttribPointer(attribLocation, args[2], gl.FLOAT, args[3], args[4], args[5]);
          renderState.numVertices = args[2];
        }
      }
    },
    // vertexAttrib1: 8
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib1");
    },
    // vertexAttrib2: 9
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib2");
    },
    // vertexAttrib3: 10
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib3");
    },
    // vertexAttrib4: 11
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib4");
    }
  ];

  //assert(commandDispatch.length === command.length, "Internal Error: Number of commands in commandDispatch is incorrect.");
  assert(commandDispatch.length === commandsSize.hashedState + commandsSize.unhashedState + commandsSize.unhashedStateDictionary + commandsSize.sceneGraph, "Internal Error: Total commands size does not add up to the correct number.");
  assert(commandEval.length === commandDispatch.length - commandsSize.sceneGraph, "Internal Error: Number of commands in commandEval is incorrect.");
  
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
  evalCommands = function(context, renderState, commandsStack) {
    logDebug("evalCommands");
    
    //var newRenderState = new Array(commandEval.length);
    var newRenderState = commandsStack[0].slice(); // Shallow copy of the state
    
    // Update render state from the commandsStack (in reverse)
    for (var i = commandsStack.length - 2; i >= 0; --i) {
      var commandsState = commandsStack[i];
      for (var j = 0; j < commandEval.length; ++j)
        if (newRenderState[j] == null)
          newRenderState[j] = commandsState[j];
    }
    // Copy render state from parents where required
    for (var i = 0; i < commandEval.length; ++i)
      if (newRenderState[i] == null)
        newRenderState[i] = renderState[i];
    
    // Do WebGL API calls

    // Shader program
    var shaderProgramCommand = newRenderState[command.shaderProgram];
    if (shaderProgramCommand != renderState[command.shaderProgram]) {
      commandEval[command.shaderProgram](context, newRenderState, shaderProgramCommand);
    }
    // Shader state
    for (var i = command.vertexAttribBuffer; i <= command.vertexAttrib4; ++i) {
      var stateCommand = newRenderState[i];
      if (stateCommand != null && stateCommand !== renderState[i])
        commandEval[i](context, newRenderState, stateCommand);
    }
    // Draw geometry
    var geometryCommand = newRenderState[command.geometry];
    if (geometryCommand != null)
      commandEval[command.geometry](context, newRenderState, geometryCommand);

    // Update current render state
    renderState = newRenderState;
  };
    
  // Append a command to the quey
  gl.command = function() {
    // TODO: consider what should be done if the command is 'insert' or 'remove'
    if (!assertNumberOfArguments(arguments, 1, 'command')) return gl;
    if (!assert(command[arguments[0]] != null, "Unknown command '" + command[arguments[0]] + "' used.")) return gl;
    commands.push([command[arguments[0]], (command[arguments[1]] != null? command[arguments[1]] : null), Array.prototype.slice.call(arguments, 2)]);
    return gl;
  };

