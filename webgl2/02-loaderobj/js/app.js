var gl = null;
var shaderProgram  = null; //Shader program to use.
var vao = null;
var vao2 =null; //Geometry to render (stored in VAO).
var indexCount = 0;
var indexCount2= 0;

var mov=0;
var obj1center=[];
var obj2center=[];

//Uniform locations.
var u_modelMatrix;
var u_viewMatrix;
var u_projMatrix;

//Uniform values.
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var projMatrix = mat4.create();

//Aux variables,
var angle = 0;
var scale = 1;
var parsedOBJ = null; //Parsed OBJ file
var parsedOBJ2 = null;
function onLoad() {
	let canvas = document.getElementById('webglCanvas');
	gl = canvas.getContext('webgl2');

	let indices = parsedOBJ.indices;
	//Tengo que convertir los indices de triangulos a indices de lineas
	indices = convertIndexes(indices);

	let indices2 = parsedOBJ2.indices;
	console.log(parsedOBJ.positions);
	obj1center=Utils.boundingBoxCenter(parsedOBJ.positions);
	console.log(obj1center)
	//Tengo que convertir los indices de triangulos a indices de lineas
	indices2 = convertIndexes(indices2);
	
	indexCount = indices.length;
	indexCount2 = indices2.length;
	
	let positions = parsedOBJ.positions;
	let colors = parsedOBJ.positions;//Will use position coordinates as colors (as example)

	let positions2 = parsedOBJ2.positions;
	let colors2 = parsedOBJ2.positions;//Will use position coordinates as colors (as example)
	//vertexShaderSource y fragmentShaderSource estan importadas en index.html <script>
	shaderProgram = ShaderProgramHelper.create(vertexShaderSource, fragmentShaderSource);

	let posLocation = gl.getAttribLocation(shaderProgram, 'vertexPos');
	let colLocation = gl.getAttribLocation(shaderProgram, 'vertexCol');
	u_modelMatrix = gl.getUniformLocation(shaderProgram, 'modelMatrix');
	u_viewMatrix = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	u_projMatrix = gl.getUniformLocation(shaderProgram, 'projMatrix');
	let vertexAttributeInfoArray = [
		new VertexAttributeInfo(positions, posLocation, 3),
		new VertexAttributeInfo(colors, colLocation, 3)
	];
	let vertexAttributeInfoArray2 = [
		new VertexAttributeInfo(positions2, posLocation, 3),
		new VertexAttributeInfo(colors2, colLocation, 3)
	];

	vao = VAOHelper.create(indices, vertexAttributeInfoArray);
	vao2= VAOHelper.create(indices2, vertexAttributeInfoArray2);

	gl.clearColor(0.18, 0.18, 0.18, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Matrix de Vista y Proyeccion.
	let eye = [2, 2, 2];
	let target = [0, 0, 0];
	let up = [0, 1, 0];
	mat4.lookAt(viewMatrix, eye, target, up);

	let fovy = glMatrix.toRadian(45);
	let aspect = canvas.width / canvas.height;
	let zNear = 0.1;
	let zFar = 10.0;
	mat4.perspective(projMatrix, fovy, aspect, zNear, zFar);

	gl.enable(gl.DEPTH_TEST);
}

//Reordeno valores para dibujarlos como lineas				
function convertIndexes(indexes){
	let newIndexes = [];
	for (let x = 0; x < indexes.length; x = x + 3) {
		//Linea 1
		newIndexes.push(indexes[x]);
		newIndexes.push(indexes[x + 1]);
		//Linea 2
		newIndexes.push(indexes[x + 1]);
		newIndexes.push(indexes[x + 2]);
		//Linea 3. Tiene que ser asi para respetar el sentido antihorario
		newIndexes.push(indexes[x + 2]);
		newIndexes.push(indexes[x]);
	}
	return newIndexes;
}

function onRender() {
	let rotationMatrix = mat4.create();
	let scaleMatrix = mat4.create();
	mat4.fromYRotation(rotationMatrix, glMatrix.toRadian(angle));
	mat4.fromScaling(scaleMatrix, [scale, scale, scale]);

	modelMatrix = mat4.create();
	mat4.multiply(modelMatrix, rotationMatrix, scaleMatrix);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shaderProgram);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix);
	gl.uniformMatrix4fv(u_viewMatrix, false, viewMatrix);
	gl.uniformMatrix4fv(u_projMatrix, false, projMatrix);

	gl.bindVertexArray(vao);
	gl.drawElements(gl.LINES, indexCount, gl.UNSIGNED_INT, 0);

	gl.bindVertexArray(null);
	
	gl.bindVertexArray(vao2);
	gl.drawElements(gl.LINES, indexCount2, gl.UNSIGNED_INT, 0);


	gl.bindVertexArray(null);
	gl.useProgram(null);
}

function onSliderRotationSatellite(slider) {
	angle = parseFloat(slider.value);
	mov = 1;
	onRender();
	console.log("Rotando satelite");
}

function onSliderRotationSatellitePlanet(slider) {
	angle = parseFloat(slider.value);
	mov = 2;
	onRender();
	console.log("Rotando satelite alrededor del planeta");
}

function onSliderRotationPlanet(slider) {
	mov = 3;
	angle = parseFloat(slider.value);
	console.log("Rotando planeta");
	onRender();
	
}

function onSliderRotationCamera(slider) {
	angle = parseFloat(slider.value);
	mov = 4;
	onRender();
	console.log("Rotando camara");
}

function onSliderZoomCamera(slider) {
	mov = 5;
	let delta = parseFloat(slider.value) / 100.0;
	scale = 1 + delta;
	onRender();
	console.log("Zoom camara");
}

function onModelLoad(event) {
	let objFileContent = event.target.result;
	parsedOBJ = OBJParser.parseFile(objFileContent);
}
function onModelLoad2(event) {
	let objFileContent = event.target.result;
	parsedOBJ2 = OBJParser.parseFile(objFileContent);
}
