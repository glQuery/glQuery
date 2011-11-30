  // glQuery API
  // Note: According to https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments
  //       arguments is not a proper Array object, so assume arguments.slice is not implemented.
  var apiDummy = {
    init: function() { return this; },
    render: function() { return this; },
    command: function() { return this; },
    shaderProgram: function() { return this; },
    triangles: function() { return this; },
    indices: function() { return this; },
    vertices: function() { return this; },
    material: function() { return this; },
    light: function() { return this; }
  };

  gl.fn = gl.prototype = {
    init: function() {
      //logDebug("init");
      this._selector = Array.prototype.slice.call(arguments);
      return this;
    },
    render: function(context) {
      //logDebug("render");
      if (!assertType(context, 'object', 'render', 'context')) return this;
      // TODO: assert that the context is a webgl context specifically     
      return this;
    },
    command: function() {
      // TODO: consider what should be done if the command is 'insert' or 'remove'
      if (!assertNumberOfArguments(arguments, 1, 'command')) return this;
      if (!assert(command[arguments[0]] != null, "Unknown command '" + command[arguments[0]] + "' used.")) return this;
      commands.push(command[arguments[0]], this._selector, Array.prototype.slice.call(arguments, 1));
      return this;
    },
    shaderProgram: function() {
      logDebug("shaderProgram");
      commands.push(command.shaderProgram, this._selector, Array.prototype.slice.call(arguments));
      return this;
    },
    triangles: function() {
      logDebug("triangles");
      commands.push(command.geometry, this._selector, [gl.TRIANGLES]);
      return this;
    },
    vertexAttrib: function() {
      logDebug("vertexAttrib");
      commands.push(command.vertexAttribBuffer, this._selector, Array.prototype.slice.call(arguments));
      return this;
    },
    indices: function() {
      logDebug("indices");
      commands.push(command.indices, this._selector, Array.prototype.slice.call(arguments));
      return this;
    },
    vertices: function() {
      logDebug("vertices");
      commands.push(command.vertices, this._selector, Array.prototype.slice.call(arguments));
      return this;
    },
    material: function() {
      logDebug("material");
      commands.push(command.material, this._selector, Array.prototype.slice.call(arguments));
      return this;
    },
    light: function() {
      logDebug("light");
      commands.push(command.light, this._selector, Array.prototype.slice.call(arguments));
      return this;
    }
  };

