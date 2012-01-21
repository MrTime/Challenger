describe "Resource Factory", ->
  beforeEach ->
    @factory = new ResourceFactory
    @factory.counter = 0
    @factory.create_new = -> 
      value: "new object #{@counter++}"

  it "should create", ->
    instance = @factory.create name:"test"
    expect(instance).toEqual(value: "new object 0", resource_name:"test")

  it "should not dublicate", ->
    instance1 = @factory.create name:"test"
    instance2 = @factory.create name:"test"
    expect(instance2).toBe(instance1)

  it "should free", ->
    instance1 = @factory.create name:"test"
    @factory.free instance1

    instance2 = @factory.create name:"test"
    expect(instance2).not.toBe(instance1)
    

