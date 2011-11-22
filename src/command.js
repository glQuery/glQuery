  var command = {
    insert: 0,
    remove: 1,
    shaderProgram: 2,
    triangles: 3,
    vertices: 4,
    normals: 5,
    indices: 6,
    material: 7,
    light: 8
  },
  commandDispatch = [
    // insert: 0
    function() {
    },
    // remove: 1
    function() {
    },
    // shaderProgram: 2
    function() {
    },
    // triangles: 3
    function() {
    },
    // vertices: 4
    function() {
    },
    // normals: 5
    function() {
    },
    // indices: 6
    function() {
    },
    // material: 7
    function() {
    },
    // light: 8
    function() {
    },
  ];
  assert(commandDispatch.length == command.light + 1, "Internal Error: Number of commands in commandDispatch is incorrect.");
  
  // Execute a command taken from the queue
  var dispatchCommand = function(key, selector, commandArgs) {
    commandDispatch[key](selector, commandArgs);
  };
    
  // Append a command to the stream
  gl.command = function() {
    // TODO: consider what should be done if the command is 'insert' or 'remove'
    if (!assertNumberOfArguments(arguments, 1, 'command')) return gl;
    if (!assert(command[arguments[0]] != null, "Unknown command '" + command[arguments[0]] + "' used.")) return gl;
    commands.push(command[arguments[0]], (command[arguments[1]] != null? command[arguments[1]] : null), Array.prototype.slice.call(arguments, 2));
    return gl;
  };

