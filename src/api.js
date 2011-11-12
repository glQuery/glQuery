  // glQuery API
  glQuery.fn = glQuery.prototype = {
    init: function(selector, context) {
      //logDebug("init");
      this._selector = selector;
      this._context = context;
      return this;
    },
    render: function(context) {
      //logDebug("render");
      assertType(context, 'object', 'render', 'context');
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
