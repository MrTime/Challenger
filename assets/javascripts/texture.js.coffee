#= require 'resource_factory'

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
