/**
	Create main engine context.
	Initialize WebGL and create factories
*/
function Challenger() {
	this.shaderFactory = new ShaderFactory();
	this.shaderProgramFactory = new ShaderProgramFactory();
}

/**
	Scene node.
	Make parent-child structure of nodes. And have 3D transfomation
*/
function Node() {

}

/**
	Visual node.
	Extends Node. Has own Mesh, Material and ShaderProgram objects.
*/
function VisualNode() {

}

/**
	Scene node factory.
	Allows create scene nodes: Node, MeshNode, etc. 
*/
function NodeFactory() {

}

/**
	WebGL shader program object.
	Links WebGL program and gets locations for all uniforms.
*/
function ShaderProgram(title, shaders) {
	this.clean = function() {
		gl.destroyProgram(this.obj);
		this.uniforms = null;
	}

	this.use = function() {
		gl.useProgram(this.obj);
	}
	
	this.name = name;
	
	// TODO: check dependencies
	
	// link program
	this.obj = gl.createProgram();
	for (var i = 0; i < shaders.length; i++)	
		gl.attachShader(this.obj, shaders[i].obj);
	gl.linkProgram(this.obj);
	
	if (!gl.getProgramParameter(this.obj, gl.LINK_STATUS)) {
		alert("Could not initialize shaders");
		return
	}
	
	this.use();
	
	// get uniforms locations
	this.uniforms = {};
	for (var i = 0; i < shaders.length; i++) {
		var shader = shaders[i];
		for (var p = 0; p < shader.parameters.length; p++) { 
			var parameter = shader.parameters[p];
			this.uniforms[parameter.name] = gl.getUniformLocation(this.obj, parameter.name);
		}
	}
}

/**
	Link shader program object.
	Makes shader program from few shaders
*/
function ShaderProgramFactory() {
	function fullName(shaders) {
		var name = "";
		for (var i = 0; i < shaders.length; i++)
			name += shaders[i].name + "|";
		return name;
	}
	
	this.cache = {};
	
	/**
		Create Program.
		Allows create program with unique name only once.
		\return Program object 
	*/
	this.create = function(shaders) {
		var programName = fullName(shaders);
	
		if (this.cache[programName])
		{
			return this.cache[programName]
		}
		else
		{
			program = new ShaderProgram(programName, shaders);
			this.cache[programName] = program;
			return program;
		}
	}	
	
	/**
		Free program object.
		Destroys WebGL Program object and removes from cache
	*/
	this.free = function(program) {
		program.clean();
		this.cache[program.title] = null;
	}	
}

/**
	Visual material.
	Container for shader parameters and textures for different visual effects
*/
function Material() {

}

/**
	Visual material factory.
	Has shaders and textures connected with it, and values for shader parameters (Uniforms)
*/
function MaterialFactory() {

}

/**
	Triangle mesh.
	Consist of vertices and indices from Vertex Buffer Object and shaders for geometry transformations.
	Vertices and indices stored in VertexBufferChunk objects.
*/
function Mesh() {

}

/**
	Part of VertexBufferObject
*/
function VertexBufferChunk() {

}

/**
*	WebGL vertex buffer object.
*/
function VertexBufferObject() {

}

/**
	Loads mesh.
	Allocates memory in buffer object for geometry and indices, and load geometry data into it.
	Return Mesh object, which is drawable.
	Has shaders connected with it and params for it
*/
function MeshFactory() {

}

/**
	WebGL texture object.
*/
function ImageTexture() {
	
}

/**
	Load textures.
	Create WebGL texture object and load image into it
*/
function TextureFactory() {

}

/**
*	Base class for shader-based objects.
*	Container for shader variables values. 
*/
function FX(source) {
	this.title = source.name;		
	this.parameters = {};			//< parameters hash, where key - parameter name, value - {:value, :value_func, :set}, where set - function that set uniform value (kind of function (name, value))
	this.shaders = {};				//< vertex,fragment shaders connected with this FX
	
	// load all shaders for this FX
	for (var shaderName in source.shaders) {
		var shader = ShaderFactory.create(source.shaders[shaderName]);
		// add shader parameters into FX pameters
		parameters = parameters.concat(shader.parameters);
		shaders[shaderName] = shader;
	}
		
	/** set FX uniforms
	*	\param program object that contain current program with parameters uniforms for it
	*/
	this.apply = function(program) {
		for (var paramName in parameters) {
			var param = this.parameters[paramName];
			if (param.value)
				param.setter(program.uniforms[paramName], param.value);
			else
				param.setter(program.uniforms[paramName], param.valueFunc());
		}
	}
}

/**
	WebGL shader object.
	Create WebGL shader object and compile shader.
	\param source hash in format {:name,:type,:glsl}, where type can be "vertex", "fragment"
*/
function Shader(source) {
	// free WebGL object
	this.clean = function() {
		gl.destroyShader(this.obj);
		this.parameters = [];
	}
	
	this.uniformMatrix2 = function(location, value) {
		gl.uniformMatrix2fv(location, (value.transpose == true), value);
	}
	
	this.uniformMatrix3 = function(location, value) {
		gl.uniformMatrix3fv(location, (value.transpose == true), value);
	}
	
	this.uniformMatrix4 = function(location, value) {
		gl.uniformMatrix4fv(location, (value.transpose == true), value);
	}
	
	// determinate set function for specific argument type
	function setter_for(typename) {
		switch (typename) {
			case "float":	return gl.uniform1f; break;
			case "vec2":	return gl.uniform2fv; break;
			case "vec3":	return gl.uniform3fv; break;
			case "vec4":	return gl.uniform4fv; break;
			case "sample2D":
			case "sampleCube":
			case "bool":
			case "int":		return gl.uniform1i; break;
			case "bvec2":	
			case "ivec2":	return gl.uniform2iv; break;
			case "bvec3":	
			case "ivec3":	return gl.uniform3iv; break;
			case "bvec4":	
			case "ivec4":	return gl.uniform4iv; break;
			case "mat2":	return this.uniformMatrix2; break;	
			case "mat3":	return this.uniformMatrix3; break;	
			case "mat4":	return this.uniformMatrix4; break;	
			default:		return null;
		}
	}

	this.name = source.name;
	this.dependency = source.dependency;
	
	// compile shader
	this.obj = gl.createShader(source.type == "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
	
	gl.shaderSource(this.obj, source.glsl);
	gl.compileShader(this.obj);

	if (!gl.getShaderParameter(this.obj, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return;
	}
	
	// parse uniform and connect with set functions
	var gen_uniform_regexp = /uniform\s+\w+\s+\w+[^;]*/ig;
	var uniform_regexp = /uniform\s+(\w+)\s+(\w+)(\s+=\s+(.*))*/i;
	var uniforms = source.glsl.match(gen_uniform_regexp);
	this.parameters = [];
	
	for (var i = 0; i < uniforms.length; i++) {
		var uniform_src = uniforms[i];
		
		// 1 - uniform type
		// 2 - uniform name
		// 4 - uniform default
		var values = uniform_src.match(uniform_regexp)
		
		var parameter = new Object();
		parameter.name = values[2];
		parameter.setter = setter_for(values[1]);
		
		//TODO: process uniform default value
			
		this.parameters.push(parameter);
	}
} 

/**
	Load shaders.
	Compile separated shaders
*/
function ShaderFactory() {
	this.cache = {};
	
	/**
		Create shader.
		Allows create shader with unique name only once.
		\param source hash in format {:name,:type,:glsl}
		\return Shader object 
	*/
	this.create = function(source) {
		if (this.cache[source.name])
		{
			return this.cache[source.name]
		}
		else
		{
			shader = new Shader(source);
			this.cache[source.name] = shader;
			return shader;
		}
	}	
	
	/**
		Free shader object.
		Destroys WebGL Shader object and removes from cache
	*/
	this.free = function(shader) {
		shader.clean();
		this.cache[shader.name] = undefined;
	}
}
