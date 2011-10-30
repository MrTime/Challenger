/**
	Create main engine context.
	Initialize WebGL and create factories
*/
function Challenger() {
	this.shaderFactory = new ShaderFactory();
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
	WebGL shader program object
*/
function ShaderProgram() {

}

/**
	Link shader program object.
	Makes shader program from few shaders
*/
function ShaderProgramFactory() {

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
function FX() {

}

/**
	WebGL shader object.
	Create WebGL shader object and compile shader.
	\param source hash in format {:name,:type,:glsl}, where type can be "vertex", "fragment"
*/
function Shader(source) {
	this.name = source.name;
	this.obj = gl.createShader(source.type == "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
	gl.shaderSource(this.obj, source.glsl);
	gl.compileShader(this.obj);

	if (!gl.getShaderParameter(this.obj, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
	}
	
	this.clean = function() {
		gl.destroyShader(this.obj);
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
