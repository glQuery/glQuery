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
  
