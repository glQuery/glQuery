  var triggerContextEvents = function(fns, event) {
    for (var i = 0; i < fns.length; ++i)
      if (fns[i][1])
        fns[i][0](event);
  };

  // Initialize a WebGL canvas
  var canvasExtAPI = {};
  gl.canvas = function(selector, contextAttr) {
    var canvasEl, domAttr = domAttr != null? domAttr : {};
    logDebug("canvas");
    var dummy = {
      start: function() { return this; },
      clear: function() { return this; },
      clearColor: function() { return this; },
      clearDepth: function() { return this; },
      clearStencil: function() { return this; }
    };
    // Get existing canvas element
    if (!assert(typeof selector === 'string' || (typeof selector === 'object' && (selector.nodeName === 'CANVAS' || selector instanceof WebGLRenderingContext)), "In call to 'canvas', expected type 'string', 'undefined' or 'canvas element' for 'selector'. Instead, got type '" + typeof selector + "'."))
      return dummy;
    canvasEl = typeof selector === 'object'? (selector instanceof WebGLRenderingContext? selector.canvas : selector) : document.querySelector(selector);
    if (!assert(canvasEl != null && typeof canvasEl === 'object' && canvasEl.nodeName === 'CANVAS', "In call to 'canvas', could not initialize canvas element."))
      return dummy;
    if (typeof selector === 'string')
      logInfo("Initialized canvas: " + selector);
    else
      logInfo("Initialized canvas");

    // Initialize the WebGL context
    var canvasCtx = selector instanceof WebGLRenderingContext? selector : canvasEl.getContext('experimental-webgl', contextAttr);
    if (!assert(canvasCtx != null, "Could not get a 'experimental-webgl' context."))
      return dummy;

    // Wrap glQuery canvas
    var wrapCanvasAPI = function(self) {
      var api = { // Public
        start: function(rootId, fnPre, fnPost, fnIdle) {
          logDebug("canvas.start");
          if (rootId != null) {
            if (!assertType(rootId, 'string', 'canvas.start', 'rootId')) return this;
            self.rootId = rootId;
            self.fnPre = typeof fnPre === 'function'? fnPre : null;
            self.fnPost = typeof fnPost === 'function'? fnPost : null;
            self.fnIdle = typeof fnIdle === 'function'? fnIdle : null;
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
        },
        viewport: function(x, y, width, height) {
          logDebug("canvas.viewport");
          self.glContext.viewport(x, y, width, height);
          return this;
        }
      };
      for (var k in canvasExtAPI)
        if (!(k in api)) // Don't override the base api
          api[k] = canvasExtAPI[k](self);
      return api;
    };

    // Add an identifying index to the context
    if (typeof canvasCtx._glquery_id !== 'undefined')
      return wrapCanvasAPI(canvases[canvasCtx._glquery_id]);

    canvasCtx._glquery_id = contextCounter;
    contexts[canvasCtx._glquery_id] = canvasCtx;
    ++contextCounter;    

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
          window.requestAnimationFrame(context.fnLoop(), context.glContext.canvas);
        break;
      }
    }, false);

    canvasEl.addEventListener("webglcontextcreationerror", function(event) {
      triggerContextEvents(eventFns.contextcreationerror, event);
    }, false);
    
    // Add context to the global list
    canvases[canvasCtx._glquery_id] = {
      glContext: canvasCtx,
      rootId: null,
      nextFrame: null,
      suspended: true,
      clearMask: gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
      fnPre: null,
      fnPost: null,
      fnIdle: null,
      fnLoop: function() {
        self = this;
        return function fnLoop() {
          if (self.glContext.isContextLost())
            return; // Ensure rendering does not continue if context is lost
          if (gl.update()) {
            if (self.fnPre) self.fnPre();
            self.glContext.clear(self.clearMask);
            gl(self.rootId).render(self.glContext);
            if (self.fnPost) self.fnPost();
          }
          else if (self.fnIdle) self.fnIdle();
          self.nextFrame = window.requestAnimationFrame(fnLoop, self.glContext.canvas);
        };
      }
    };
    return wrapCanvasAPI(canvases[canvasCtx._glquery_id]);
  };

  gl.canvas.extend = function(name, fn) {
    logDebug("canvas.extend (" + name + ")");
    if (!assertType(name, 'string', 'canvas.extend', 'name')) return this;
    if (!assertType(fn, 'function', 'canvas.extend', 'fn')) return this;
    canvasExtAPI[name] = fn;
    return gl.canvas;
  };

  gl.canvas.create = function(id, contextAttr, domAttr) {
    logDebug("canvas.create (#" + id + ")");
    var id = (id == null)? 'glqueryCanvas' : id;
    if (!assertType(id, 'string', 'canvas.create', 'id')) return this;
    var newDomAttr = { id: id, width: 800, height: 800 };
    for (var k in domAttr)
      newDomAttr[k] = domAttr[k];
    var canvasEl = document.createElement('canvas');
    Object.keys(newDomAttr).map(function(k){ canvasEl.setAttribute(k, newDomAttr[k]); }).join(' ');    
    document.write(canvasEl.outerHTML);
    return gl.canvas("#" + id, contextAttr);
  };
