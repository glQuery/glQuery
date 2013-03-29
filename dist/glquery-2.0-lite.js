/*
 * glQuery - A fluent WebGL engine (https://github.com/glQuery)
 * glQuery is free, public domain software (http://creativecommons.org/publicdomain/zero/1.0/)
 * Originally created by Rehno Lindeque of http://www.mischievousmeerkat.com
 */
var glQuery = (function() {
"use strict";

  // Define a local copy of glQuery
  var gl = function(selector) {
    return gl.fn.init(selector);
  },
  debugLevel = 0,
  // The scenes, each of which contains a hierarchy of identifiers
  scenes = {},
  // Commands to be executed
  // TODO: Should commands be associated with a specific scene id?
  commands = [],
  // Commands associated with a tag
  tagCommands = {},
  // Tags for which commands have been dispatched that affect the state hashes
  dirtyTags = [],
  // All shader definitions
  shaders = {},
  // All shader uniform and attribute locations
  shaderLocations = {},
  // Counters for identifiers
  shaderProgramCounter = 0,
  // WebGL contexts
  contexts = [],
  // Event callbacks
  eventFns = { 
    contextlost: [], 
    contextrestored: [], 
    contextcreationerror: [] 
  },
  // Logging / information methods
  logDebug = ((!(debugLevel > 0))? function(){} :
    (debugLevel === 1)? function(msg) { console.debug("glQuery:", msg); } :
    function() { console.debug.apply(console, ["glQuery:"].concat(Array.prototype.slice.call(arguments))); }),
  logInfo = function(msg) { console.log("glQuery:", msg); },
  logWarning = function(msg) { console.warn("glQuery:", msg); },
  logError = function(msg) { console.error("glQuery:", msg); },
  logApiError = function(func,msg) { console.error("glQuery:", "In call to '" + func + "', " + msg); },
  // Run-time checks
  // TODO: Should we provide checks that throw exceptions rather than logging messages?
  assert = function(condition, msg) { if (!condition) logError(msg); return condition; },
  assertType = function(param, typeStr, parentFunction, paramStr) {
    if (paramStr != null && parentFunction != null)
      return assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else if (parentFunction != null)
      return assert(typeof param === typeStr, "In call to '" + parentFunction + "', expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
    else if (paramStr != null)
      return assert(typeof param === typeStr, "Expected type '" + typeStr + "' for '" + paramStr + "'. Instead, got type '" + typeof param + "'.");
    else
      return assert(typeof param === typeStr, "Expected type '" + typeStr + "'. Instead, got type '" + typeof param + "'.");
  },
  assertNumberOfArguments = function(args, minNumber, parentFunction) {
    if (parentFunction != null)
      return assert(args.length >= minNumber, "In call to '" + parentFunction + "', expected at least " + minNumber + " arguments. Instead, got " + args.length + ".");
    else
      return assert(args.length >= minNumber, "Expected at least " + minNumber + " arguments. Instead, got " + args.length + ".");
  },
  assertInternal = assert,
  // The last identifer number that was generated automatically
  lastId = 0,
  // Automatically generate a new object identifier
  generateId = function() { var r = '__glq__' + lastId; ++lastId; return r; },
  // Generate a key-value map for the given nodes and id's for anonymous nodes
  normalizeNodes = function(nodes) {
    if (Array.isArray(nodes)) {
      // Automatically generate a parent id and normalize all child nodes
      var resultNodes = [];
      resultNodes.hashes = {};
      resultNodes.lastUpdate = 0;
      for (var i = 0; i < nodes.length; ++i) {
        var resultNode = normalizeNodes(nodes[i])
        if (Array.isArray(nodes)) {
          // Don't nest arrays, generate a new id for the node instead
          var obj = {};
          obj[generateId()] = resultNodes;
          resultNodes.push(obj);
        }
        if (resultNode != null)
          resultNodes.push(resultNode);
        else
          // TODO: In call to either scene or insert....
          logApiError('scene', "could not normalize the node with type '" + (typeof nodes[i]) + "'.");
      }
      return resultNodes;
    }
    switch (typeof nodes) {
      case 'string':
        // Make sure tags have a commands stack associated (so that hashes do not need to be rebuilt when non-hashed commands are added to empty tags)
        var tags = nodes.split(' ');
        for (var i = 0; i < tags.length; ++i)
          if (typeof tagCommands[tags[i]] === 'undefined')
            tagCommands[tags[i]] = new Array(commandEval.length);
        return nodes;
      case 'number':
        var str = String(nodes);
        // Make sure tags have a commands stack associated (so that hashes do not need to be rebuilt when non-hashed commands are added to empty tags)
        if (typeof tagCommands[str] === 'undefined')
          tagCommands[str] = new Array(commandEval.length);
        return str;
      case 'object':
        var result = {};
        // TODO: normalize key-value pairs
        for (var key in nodes) {
          if (key === 'prototype') {
            logError("The given nodes contain a 'prototype' object. ");
            continue;
          }
          normalizeNodes(key);
          var node = normalizeNodes(nodes[key]);
          if (Array.isArray(node))
            result[key] = node;
          else {
            var n = (node != null? [node] : []);
            n.hashes = {};
            n.lastUpdate = 0;
            result[key] = n;
          }
        }
        return result;
    }
  };

  // Cross-browser initialization
  window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(fn, element){ window.setTimeout(fn, 1000 / 60); };
  })();

  window.cancelRequestAnimationFrame = (function(){
    return window.cancelRequestAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || window.clearTimeout;
  })();

  var webglTypeSize = [
    1, // BYTE
    1, // UNSIGNED_BYTE
    2, // SHORT
    2, // UNSIGNED_SHORT
    4, // INT
    4, // UNSIGNED_INT
    4  // FLOAT
  ];


  // WebGL constants

  /* Even though any instance of a WebGL context provides these constants, we
     provide static list WebGL constants here directly. These constants are
     taken directly from the WebGL specifications document, so they are
     guaranteed to be correct in every compliant implementation.

     This approach has many advantages:
     * Decouple graphics operations from the context used to draw them
       (For example, we'd like to use these constants in web workers which are
       completely issolated from the WebGL context.)
     * Directly reuse constants from WebGL rather than laboriously maintaining
       shim constants with the exact same functionality.
     * Reuse well-documented constants that are already familiar to all OpenGL
       programmers (principle of least suprise).
     * Easily extend glQuery with new plugins and commands.
     * Provide constants for extensions even when they are not available in the
       implementation. This is far less error-prone than manually checking for
       every constant's existence.
     * Reduce the amount of state that needs to be carried around.
     * Emulating WebGL using a different type of context (e.g. 2d canvas) is
       easier if all the constants are available. WebGL provides what we need
       and we need what WebGL provides.
  */
  
  /* ClearBufferMask */
  gl.DEPTH_BUFFER_BIT               = 0x00000100;
  gl.STENCIL_BUFFER_BIT             = 0x00000400;
  gl.COLOR_BUFFER_BIT               = 0x00004000;
  
  /* BeginMode */
  gl.POINTS                         = 0x0000;
  gl.LINES                          = 0x0001;
  gl.LINE_LOOP                      = 0x0002;
  gl.LINE_STRIP                     = 0x0003;
  gl.TRIANGLES                      = 0x0004;
  gl.TRIANGLE_STRIP                 = 0x0005;
  gl.TRIANGLE_FAN                   = 0x0006;
  
  /* AlphaFunction (not supported in ES20) */
  /*      NEVER */
  /*      LESS */
  /*      EQUAL */
  /*      LEQUAL */
  /*      GREATER */
  /*      NOTEQUAL */
  /*      GEQUAL */
  /*      ALWAYS */
  
  /* BlendingFactorDest */
  gl.ZERO                           = 0;
  gl.ONE                            = 1;
  gl.SRC_COLOR                      = 0x0300;
  gl.ONE_MINUS_SRC_COLOR            = 0x0301;
  gl.SRC_ALPHA                      = 0x0302;
  gl.ONE_MINUS_SRC_ALPHA            = 0x0303;
  gl.DST_ALPHA                      = 0x0304;
  gl.ONE_MINUS_DST_ALPHA            = 0x0305;
  
  /* BlendingFactorSrc */
  /*      ZERO */
  /*      ONE */
  gl.DST_COLOR                      = 0x0306;
  gl.ONE_MINUS_DST_COLOR            = 0x0307;
  gl.SRC_ALPHA_SATURATE             = 0x0308;
  /*      SRC_ALPHA */
  /*      ONE_MINUS_SRC_ALPHA */
  /*      DST_ALPHA */
  /*      ONE_MINUS_DST_ALPHA */
  
  /* BlendEquationSeparate */
  gl.FUNC_ADD                       = 0x8006;
  gl.BLEND_EQUATION                 = 0x8009;
  gl.BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
  gl.BLEND_EQUATION_ALPHA           = 0x883D;
  
  /* BlendSubtract */
  gl.FUNC_SUBTRACT                  = 0x800A;
  gl.FUNC_REVERSE_SUBTRACT          = 0x800B;
  
  /* Separate Blend Functions */
  gl.BLEND_DST_RGB                  = 0x80C8;
  gl.BLEND_SRC_RGB                  = 0x80C9;
  gl.BLEND_DST_ALPHA                = 0x80CA;
  gl.BLEND_SRC_ALPHA                = 0x80CB;
  gl.CONSTANT_COLOR                 = 0x8001;
  gl.ONE_MINUS_CONSTANT_COLOR       = 0x8002;
  gl.CONSTANT_ALPHA                 = 0x8003;
  gl.ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
  gl.BLEND_COLOR                    = 0x8005;
  
  /* Buffer Objects */
  gl.ARRAY_BUFFER                   = 0x8892;
  gl.ELEMENT_ARRAY_BUFFER           = 0x8893;
  gl.ARRAY_BUFFER_BINDING           = 0x8894;
  gl.ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;
  
  gl.STREAM_DRAW                    = 0x88E0;
  gl.STATIC_DRAW                    = 0x88E4;
  gl.DYNAMIC_DRAW                   = 0x88E8;
  
  gl.BUFFER_SIZE                    = 0x8764;
  gl.BUFFER_USAGE                   = 0x8765;
  
  gl.CURRENT_VERTEX_ATTRIB          = 0x8626;
  
  /* CullFaceMode */
  gl.FRONT                          = 0x0404;
  gl.BACK                           = 0x0405;
  gl.FRONT_AND_BACK                 = 0x0408;
  
  /* DepthFunction */
  /*      NEVER */
  /*      LESS */
  /*      EQUAL */
  /*      LEQUAL */
  /*      GREATER */
  /*      NOTEQUAL */
  /*      GEQUAL */
  /*      ALWAYS */
  
  /* EnableCap */
  /* TEXTURE_2D */
  gl.CULL_FACE                      = 0x0B44;
  gl.BLEND                          = 0x0BE2;
  gl.DITHER                         = 0x0BD0;
  gl.STENCIL_TEST                   = 0x0B90;
  gl.DEPTH_TEST                     = 0x0B71;
  gl.SCISSOR_TEST                   = 0x0C11;
  gl.POLYGON_OFFSET_FILL            = 0x8037;
  gl.SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
  gl.SAMPLE_COVERAGE                = 0x80A0;
  
  /* ErrorCode */
  gl.NO_ERROR                       = 0;
  gl.INVALID_ENUM                   = 0x0500;
  gl.INVALID_VALUE                  = 0x0501;
  gl.INVALID_OPERATION              = 0x0502;
  gl.OUT_OF_MEMORY                  = 0x0505;
  
  /* FrontFaceDirection */
  gl.CW                             = 0x0900;
  gl.CCW                            = 0x0901;
  
  /* GetPName */
  gl.LINE_WIDTH                     = 0x0B21;
  gl.ALIASED_POINT_SIZE_RANGE       = 0x846D;
  gl.ALIASED_LINE_WIDTH_RANGE       = 0x846E;
  gl.CULL_FACE_MODE                 = 0x0B45;
  gl.FRONT_FACE                     = 0x0B46;
  gl.DEPTH_RANGE                    = 0x0B70;
  gl.DEPTH_WRITEMASK                = 0x0B72;
  gl.DEPTH_CLEAR_VALUE              = 0x0B73;
  gl.DEPTH_FUNC                     = 0x0B74;
  gl.STENCIL_CLEAR_VALUE            = 0x0B91;
  gl.STENCIL_FUNC                   = 0x0B92;
  gl.STENCIL_FAIL                   = 0x0B94;
  gl.STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
  gl.STENCIL_PASS_DEPTH_PASS        = 0x0B96;
  gl.STENCIL_REF                    = 0x0B97;
  gl.STENCIL_VALUE_MASK             = 0x0B93;
  gl.STENCIL_WRITEMASK              = 0x0B98;
  gl.STENCIL_BACK_FUNC              = 0x8800;
  gl.STENCIL_BACK_FAIL              = 0x8801;
  gl.STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
  gl.STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
  gl.STENCIL_BACK_REF               = 0x8CA3;
  gl.STENCIL_BACK_VALUE_MASK        = 0x8CA4;
  gl.STENCIL_BACK_WRITEMASK         = 0x8CA5;
  gl.VIEWPORT                       = 0x0BA2;
  gl.SCISSOR_BOX                    = 0x0C10;
  /*      SCISSOR_TEST */
  gl.COLOR_CLEAR_VALUE              = 0x0C22;
  gl.COLOR_WRITEMASK                = 0x0C23;
  gl.UNPACK_ALIGNMENT               = 0x0CF5;
  gl.PACK_ALIGNMENT                 = 0x0D05;
  gl.MAX_TEXTURE_SIZE               = 0x0D33;
  gl.MAX_VIEWPORT_DIMS              = 0x0D3A;
  gl.SUBPIXEL_BITS                  = 0x0D50;
  gl.RED_BITS                       = 0x0D52;
  gl.GREEN_BITS                     = 0x0D53;
  gl.BLUE_BITS                      = 0x0D54;
  gl.ALPHA_BITS                     = 0x0D55;
  gl.DEPTH_BITS                     = 0x0D56;
  gl.STENCIL_BITS                   = 0x0D57;
  gl.POLYGON_OFFSET_UNITS           = 0x2A00;
  /*      POLYGON_OFFSET_FILL */
  gl.POLYGON_OFFSET_FACTOR          = 0x8038;
  gl.TEXTURE_BINDING_2D             = 0x8069;
  gl.SAMPLE_BUFFERS                 = 0x80A8;
  gl.SAMPLES                        = 0x80A9;
  gl.SAMPLE_COVERAGE_VALUE          = 0x80AA;
  gl.SAMPLE_COVERAGE_INVERT         = 0x80AB;
  
  /* GetTextureParameter */
  /*      TEXTURE_MAG_FILTER */
  /*      TEXTURE_MIN_FILTER */
  /*      TEXTURE_WRAP_S */
  /*      TEXTURE_WRAP_T */
  
  gl.NUM_COMPRESSED_TEXTURE_FORMATS = 0x86A2;
  gl.COMPRESSED_TEXTURE_FORMATS     = 0x86A3;
  
  /* HintMode */
  gl.DONT_CARE                      = 0x1100;
  gl.FASTEST                        = 0x1101;
  gl.NICEST                         = 0x1102;
  
  /* HintTarget */
  gl.GENERATE_MIPMAP_HINT            = 0x8192;
  
  /* DataType */
  gl.BYTE                           = 0x1400;
  gl.UNSIGNED_BYTE                  = 0x1401;
  gl.SHORT                          = 0x1402;
  gl.UNSIGNED_SHORT                 = 0x1403;
  gl.INT                            = 0x1404;
  gl.UNSIGNED_INT                   = 0x1405;
  gl.FLOAT                          = 0x1406;
  
  /* PixelFormat */
  gl.DEPTH_COMPONENT                = 0x1902;
  gl.ALPHA                          = 0x1906;
  gl.RGB                            = 0x1907;
  gl.RGBA                           = 0x1908;
  gl.LUMINANCE                      = 0x1909;
  gl.LUMINANCE_ALPHA                = 0x190A;
  
  /* PixelType */
  /*      UNSIGNED_BYTE */
  gl.UNSIGNED_SHORT_4_4_4_4         = 0x8033;
  gl.UNSIGNED_SHORT_5_5_5_1         = 0x8034;
  gl.UNSIGNED_SHORT_5_6_5           = 0x8363;
  
  /* Shaders */
  gl.FRAGMENT_SHADER                  = 0x8B30;
  gl.VERTEX_SHADER                    = 0x8B31;
  gl.MAX_VERTEX_ATTRIBS               = 0x8869;
  gl.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
  gl.MAX_VARYING_VECTORS              = 0x8DFC;
  gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
  gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
  gl.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
  gl.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
  gl.SHADER_TYPE                      = 0x8B4F;
  gl.DELETE_STATUS                    = 0x8B80;
  gl.LINK_STATUS                      = 0x8B82;
  gl.VALIDATE_STATUS                  = 0x8B83;
  gl.ATTACHED_SHADERS                 = 0x8B85;
  gl.ACTIVE_UNIFORMS                  = 0x8B86;
  gl.ACTIVE_ATTRIBUTES                = 0x8B89;
  gl.SHADING_LANGUAGE_VERSION         = 0x8B8C;
  gl.CURRENT_PROGRAM                  = 0x8B8D;
  
  /* StencilFunction */
  gl.NEVER                          = 0x0200;
  gl.LESS                           = 0x0201;
  gl.EQUAL                          = 0x0202;
  gl.LEQUAL                         = 0x0203;
  gl.GREATER                        = 0x0204;
  gl.NOTEQUAL                       = 0x0205;
  gl.GEQUAL                         = 0x0206;
  gl.ALWAYS                         = 0x0207;
  
  /* StencilOp */
  /*      ZERO */
  gl.KEEP                           = 0x1E00;
  gl.REPLACE                        = 0x1E01;
  gl.INCR                           = 0x1E02;
  gl.DECR                           = 0x1E03;
  gl.INVERT                         = 0x150A;
  gl.INCR_WRAP                      = 0x8507;
  gl.DECR_WRAP                      = 0x8508;
  
  /* StringName */
  gl.VENDOR                         = 0x1F00;
  gl.RENDERER                       = 0x1F01;
  gl.VERSION                        = 0x1F02;
  
  /* TextureMagFilter */
  gl.NEAREST                        = 0x2600;
  gl.LINEAR                         = 0x2601;
  
  /* TextureMinFilter */
  /*      NEAREST */
  /*      LINEAR */
  gl.NEAREST_MIPMAP_NEAREST         = 0x2700;
  gl.LINEAR_MIPMAP_NEAREST          = 0x2701;
  gl.NEAREST_MIPMAP_LINEAR          = 0x2702;
  gl.LINEAR_MIPMAP_LINEAR           = 0x2703;
  
  /* TextureParameterName */
  gl.TEXTURE_MAG_FILTER             = 0x2800;
  gl.TEXTURE_MIN_FILTER             = 0x2801;
  gl.TEXTURE_WRAP_S                 = 0x2802;
  gl.TEXTURE_WRAP_T                 = 0x2803;
  
  /* TextureTarget */
  gl.TEXTURE_2D                     = 0x0DE1;
  gl.TEXTURE                        = 0x1702;
  
  gl.TEXTURE_CUBE_MAP               = 0x8513;
  gl.TEXTURE_BINDING_CUBE_MAP       = 0x8514;
  gl.TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
  gl.TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
  gl.TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
  gl.TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
  gl.TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
  gl.TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
  gl.MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;
  
  /* TextureUnit */
  gl.TEXTURE0                       = 0x84C0;
  gl.TEXTURE1                       = 0x84C1;
  gl.TEXTURE2                       = 0x84C2;
  gl.TEXTURE3                       = 0x84C3;
  gl.TEXTURE4                       = 0x84C4;
  gl.TEXTURE5                       = 0x84C5;
  gl.TEXTURE6                       = 0x84C6;
  gl.TEXTURE7                       = 0x84C7;
  gl.TEXTURE8                       = 0x84C8;
  gl.TEXTURE9                       = 0x84C9;
  gl.TEXTURE10                      = 0x84CA;
  gl.TEXTURE11                      = 0x84CB;
  gl.TEXTURE12                      = 0x84CC;
  gl.TEXTURE13                      = 0x84CD;
  gl.TEXTURE14                      = 0x84CE;
  gl.TEXTURE15                      = 0x84CF;
  gl.TEXTURE16                      = 0x84D0;
  gl.TEXTURE17                      = 0x84D1;
  gl.TEXTURE18                      = 0x84D2;
  gl.TEXTURE19                      = 0x84D3;
  gl.TEXTURE20                      = 0x84D4;
  gl.TEXTURE21                      = 0x84D5;
  gl.TEXTURE22                      = 0x84D6;
  gl.TEXTURE23                      = 0x84D7;
  gl.TEXTURE24                      = 0x84D8;
  gl.TEXTURE25                      = 0x84D9;
  gl.TEXTURE26                      = 0x84DA;
  gl.TEXTURE27                      = 0x84DB;
  gl.TEXTURE28                      = 0x84DC;
  gl.TEXTURE29                      = 0x84DD;
  gl.TEXTURE30                      = 0x84DE;
  gl.TEXTURE31                      = 0x84DF;
  gl.ACTIVE_TEXTURE                 = 0x84E0;
  
  /* TextureWrapMode */
  gl.REPEAT                         = 0x2901;
  gl.CLAMP_TO_EDGE                  = 0x812F;
  gl.MIRRORED_REPEAT                = 0x8370;
  
  /* Uniform Types */
  gl.FLOAT_VEC2                     = 0x8B50;
  gl.FLOAT_VEC3                     = 0x8B51;
  gl.FLOAT_VEC4                     = 0x8B52;
  gl.INT_VEC2                       = 0x8B53;
  gl.INT_VEC3                       = 0x8B54;
  gl.INT_VEC4                       = 0x8B55;
  gl.BOOL                           = 0x8B56;
  gl.BOOL_VEC2                      = 0x8B57;
  gl.BOOL_VEC3                      = 0x8B58;
  gl.BOOL_VEC4                      = 0x8B59;
  gl.FLOAT_MAT2                     = 0x8B5A;
  gl.FLOAT_MAT3                     = 0x8B5B;
  gl.FLOAT_MAT4                     = 0x8B5C;
  gl.SAMPLER_2D                     = 0x8B5E;
  gl.SAMPLER_CUBE                   = 0x8B60;
  
  /* Vertex Arrays */
  gl.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
  gl.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
  gl.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
  gl.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
  gl.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
  gl.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
  gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;
  
  /* Shader Source */
  gl.COMPILE_STATUS                 = 0x8B81;
  
  /* Shader Precision-Specified Types */
  gl.LOW_FLOAT                      = 0x8DF0;
  gl.MEDIUM_FLOAT                   = 0x8DF1;
  gl.HIGH_FLOAT                     = 0x8DF2;
  gl.LOW_INT                        = 0x8DF3;
  gl.MEDIUM_INT                     = 0x8DF4;
  gl.HIGH_INT                       = 0x8DF5;
  
  /* Framebuffer Object. */
  gl.FRAMEBUFFER                    = 0x8D40;
  gl.RENDERBUFFER                   = 0x8D41;
  
  gl.RGBA4                          = 0x8056;
  gl.RGB5_A1                        = 0x8057;
  gl.RGB565                         = 0x8D62;
  gl.DEPTH_COMPONENT16              = 0x81A5;
  gl.STENCIL_INDEX                  = 0x1901;
  gl.STENCIL_INDEX8                 = 0x8D48;
  gl.DEPTH_STENCIL                  = 0x84F9;
  
  gl.RENDERBUFFER_WIDTH             = 0x8D42;
  gl.RENDERBUFFER_HEIGHT            = 0x8D43;
  gl.RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
  gl.RENDERBUFFER_RED_SIZE          = 0x8D50;
  gl.RENDERBUFFER_GREEN_SIZE        = 0x8D51;
  gl.RENDERBUFFER_BLUE_SIZE         = 0x8D52;
  gl.RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
  gl.RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
  gl.RENDERBUFFER_STENCIL_SIZE      = 0x8D55;
  
  gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
  gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
  gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
  gl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;
  
  gl.COLOR_ATTACHMENT0              = 0x8CE0;
  gl.DEPTH_ATTACHMENT               = 0x8D00;
  gl.STENCIL_ATTACHMENT             = 0x8D20;
  gl.DEPTH_STENCIL_ATTACHMENT       = 0x821A;
  
  gl.NONE                           = 0;
  
  gl.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
  gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
  gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
  gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
  gl.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;
  
  gl.FRAMEBUFFER_BINDING            = 0x8CA6;
  gl.RENDERBUFFER_BINDING           = 0x8CA7;
  gl.MAX_RENDERBUFFER_SIZE          = 0x84E8;
  
  gl.INVALID_FRAMEBUFFER_OPERATION  = 0x0506;
  
  /* WebGL-specific enums */
  gl.UNPACK_FLIP_Y_WEBGL            = 0x9240;
  gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
  gl.CONTEXT_LOST_WEBGL             = 0x9242;
  gl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
  gl.BROWSER_DEFAULT_WEBGL          = 0x9244;


  gl.update = function() {
    return commands.length > 0;
  };

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
    if (!assert(typeof selector === 'string' || (typeof selector === 'object' && selector.nodeName !== 'CANVAS'), "In call to 'canvas', expected type 'string', 'undefined' or 'canvas element' for 'selector'. Instead, got type '" + typeof selector + "'."))
      return dummy;
    canvasEl = typeof selector === 'object'? selector : document.querySelector(selector);
    if (!assert(canvasEl != null && typeof canvasEl === 'object' && canvasEl.nodeName === 'CANVAS', "In call to 'canvas', could not initialize canvas element."))
      return dummy;
    if (typeof selector === 'string')
      logInfo("Initialized canvas: " + selector);
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
    return (function() { 
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
      var api = { // Public
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
      for (k in canvasExtAPI)
        if (!(k in api)) // Don't override the base api
          api[k] = canvasExtAPI[k](self);
      return api;
    })();
  };

  gl.canvas.extend = function(name, fn) {
    logDebug("canvas.extend (" + name + ")");
    if (!assertType(name, 'string', 'canvas.extend', 'name')) return this;
    if (!assertType(fn, 'function', 'canvas.extend', 'fn')) return this;
    canvasExtAPI[name] = fn;
    return canvasFn;
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


  // Export glQuery to a CommonJS module if exports is available
  if (typeof(exports) !== "undefined" && exports !== null)
    exports.glQuery = gl;
  return gl;
})();

