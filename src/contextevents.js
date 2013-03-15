  var registerContextEvent = function(eventName, fn, active) {
    var i, active = active;
    // Clear the list of callbacks if nothing was passed in
    if(typeof fn === 'undefined') {
      eventFns[eventName] = [];
      return;
    }
    // Check that callback is a function and active is a boolean
    assertType(fn, 'function', eventName, 'fn');
    typeof active !== 'undefined' && assertType(active, 'boolean', eventName, 'active');
    // Prevent the same callback from being added to the list twice.
    active = active === false? active : true;
    for (i = 0; i < eventFns[eventName].length; ++i)
      if (eventFns[eventName][i][0] === fn) {
        eventFns[eventName][i][1] = active;
        return;
      }
    // Add the event callback
    eventFns[eventName].push([fn, active]);
  };
  
  gl.contextlost = function(fn, active) { registerContextEvent('contextlost',fn,active); };
  gl.contextrestored = function(fn, active) { registerContextEvent('contextrestored',fn,active); };
  gl.contextcreationerror = function(fn) { registerContextEvent('contextcreationerror',fn,active); };

