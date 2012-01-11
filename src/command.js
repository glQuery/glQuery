  var command = {
    // Hashed state (These commands are sorted by a hash function)
    shaderProgram: 0,
    // Unhashed state (These commands can be updated without resorting)
    geometry: 1,
    vertexElem: 2,
    // Unhashed state dictionaries (These commands have an extra key for a variable identifier)
    vertexAttribBuffer: 3,
    vertexAttrib1: 4,
    vertexAttrib2: 5,
    vertexAttrib3: 6,
    vertexAttrib4: 7,
    uniform: 8,
    // Scene graph
    insert: 9,
    remove: 10
  },
  commandsSize = {
    hashedState: 1,
    unhashedState: 2,
    unhashedStateDictionary: 6,
    sceneGraph: 2
  },
  commandDispatch = [
    // shaderProgram: 0
    function(context, selector, args) {
      logDebug("dispatch command: shaderProgram");

      if (args.length > 0) {
        // Generate shader program if necessary
        // instanceof appears to be a valid test according to the khronos conformance suite
        // https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/tests/conformance/misc/instanceof-test.html
        var shaderProgram;
        if (args[0] instanceof WebGLProgram)
          shaderProgram = args[0];
        else if (args[0] instanceof WebGLShader) {
          // TODO: There's no context available for this instance
          // shaderProgram = context.createProgram();
          // for (var i = 0; i < args.length; ++i) {
          //   context.attachShader(shaderProgram, args[i]);
          // }
          // context.linkProgram(shaderProgram);
          logError("Internal Error: shaderProgram(WebGLShader, ...) is not yet supported by glQuery.");
          return;
        }
        // Add an index to the shader program (We can't index the shader locations by shader program 
        // when the shader program is an instance of WebGLProgram because toString simply gives
        // '[object WebGLProgram]'
        shaderProgram._glquery_id = shaderProgramCounter;
        ++shaderProgramCounter;
        // Cache all associated shader locations (attributes and uniforms)
        if (shaderLocations[shaderProgram._glquery_id] == null) {
          var activeAttributes = context.getProgramParameter(shaderProgram, context.ACTIVE_ATTRIBUTES),
          activeUniforms = context.getProgramParameter(shaderProgram, context.ACTIVE_UNIFORMS),
          locations = shaderLocations[shaderProgram._glquery_id] = { attributes: {}, uniforms: {} };
          for (var i = 0; i < activeAttributes; ++i) {
            var attrib = context.getActiveAttrib(shaderProgram, i);
            locations.attributes[attrib.name] = context.getAttribLocation(shaderProgram, attrib.name);
          }
          for (var i = 0; i < activeUniforms; ++i) {
            var uniform = context.getActiveUniform(shaderProgram, i);
            locations.uniforms[uniform.name] = { 
              location: context.getUniformLocation(shaderProgram, uniform.name),
              size: uniform.size,
              type: uniform.type
            };
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
    function(context, selector, args) {
      logDebug("dispatch command: geometry");
      if (args.length > 0) {
        for (var i = 0; i < selector.length; ++i) {
          //var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
          var commandsStruct = tagCommands[selector[i]];
          commandsStruct[command.geometry] = args;
        }
      }
      else {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.geometry];
      }
    },
    // vertexElem: 2
    function(context, selector, args) {
      logDebug("dispatch command: vertexElem");
      // Pre-conditions: args.length == 0 || args.length >= 2
      // If no arguments were given, delete the command
      if (args[0] == null) {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.vertexElem];
        return;
      }
      /* Cache the buffer size parameter
      if (args[0]._glquery_BUFFER_SIZE == null) {
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, args[0]);
        args[0]._glquery_BUFFER_SIZE = context.getBufferParameter(context.ELEMENT_ARRAY_BUFFER, context.BUFFER_SIZE);
      }//*/
      // Add default arguments
      switch (args.length) {
        case 2:
          args.push(context.UNSIGNED_SHORT);
        case 3:
          args.push(0);
      }
      // Store the command
      for (var i = 0; i < selector.length; ++i) {
        var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
        commandsStruct[command.vertexElem] = args;
      }
    },
    // vertexAttribBuffer: 3
    function(context, selector, args) {
      logDebug("dispatch command: vertexAttribBuffer");
      // Pre-conditions: args.length == 0 || args.length == 1 || args.length >= 3
      // If no arguments were supplied, delete all the vertexAttribBuffer commands
      if (args[0] == null) {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.vertexAttribBuffer];
        return;
      }
      // If no buffer was supplied, delete the vertexAttribBuffer command for the given attribute name
      if (args[1] == null) {
        // TODO...
        return;
      }
      /* Cache the buffer size parameter
      if (args[1]._glquery_BUFFER_SIZE == null) {
        context.bindBuffer(context.ARRAY_BUFFER, args[1]);
        args[1]._glquery_BUFFER_SIZE = context.getBufferParameter(context.ARRAY_BUFFER, context.BUFFER_SIZE);
      }//*/
      // Add default arguments
      // TODO...
      // Store the command
      for (var i = 0; i < selector.length; ++i) {
        var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]);
        commandsStruct[command.vertexAttribBuffer] = args;
      }
    },
    // vertexAttrib1: 4
    function(context, selector, args) {
      logDebug("dispatch command: vertexAttrib1");
    },
    // vertexAttrib2: 5
    function(context, selector, args) {
      logDebug("dispatch command: vertexAttrib2");
    },
    // vertexAttrib3: 6
    function(context, selector, args) {
      logDebug("dispatch command: vertexAttrib3");
    },
    // vertexAttrib4: 7
    function(context, selector, args) {
      logDebug("dispatch command: vertexAttrib4");
    },
    // uniform: 8
    function(context, selector, args) {
      logDebug("dispatch command: uniform");
      // If no arguments were supplied, delete all the uniform commands
      if (args[0] == null) {
        for (var i = 0; i < selector.length; ++i)
          if (typeof tagCommands[selector[i]] !== 'undefined')
            delete tagCommands[selector[i]][command.uniform];
        return;
      }
      // If no argument was supplied, delete the uniform command for the given uniform name
      if (args[1] == null) {
        // TODO...
        return;
      }
      // Store the command
      for (var i = 0; i < selector.length; ++i) {
        var commandsStruct = (typeof tagCommands[selector[i]] === 'undefined'? (tagCommands[selector[i]] = {}) : tagCommands[selector[i]]),
        uniformTable = commandsStruct[command.uniform];
        if(uniformTable == null)
          uniformTable = commandsStruct[command.uniform] = {};
        //commandsStruct[command.uniform] = args;
        uniformTable[args[0]] = args.slice(1);
      }
    },
    // insert: 9
    function(context, selector, args) {
      logDebug("dispatch command: insert");
    },
    // remove: 10
    function(context, selector, args) {
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
      if (renderState.useElements)
        context.drawElements(args[0], args[1] != null? args[1] : renderState.numVertices, renderState.elementsType, renderState.elementsOffset + (args[2] != null? args[2] : 0));
      else
        context.drawArrays(args[0], args[2] != null? args[2] : 0, args[1] != null? args[1] : renderState.numVertices);
    },
    // vertexElem: 2
    function(context, renderState, args) {
      logDebug("eval command: vertexElem");
      // TODO: Don't rebind buffer if not necessary?
      context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, args[0]); 
      renderState.numVertices = args[1];
      renderState.elementsType = args[2];
      renderState.elementsOffset = args[3];
      renderState.useElements = true;
    },
    // vertexAttribBuffer: 3
    function(context, renderState, args) {
      logDebug("eval command: vertexAttribBuffer");
      var locations = (renderState.shaderProgram != null? shaderLocations[renderState.shaderProgram._glquery_id] : null);
      if (locations != null) {
        var attribLocation = (typeof args[0] == 'number'? args[0] : locations.attributes[args[0]]);
        if (typeof attribLocation !== 'undefined' && attribLocation !== -1) {
          // TODO: Don't rebind buffer if not necessary?
          context.bindBuffer(context.ARRAY_BUFFER, args[1]);
          // TODO: Don't re-enable attribute array if not necessary?
          context.enableVertexAttribArray(attribLocation);
          // TODO: Use additional information from the WebGLActiveInfo struct for parameters?
          // TODO: Get type (e.g. gl.FLOAT) from WebGLActiveInfo instead?
          context.vertexAttribPointer(attribLocation, args[4], args[3], args[5], args[6], args[7]);
          if (!renderState.useElements)
            renderState.numVertices = Math.min(renderState.numVertices, args[2] / args[4]);
        }
      }
    },
    // vertexAttrib1: 4
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib1");
    },
    // vertexAttrib2: 5
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib2");
    },
    // vertexAttrib3: 6
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib3");
    },
    // vertexAttrib4: 7
    function(context, renderState, args) {
      logDebug("eval command: vertexAttrib4");
    },
    // uniform: 8
    (function() {
      var uniformEval = {};
      uniformEval[gl.FLOAT] = WebGLRenderingContext.prototype.uniform1f;
      uniformEval[gl.FLOAT_VEC2] = WebGLRenderingContext.prototype.uniform2f;
      uniformEval[gl.FLOAT_VEC3] = WebGLRenderingContext.prototype.uniform3f;
      uniformEval[gl.FLOAT_VEC4] = WebGLRenderingContext.prototype.uniform4f;
      uniformEval[gl.INT] = WebGLRenderingContext.prototype.uniform1i;
      uniformEval[gl.INT_VEC2] = WebGLRenderingContext.prototype.uniform2i;
      uniformEval[gl.INT_VEC3] = WebGLRenderingContext.prototype.uniform3i;
      uniformEval[gl.INT_VEC4] = WebGLRenderingContext.prototype.uniform4i;
      uniformEval[gl.BOOL] = WebGLRenderingContext.prototype.uniform1i;
      uniformEval[gl.BOOL_VEC2] = WebGLRenderingContext.prototype.uniform2i;
      uniformEval[gl.BOOL_VEC3] = WebGLRenderingContext.prototype.uniform3i;
      uniformEval[gl.BOOL_VEC4] = WebGLRenderingContext.prototype.uniform4i;
      uniformEval[gl.FLOAT_MAT2] = function(location, value, transpose) { this.uniformMatrix2fv(location, transpose != null? transpose : false, value); };
      uniformEval[gl.FLOAT_MAT3] = function(location, value, transpose) { this.uniformMatrix3fv(location, transpose != null? transpose : false, value); };
      uniformEval[gl.FLOAT_MAT4] = function(location, value, transpose) { this.uniformMatrix4fv(location, transpose != null? transpose : false, value); };
      //uniformEval[gl.SAMPLER_2D] =
      //uniformEval[gl.SAMPLER_CUBE] = 

      return function(context, renderState, args) {
        logDebug("eval command: uniform");
        // TODO: Detect uniformMatrix (supplied without the special transpose flag?)
        // I.e. use attributes stored by getLocation?
        var locations = (renderState.shaderProgram != null? shaderLocations[renderState.shaderProgram._glquery_id] : null);
        if (locations != null) {
          // TODO: How to get the uniform info if it is already given as a UniformLocation object?
          //       Can we query/cache it in a fast way?
          //       Probably need to set up benchmark for this...
          for (var uniformName in args) { // args is a table of uniforms
            /* Not supported: WebGLUniformLocation - (because uniform locations are specific to some shader program)
            if (key instanceof WebGLUniformLocation) {
              console.log(uniformLocation);	
              uniformLocation = args[0];
              // TODO: uniformInfo = locations.uniforms[args[0]];
            }*/
            var uniformInfo = locations.uniforms[uniformName],
            uniformLocation = uniformInfo.location,
            uniformArgs = args[uniformName];
            if (uniformLocation != null && uniformInfo != null)
              uniformEval[uniformInfo.type].apply(context, [uniformLocation].concat(uniformArgs));
          }
        }
      };
    })()
  ];

  //assert(commandDispatch.length === command.length, "Internal Error: Number of commands in commandDispatch is incorrect.");
  assert(commandDispatch.length === commandsSize.hashedState + commandsSize.unhashedState + commandsSize.unhashedStateDictionary + commandsSize.sceneGraph, "Internal Error: Total commands size does not add up to the correct number.");
  assert(commandEval.length === commandDispatch.length - commandsSize.sceneGraph, "Internal Error: Number of commands in commandEval is incorrect.");
  
  // Dispatches all commands in the queue
  var dispatchCommands = function(context, commands) {
    for (var i = 0; i < commands.length; ++i) {
      var c = commands[i],
      key = c[0],
      selector = c[1],
      commandArgs = c[2];
      commandDispatch[key](context, selector, commandArgs);
    }
  },
  // Collect and execute webgl commands using a render state structure to keep track of state changes
  evalCommands = function(context, renderState, commandsStack) {
    logDebug("evalCommands");
    
    //var newRenderState = new Array(commandEval.length);
    var newRenderState = commandsStack[0].slice(); // Shallow copy of the state
    newRenderState.numVertices = Number.POSITIVE_INFINITY;
    newRenderState.elementsOffset = 0;
    newRenderState.elementsType = context.UNSIGNED_SHORT;
    newRenderState.useElements = false;
    
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
    // Shader state (excluding geometry which is a special case)
    for (var i = command.vertexElem; i <= command.uniform; ++i) {
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

