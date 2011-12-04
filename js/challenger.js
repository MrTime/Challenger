var Challenger, FX, ResourceFactory, Shader, ShaderFactory, ShaderProgram, ShaderProgramFactory,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

  function ShaderProgram(name, shaders) {
    var fragmentShader, fullFragmentGLSL, fullVertexGLSL, parameter, shader, shaderSource, vertexShader, _i, _j, _k, _len, _len2, _len3, _ref;
    this.name = name;
    fullVertexGLSL = "";
    fullFragmentGLSL = "";
    this.obj = gl.createProgram();
    for (_i = 0, _len = shaders.length; _i < _len; _i++) {
      shaderSource = shaders[_i];
      if (shaderSource.type === gl.VERTEX_SHADER) {
        fullVertexGLSL += shaderSource.glsl;
      } else {
        fullFragmentGLSL += shaderSource.glsl;
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
    for (_j = 0, _len2 = shaders.length; _j < _len2; _j++) {
      shader = shaders[_j];
      _ref = shader.parameters;
      for (_k = 0, _len3 = _ref.length; _k < _len3; _k++) {
        parameter = _ref[_k];
        this.uniforms[parameter.name] = gl.getUniformLocation(this.obj, parameter.name);
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
    var parameters, shader, shaderName, shaderSource, _len, _ref;
    this.title = source.name;
    this.parameters = {};
    this.shaders = {};
    _ref = source.shaders;
    for (shaderSource = 0, _len = _ref.length; shaderSource < _len; shaderSource++) {
      shaderName = _ref[shaderSource];
      shader = ShaderFactory.create(shaderSource);
      parameters = parameters.concat(shader.parameters);
      this.shaders[shaderName] = shader;
    }
  }

  FX.prototype.apply = function(program) {
    var parameter, parameterName, _len, _results;
    _results = [];
    for (parameter = 0, _len = parameters.length; parameter < _len; parameter++) {
      parameterName = parameters[parameter];
      _results.push(parameter.setter(program.uniforms[parameterName], param.value));
    }
    return _results;
  };

  return FX;

})();

Challenger = (function() {

  function Challenger() {
    this.shaderFactory = new ShaderFactory;
    this.shaderProgramFactory = new ShaderProgramFactory;
  }

  return Challenger;

})();
