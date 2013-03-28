  var triggerContextEvents = function(fns, event) {
    for (var i = 0; i < fns.length; ++i)
      if (fns[i][1])
        fns[i][0](event);
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
      triggerContextEvents(eventFns.contextlost, event);
      // Cancel rendering on all canvases that use request animation frame via
      // gl.canvas(...).start().
      for (i = 0; i < contexts.length; ++i) {
        var context = contexts[i];
        if (context.glContext.canvas !== canvasEl)
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
      triggerContextEvents(eventFns.contextrestored, event);
      // Resume rendering on all contexts that have not explicitly been suspended
      // via gl.canvas(...).suspend().
      for (i = 0; i < contexts.length; ++i) {
        var context = contexts[i];
        if (context.glContext.canvas !== canvasEl)
          continue;
        if (context.nextFrame == null && context.suspended === false)
          window.requestAnimationFrame(context.fn(), context.glContext.canvas);
        break;
      }
    }, false);

    canvasEl.addEventListener("webglcontextcreationerror", function(event) {
      triggerContextEvents(eventFns.contextcreationerror, event);
    }, false);

    // Wrap glQuery canvas
    extAPI = {};
    canvasFn = (function() { 
      var self = { // Private
        glContext: canvasCtx,
        rootId: null,
        nextFrame: null,
        suspended: true,
        clearMask: gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
        fnLoop: function() {
          self = this;
          return function fnLoop() {
            if (self.glContext.isContextLost())
              return; // Ensure rendering does not continue if context is lost
            self.glContext.clear(self.clearMask);
            gl(self.rootId).render(self.glContext);
            self.nextFrame = window.requestAnimationFrame(fn, self.glContext.canvas);
          };
        }
      };
      // Add context to the global list
      contexts.push(self);
      // Provide context canvas api
      api = { // Public
        start: function(rootId) {
          logDebug("canvas.start");
          if (rootId != null) {
            if (!assertType(rootId, 'string', 'canvas.start', 'rootId')) return this;
            self.rootId = rootId;
            self.nextFrame = window.requestAnimationFrame(self.fnLoop(), self.glContext.canvas);
            self.suspended = false;
          }
          return this;
        },
        suspend: function() {
          logDebug("canvas.suspend");
          window.cancelAnimationFrame(self.suspend);
          self.nextFrame = null;
          self.suspended = true;
          return this;
        },
        clear: function(mask) {
          logDebug("canvas.clear");
          self.clearMask = mask;
          return this;
        },
        clearColor: function(r,g,b,a) {
          logDebug("canvas.clearColor");
          self.glContext.clearColor(r,g,b,a);
          return this;
        },
        clearDepth: function(d) {
          logDebug("canvas.clearDepth");
          self.glContext.clearDepth(d);
          return this;
        },
        clearStencil: function(s) {
          logDebug("canvas.clearStencil");
          self.glContext.clearStencil(s);
          return this;
        }
      };
      for (k in extAPI)
        if (!(k in api)) // Don't override the base api
          api[k] = extAPI[k](self);
      return api;
    })();
    canvasFn.extend = function(name, fn) {
      logDebug("canvas.extend (" + name + ")");
      if (!assertType(name, 'string', 'canvas.extend', 'name')) return this;
      if (!assertType(fn, 'function', 'canvas.extend', 'fn')) return this;
      extAPI[name] = fn;
      return canvasFn;
    };
    return canvasFn;
  };
