var Challenger, FX, FXFactory, ResourceFactory, Shader, ShaderFactory, ShaderProgram, ShaderProgramFactory;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

ResourceFactory = (function() {

  function ResourceFactory() {
    this.cache = {};
  }

  ResourceFactory.prototype.create = function(source) {
    var full_name;
    full_name = this.instance_name(source);
    if (this.cache[full_name]) {
      return this.cache[full_name];
    } else {
      return this.cache[full_name] = this.create_new(source);
    }
  };

  ResourceFactory.prototype.free = function(instance) {
    instance.clean;
    return this.cache[instance.name] = null;
  };

  ResourceFactory.prototype.instance_name = function(source) {
    return source.name;
  };

  ResourceFactory.prototype.create_new = function(source) {};

  return ResourceFactory;

})();

Shader = (function() {

  function Shader(source) {
    var gen_uniform_regexp, parameters, uniform_regexp, uniform_src, uniforms, values, _i, _len;
    this.name = source.name;
    this.dependency = source.dependency;
    this.glsl = source.glsl;
    this.type = source.type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    gen_uniform_regexp = /uniform\s+\w+\s+\w+[^;]*/ig;
    uniform_regexp = /uniform\s+(\w+)\s+(\w+)(\s+=\s+(.*))*/i;
    uniforms = source.glsl.match(gen_uniform_regexp);
    this.parameters = [];
    if (uniforms) {
      for (_i = 0, _len = uniforms.length; _i < _len; _i++) {
        uniform_src = uniforms[_i];
        values = uniform_src.match(uniform_regexp);
        parameters = {
          name: values[2],
          setter: this.setter_for(values[1])
        };
        this.parameters.push(parameters);
      }
    }
  }

  Shader.prototype.clean = function() {
    gl.destroyShader(this.obj);
    return this.parameters = [];
  };

  Shader.prototype.uniformMatrix2 = function(location, value) {
    return gl.uniformMatrix2fv(location, value.transpose === true, value);
  };

  Shader.prototype.uniformMatrix3 = function(location, value) {
    return gl.uniformMatrix3fv(location, value.transpose === true, value);
  };

  Shader.prototype.uniformMatrix4 = function(location, value) {
    return gl.uniformMatrix4fv(location, value.transpose === true, value);
  };

  Shader.prototype.setter_for = function(typename) {
    switch (typename) {
      case "float":
        return gl.uniform1f;
      case "vec2":
        return gl.uniform2fv;
      case "vec3":
        return gl.uniform3fv;
      case "vec4":
        return gl.uniform4fv;
      case "sample2D":
      case "sampleCube":
      case "bool":
      case "int":
        return gl.uniform1i;
      case "bvec2":
      case "ivec2":
        return gl.uniform2iv;
      case "bvec3":
      case "ivec3":
        return gl.uniform3iv;
      case "bvec4":
      case "ivec4":
        return gl.uniform4iv;
      case "mat2":
        return this.uniformMatrix2;
      case "mat3":
        return this.uniformMatrix3;
      case "mat4":
        return this.uniformMatrix4;
      default:
        return null;
    }
  };

  return Shader;

})();

ShaderFactory = (function() {

  __extends(ShaderFactory, ResourceFactory);

  function ShaderFactory() {
    ShaderFactory.__super__.constructor.apply(this, arguments);
  }

  ShaderFactory.prototype.create_new = function(source) {
    return new Shader(source);
  };

  return ShaderFactory;

})();

ShaderProgram = (function() {

  function ShaderProgram(name, fx) {
    var fragmentShader, fullFragmentGLSL, fullVertexGLSL, fxSource, parameter, shaderSource, vertexShader, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3;
    this.name = name;
    fullVertexGLSL = "";
    fullFragmentGLSL = "";
    this.obj = gl.createProgram();
    for (_i = 0, _len = fx.length; _i < _len; _i++) {
      fxSource = fx[_i];
      _ref = fxSource.shaders;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        shaderSource = _ref[_j];
        if (shaderSource.type === gl.VERTEX_SHADER) {
          fullVertexGLSL += shaderSource.glsl;
        } else {
          fullFragmentGLSL += shaderSource.glsl;
        }
      }
    }
    vertexShader = this.compile(fullVertexGLSL, gl.VERTEX_SHADER);
    fragmentShader = this.compile(fullFragmentGLSL, gl.FRAGMENT_SHADER);
    gl.attachShader(this.obj, vertexShader);
    gl.attachShader(this.obj, fragmentShader);
    gl.linkProgram(this.obj);
    if (!gl.getProgramParameter(this.obj, gl.LINK_STATUS)) {
      alert("Could not initialize shaders");
    }
    this.use();
    this.uniforms = {};
    for (_k = 0, _len3 = fx.length; _k < _len3; _k++) {
      fxSource = fx[_k];
      _ref2 = fxSource.shaders;
      for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++) {
        shaderSource = _ref2[_l];
        _ref3 = shaderSource.parameters;
        for (_m = 0, _len5 = _ref3.length; _m < _len5; _m++) {
          parameter = _ref3[_m];
          this.uniforms[parameter.name] = gl.getUniformLocation(this.obj, parameter.name);
        }
      }
    }
  }

  ShaderProgram.prototype.clean = function() {
    gl.destroyProgram(this.obj);
    return this.uniforms = null;
  };

  ShaderProgram.prototype.use = function() {
    return gl.useProgram(this.obj);
  };

  ShaderProgram.prototype.compile = function(glsl, type) {
    var shader;
    shader = gl.createShader(type);
    gl.shaderSource(shader, glsl);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
    }
    return shader;
  };

  return ShaderProgram;

})();

ShaderProgramFactory = (function() {

  __extends(ShaderProgramFactory, ResourceFactory);

  function ShaderProgramFactory() {
    ShaderProgramFactory.__super__.constructor.apply(this, arguments);
  }

  ShaderProgramFactory.prototype.instance_name = function(source) {
    var name, shader, _i, _len;
    name = "";
    for (_i = 0, _len = source.length; _i < _len; _i++) {
      shader = source[_i];
      name += shader.name + "|";
    }
    return name;
  };

  ShaderProgramFactory.prototype.create_new = function(source) {
    return new ShaderProgram(this.instance_name(source), source);
  };

  return ShaderProgramFactory;

})();

FX = (function() {

  function FX(source) {
    var parameter, shader, shaderName, shaderSource, _i, _len, _len2, _ref, _ref2;
    this.title = source.name;
    this.parameters = {};
    this.shaders = [];
    _ref = source.shaders;
    for (shaderName = 0, _len = _ref.length; shaderName < _len; shaderName++) {
      shaderSource = _ref[shaderName];
      shader = engine.shaderFactory.create(shaderSource);
      _ref2 = shader.parameters;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        parameter = _ref2[_i];
        this.parameters[parameter.name] = parameter;
      }
      this.shaders.push(shader);
    }
  }

  FX.prototype.apply = function(program) {
    var parameter, parameterName, _ref, _results;
    _ref = this.parameters;
    _results = [];
    for (parameterName in _ref) {
      parameter = _ref[parameterName];
      if (parameter.value || parameter.value_func) {
        _results.push(parameter.setter(program.uniforms[parameterName], (parameter.value ? parameter.value : parameter.value_func())));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return FX;

})();

FXFactory = (function() {

  __extends(FXFactory, ResourceFactory);

  function FXFactory() {
    FXFactory.__super__.constructor.apply(this, arguments);
  }

  FXFactory.prototype.instance_name = function(source) {
    var name, shader, _i, _len, _ref;
    name = "";
    _ref = source.shaders;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      shader = _ref[_i];
      name += shader.name + "|";
    }
    return name;
  };

  FXFactory.prototype.create_new = function(source) {
    return new FX(source);
  };

  return FXFactory;

})();

Challenger = (function() {

  function Challenger() {
    this.shaderFactory = new ShaderFactory;
    this.shaderProgramFactory = new ShaderProgramFactory;
    this.FXFactory = new FXFactory;
  }

  return Challenger;

})();
