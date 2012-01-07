#= require 'resource_factory'

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


