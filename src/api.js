  // glQuery API
  // Note: According to https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments
  //       arguments is not a proper Array object, so assume arguments.slice is not implemented.
  gl.fn = gl.prototype = {
    init: function(selector) {
      //logDebug("init");
      this._selector = selector;
      return this;
    },
    render: function(context) {
      //logDebug("render");
      assertType(context, 'object', 'render', 'context');
      return this;
    },
    command: function() {
      // TODO: consider what should be done if the command is 'insert' or 'remove'
      if (!assertNumberOfArguments(arguments, 1, 'command')) return;
      if (!assert(command[arguments[0]] != null, "Unknown command '" + command[arguments[0]] + "' used.")) return;
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
      commands.push(command.triangles, this._selector, Array.prototype.slice.call(arguments));
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
    },
    length: 0
  };
