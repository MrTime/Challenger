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

