#= require 'base' 
#= require 'shader'
#= require 'shader_program'
#= require 'fx'
#= require 'texture'

class Challenger
  constructor: ->
    @shaderFactory = new ShaderFactory
    @shaderProgramFactory = new ShaderProgramFactory
    @FXFactory = new FXFactory
    @textureFactory = new TextureFactory
