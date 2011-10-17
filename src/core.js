var glQuery = (function() {
  // Define a local copy of glQuery
  var glQuery = function(selector, context) {
    return glQuery.fn.init(selector, context);
  },
  // The scene which contains the hierarchy of identifiers
  scene = {},
  // Buckets that hold renderer state
  buckets = {};

  // glQuery API
  glQuery.fn = glQuery.prototype = {
    init: function(selector, context) {
      
    },
    render: function() {
      
    },
    length: 0,
  };

  return glQuery;

})();
