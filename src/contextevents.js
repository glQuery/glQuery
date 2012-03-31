  gl.contextlost = function(callback) {
    if(callback == null)
      eventCallbacks.contextlost = [];
    eventCallbacks.contextlost.push(callback);
  };
  gl.contextrestored = function(callback) {
    if(callback == null)
      eventCallbacks.contextrestored = [];
    eventCallbacks.contextrestored.push(callback);
  };

