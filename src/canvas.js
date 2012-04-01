  var triggerContextEvents = function(callbacks, event) {
    for (var i = 0; i < callbacks.length; ++i)
      if (callbacks[i][1])
        callbacks[i][0](event);
  };

  // Initialize a WebGL canvas
  gl.canvas = function(htmlCanvas, contextAttr, width, height) {
    var canvasId, canvasEl;
    logDebug("canvas");
    var dummy = {
      start: function() { return this; },
      clear: function() { return this; },
      clearColor: function() { return this; },
      clearDepth: function() { return this; },
      clearStencil: function() { return this; }
    };
    if (typeof htmlCanvas === 'undefined') {
      // Create canvas element
      canvasId = 'glqueryCanvas';
      document.write("<canvas id='" + canvasId + "' width='" + (width != null? width : 800) + "' height='" + (height != null? height : 800) + "'></canvas>");
      canvasEl = document.getElementById(canvasId);
    }
    else {
      // Get existing canvas element
      if (!assert(typeof htmlCanvas === 'string' || (typeof htmlCanvas === 'object' && htmlCanvas.nodeName !== 'CANVAS'), "In call to 'canvas', expected type 'string', 'undefined' or 'canvas element' for 'htmlCanvas'. Instead, got type '" + typeof htmlCanvas + "'."))
        return dummy;
      canvasId = typeof htmlCanvas === 'string'? htmlCanvas : htmlCanvas.id;
      canvasEl = typeof htmlCanvas === 'object'? htmlCanvas : document.getElementById(canvasId);
    }
    if (!assert(canvasEl != null && typeof canvasEl === 'object' && canvasEl.nodeName === 'CANVAS', "In call to 'canvas', could not initialize canvas element."))
      return dummy;
    if (canvasId != null)
      logInfo("Initialized canvas: " + canvasId);
    else
      logInfo("Initialized canvas");

    // Initialize the WebGL context
    var canvasCtx = canvasEl.getContext('experimental-webgl', contextAttr);
    if (!assert(canvasCtx != null, "Could not get a 'experimental-webgl' context."))
      return dummy;

    canvasEl.addEventListener("webglcontextlost", function(event) {
      var i;
      // Trigger user events
      triggerContextEvents(eventCallbacks.contextlost, event);
      // Cancel rendering on all canvases that use request animation frame via
      // gl.canvas(...).start().
      for (i = 0; i < contexts.length; ++i) {
        var context = contexts[i];
        if (context.ctx.canvas !== canvasEl)
          continue;
        if (context.nextFrame != null)
          window.cancelAnimationFrame(context.nextFrame);
        break;
      }
      // Prevent default handling of event
      event.preventDefault();
    }, false);

    canvasEl.addEventListener("webglcontextrestored", function(event) {
      var i;
      // TODO: reload managed webgl resources
      // Trigger user events
      triggerContextEvents(eventCallbacks.contextrestored, event);
      // Resume rendering on all contexts that have not explicitly been paused
      // via gl.canvas(...).pause().
      for (i = 0; i < contexts.length; ++i) {
        var context = contexts[i];
        if (context.ctx.canvas !== canvasEl)
          continue;
        if (context.nextFrame == null && context.paused === false)
          window.requestAnimationFrame(context.callback(), context.ctx.canvas);
        break;
      }
    }, false);

    canvasEl.addEventListener("webglcontextcreationerror", function(event) {
      triggerContextEvents(eventCallbacks.contextcreationerror, event);
    }, false);

    // Wrap glQuery canvas
    return (function() { 
      var self = { // Private
        ctx: canvasCtx,
        rootId: null,
        nextFrame: null,
        paused: true,
        clearMask: gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
        callback: function() {
          self = this;
          return function callback() {
            if (self.ctx.isContextLost())
              return; // Ensure context lost
            self.ctx.clear(self.clearMask);
            gl(self.rootId).render(self.ctx);
            self.nextFrame = window.requestAnimationFrame(callback, self.ctx.canvas);
          };
        }
      };
      // Add context to the global list
      contexts.push(self);
      // Provide context canvas api
      return { // Public
        start: function(rootId) {
          logDebug("canvas.start");
          if (rootId != null) {
            if (!assertType(rootId, 'string', 'canvas.start', 'rootId')) return this;
            self.rootId = rootId;
            self.nextFrame = window.requestAnimationFrame(self.callback(), self.ctx.canvas);
            self.paused = false;
          }
          return this;
        },
        pause: function() {
          logDebug("canvas.pause");
          window.cancelAnimationFrame(self.nextFrame);
          self.nextFrame = null;
          self.paused = true;
          return this;
        },
        clear: function(mask) {
          logDebug("canvas.clear");
          self.clearMask = mask;
          return this;
        },
        clearColor: function(r,g,b,a) {
          logDebug("canvas.clearColor");
          self.ctx.clearColor(r,g,b,a);
          return this;
        },
        clearDepth: function(d) {
          logDebug("canvas.clearDepth");
          self.ctx.clearDepth(d);
          return this;
        },
        clearStencil: function(s) {
          logDebug("canvas.clearStencil");
          self.ctx.clearStencil(s);
          return this;
        }
      };
    })();
  };
