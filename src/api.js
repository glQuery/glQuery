  // glQuery API
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
    shaderProgram: function() {
      logDebug("shaderProgram");
      return this;
    },
    triangles: function() {
      logDebug("triangles");
      return this;
    },
    indices: function() {
      logDebug("indices");
      return this;
    },
    vertices: function() {
      logDebug("vertices");
      return this;
    },
    material: function() {
      logDebug("material");
      return this;
    },
    light: function() {
      logDebug("light");
      return this;
    },
    length: 0
  };
