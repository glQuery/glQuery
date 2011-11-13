  // Initialize a webgl canvas
  gl.canvas = function(htmlCanvas, contextAttr, width, height) {
    var canvasId, canvasEl;
    logDebug("canvas");
    if (typeof htmlCanvas === 'undefined') {
      // Create canvas element
      canvasId = 'glqueryCanvas';
      document.write("<canvas id='" + canvasId + "' width='" + (width != null? width : 800) + "' height='" + (height != null? height : 800) + "'></canvas>");
      canvasEl = document.getElementById(canvasId);
    }
    else {
      // Get existing canvas element
      assert(typeof htmlCanvas === 'string' || (typeof htmlCanvas === 'object' && htmlCanvas.nodeName !== 'CANVAS'), "In call to 'canvas', expected type 'string', 'undefined' or 'canvas element' for 'htmlCanvas'. Instead, got type '" + typeof htmlCanvas + "'.");
      canvasId = typeof htmlCanvas === 'string'? htmlCanvas : htmlCanvas.id;
      canvasEl = typeof htmlCanvas === 'object'? htmlCanvas : document.getElementById(canvasId);
    }
    assert(canvasEl != null && typeof canvasEl === 'object' && canvasEl.nodeName === 'CANVAS', "In call to 'canvas', could not initialize canvas element.");
    if (canvasId != null)
      logInfo("Initialized canvas: " + canvasId);
    else
      logInfo("Initialized canvas");
    // Initialize the WebGL context
    var canvasCtx = canvasEl.getContext('experimental-webgl', contextAttr);
    if (!canvasCtx)
      assert(false, "Could not get a 'experimental-webgl' context.");

    // Wrap glQuery canvas
    return (function() { 
      var self = { // Private
        ctx: canvasCtx,
        rootId: null,
        nextFrame: null,
        callback: function() {
          self = this;
          return function callback() {
            gl(self.rootId).render(self.ctx);
            self.nextFrame = window.requestAnimationFrame(callback, self.ctx.canvas);
          };
        }
      };
      return { // Public
        start: function(rootId) {
          logDebug("canvas.start");
          if (rootId != null) {
            assertType(rootId, 'string', 'canvas.start', 'rootId');
            self.rootId = rootId;
            self.nextFrame = window.requestAnimationFrame(self.callback(), self.ctx.canvas);
          }
          return this;
        },
        clear: function(mask) {
          logDebug("canvas.clear");

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
