  gl.contextlost = function(callback) {
    var i;
    // Clear the list of callbacks if nothing was passed in
    if(typeof callback === 'undefined') {
      eventCallbacks.contextlost = [];
      return;
    }
    // Check that callback is a function
    assertType(callback, 'function', 'contextlost', 'callback');
    // Prevent the same callback from being added to the list twice.
    for (i = 0; i < eventCallbacks.contextlost.length; ++i)
      if (eventCallbacks.contextlost[i] === callback)
        return;
    // Add the callback
    eventCallbacks.contextlost.push(callback);
  };
  gl.contextrestored = function(callback) {
    var i;
    // Clear the list of callbacks if nothing was passed in
    if(typeof callback === 'undefined') {
      eventCallbacks.contextrestored = [];
      return;
    }
    // Check that callback is a function
    assertType(callback, 'function', 'contextrestored', 'callback');
    // Prevent the same callback from being added to the list twice.
    for (i = 0; i < eventCallbacks.contextrestored.length; ++i)
      if (eventCallbacks.contextrestored[i] === callback)
        return;
    // Add the callback
    eventCallbacks.contextrestored.push(callback);
  };

