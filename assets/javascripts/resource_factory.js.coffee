class ResourceFactory
  constructor: ->
    @cache = {}
    
  create: (source) ->
    full_name = @instance_name(source)
    if @cache[full_name]
      @cache[full_name]
    else
      instance = @create_new(source)
      instance.resource_name = full_name
      @cache[full_name] = instance
      
  free: (instance) ->
    @cache[instance.resource_name] = null
  
  instance_name: (source) ->
    source.name
  
  create_new: (source) ->
    # abstract

