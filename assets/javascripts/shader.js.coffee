#= require 'resource_factory'

class Shader
  constructor: (source) ->
    @name = source.name
    @dependency = source.dependency
    @glsl = source.glsl
    @type = if (source.type == "vertex") then gl.VERTEX_SHADER else gl.FRAGMENT_SHADER
    @parameters = []
    @attributes = []
    
    @parseUniforms(source.glsl)
    @parseAttributes(source.glsl)
    
  parseUniforms: (src) ->
    gen_uniform_regexp = /uniform\s+\w+\s+\w+[^;]*/ig
    uniform_regexp = /uniform\s+(\w+)\s+(\w+)(\s+=\s+(.*))*/i
    uniforms = src.match(gen_uniform_regexp)
    
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

  parseAttributes: (src) ->
    #TODO: parsing attributes

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
