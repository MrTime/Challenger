clone = (obj) ->
  if not obj? or typeof obj isnt 'object'
    return obj

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = clone obj[key]

  return newInstance
  
class ResourceFactory
  constructor: ->
    @cache = {}
    
  create: (source) ->
    full_name = @instance_name(source)
    if @cache[full_name]
      @cache[full_name]
    else
      @cache[full_name] = @create_new(source)
      
    
  free: (instance) ->
    instance.clean
    @cache[instance.name] = null
  
  instance_name: (source) ->
    source.name
  
  create_new: (source) ->
    # abstract
    
class Shader
  constructor: (source) ->
    @name = source.name
    @dependency = source.dependency
    @glsl = source.glsl
    @type = if (source.type == "vertex") then gl.VERTEX_SHADER else gl.FRAGMENT_SHADER
    
    gen_uniform_regexp = /uniform\s+\w+\s+\w+[^;]*/ig
    uniform_regexp = /uniform\s+(\w+)\s+(\w+)(\s+=\s+(.*))*/i
    uniforms = source.glsl.match(gen_uniform_regexp)
    @parameters = []
    
    if uniforms
      for uniform_src in uniforms
        # 1 - uniform type
        # 2 - uniform name
        # 4 - uniform default
        values = uniform_src.match(uniform_regexp)
        
        parameters =
          name: values[2]
          setter: @setter_for(values[1])
        
        @parameters.push parameters
        
  clean: ->
    gl.destroyShader(this.obj)
    @parameters = []
    
  uniformMatrix2: (location, value) ->
    gl.uniformMatrix2fv(location, (value.transpose == true), value)
  
  uniformMatrix3: (location, value) ->
    gl.uniformMatrix3fv(location, (value.transpose == true), value)
  
  uniformMatrix4: (location, value) ->
    gl.uniformMatrix4fv(location, (value.transpose == true), value)
    
  setter_for: (typename) ->
    switch typename
      when "float" then gl.uniform1f
      when "vec2"  then gl.uniform2fv
      when "vec3"  then gl.uniform3fv
      when "vec4"  then gl.uniform4fv
      when "sampler2D","samplerCube","bool","int" then gl.uniform1i
      when "bvec2","ivec2" then gl.uniform2iv
      when "bvec3","ivec3" then gl.uniform3iv
      when "bvec4","ivec4" then gl.uniform4iv
      when "mat2" then @uniformMatrix2
      when "mat3" then @uniformMatrix3
      when "mat4" then @uniformMatrix4
      else null
      
class ShaderFactory extends ResourceFactory
  constructor: ->
    super
 
  create_new: (source) -> new Shader(source)
      
class ShaderProgram
  constructor: (@name, fx) ->
    fullVertexGLSL = ""
    fullFragmentGLSL = ""
    @obj = gl.createProgram()
    for fxSource in fx
      for shaderSource in fxSource.shaders
        if shaderSource.type == gl.VERTEX_SHADER then fullVertexGLSL += shaderSource.glsl
        else fullFragmentGLSL += shaderSource.glsl
    
    vertexShader = @compile(fullVertexGLSL, gl.VERTEX_SHADER)
    fragmentShader = @compile(fullFragmentGLSL, gl.FRAGMENT_SHADER)
    
    gl.attachShader(@obj, vertexShader)
    gl.attachShader(@obj, fragmentShader)
    gl.linkProgram(@obj)
    
    unless gl.getProgramParameter(@obj, gl.LINK_STATUS)
      alert("Could not initialize shaders")
    
    @use()

    # get uniforms locations
    @uniforms = {}
    for fxSource in fx
      for shaderSource in fxSource.shaders
        for parameter in shaderSource.parameters
          @uniforms[parameter.name] = gl.getUniformLocation(@obj, parameter.name)
    
  clean: ->
    gl.destroyProgram(@obj)
    @uniforms = null
    
  use: -> gl.useProgram(@obj)
  
  compile: (glsl,type) ->
    shader = gl.createShader(type)
    gl.shaderSource(shader, glsl)
    gl.compileShader(shader)
    
    unless gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      alert(gl.getShaderInfoLog(shader))
      
    shader
      
class ShaderProgramFactory extends ResourceFactory
  constructor: ->
    super
 
  instance_name: (source) ->
    name = ""
    for shader in source
      name += shader.name + "|"
    name
 
  create_new: (source) -> new ShaderProgram(@instance_name(source), source)
     
class FX
  constructor: (source) ->
    @title = source.name
    @parameters = {}
    @shaders = []
    
    for shaderSource, shaderName in source.shaders
      shader = engine.shaderFactory.create(shaderSource)
      @parameters[parameter.name] = clone(parameter) for parameter in shader.parameters
      @shaders.push(shader)
      
  apply: (program) ->
    for parameterName, parameter of @parameters
      uniform = program.uniforms[parameterName]
      value = parameter.value if parameter.value?
      value = parameter.value_func() if parameter.value_func?
      if (value?)
        parameter.setter.call(gl, uniform, value)

    return

class FXFactory extends ResourceFactory
  constructor: ->
    super
 
  instance_name: (source) ->
    name = ""
    for shader in source.shaders
      name += shader.name + "|" + @cache.length
    name
 
  create: (source) -> new FX(source)

class Texture
  constructor: (source) ->
    @texture = gl.createTexture()
    @bind()
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    
    @load(source.url) if source.url?
    @alloc(source.width, source.height) if source.width? and source.height?
  clean: ->
    #TODO: cleanup texture

  bind: ->
    gl.bindTexture(gl.TEXTURE_2D, @texture)

  generateMipmap: ->
    @bind()
    gl.generateMipmap(gl.TEXTURE_2D)

  load: (url) ->
    @image = new Image()
    @image.texture = this
    @image.onload = @onImageLoaded
    @image.src = url
    true

  alloc: (width, height) ->
    @bind()
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

  onImageLoaded: ->
    this.texture.bind()
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this)
    this.texture.generateMipmap()
    true

class TextureFactory extends ResourceFactory
  constructor: ->
    super

  instance_name: (source) -> (if source.url? then source.url else @cache.length)
  create: (source) -> new Texture(source)

class Challenger
  constructor: ->
    @shaderFactory = new ShaderFactory
    @shaderProgramFactory = new ShaderProgramFactory
    @FXFactory = new FXFactory
    @textureFactory = new TextureFactory
