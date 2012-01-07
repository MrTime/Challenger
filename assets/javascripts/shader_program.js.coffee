#= require 'resource_factory'

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
 
