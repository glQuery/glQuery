  var registerContextEvent = function(eventName, callback, active) {
    var i, active = active;
    // Clear the list of callbacks if nothing was passed in
    if(typeof callback === 'undefined') {
      eventCallbacks[eventName] = [];
      return;
    }
    // Check that callback is a function and active is a boolean
    assertType(callback, 'function', eventName, 'callback');
    typeof active !== 'undefined' && assertType(active, 'boolean', eventName, 'active');
    // Prevent the same callback from being added to the list twice.
    active = active === false? active : true;
    for (i = 0; i < eventCallbacks[eventName].length; ++i)
      if (eventCallbacks[eventName][i][0] === callback) {
        eventCallbacks[eventName][i][1] = active;
        return;
      }
    // Add the callback
    eventCallbacks[eventName].push([callback, active]);
  };
  
  gl.contextlost = function(callback, active) { registerContextEvent('contextlost',callback,active); };
  gl.contextrestored = function(callback, active) { registerContextEvent('contextrestored',callback,active); };
  gl.contextcreationerror = function(callback) { registerContextEvent('contextcreationerror',callback,active); };

