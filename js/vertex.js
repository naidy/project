//VertexLabel
var NotPicked = 'NotPicked';
var PickedCandidate = 'PickedCandidate';
var MovedCandidate = 'MovedCandidate';
var OnAxis = 'OnAxis';
var Fixed = 'Fixed';
var Moved = 'Moved';
//VertexLabels
var AllMoved = 'AllMoved';
var AllFixed = 'AllFixed';
var MovedAndFixed = 'MovedAndFixed';

var Vertex = function(){
	this.birthStage = 0;
	this.position = new THREE.Vector3();
	this.texcoord = new THREE.Vector2();
	this.label;                        //VertexLabel
	this.parent = null;                //Vertex
	this.child; = null;                //Vertex
}

Vertex.prototype.set = function(position, texcoord){
	this.position.copy (position);
	this.texcoord.copy (texcoord);
}

Vertex.prototype.set2 = function(vertex1, vertex2, birthStage, fold){
	this.birthStage = birthStage;
	this.position.copy (fold.newVertexPosition(vertex1.position, vertex2.position));
	var m = vertex1.position.distanceTo(this.position);
	var n = vertex2.position.distanceTo(this.position);
	Vector2Divied(this.texcoord, vertex1.texcoord, vertex2.texcoord, m, n);
}

Vertex.prototype.set3 = function(parentVertex, birthStage, fold){
	this.birthStage = birthStage;
	this.position.copy (fold.rotateVertexPosition(parentVertex.position));
	this.texcoord.copy (parentVertex.texcoord);
	this.parent = parentVertex; //////////////////////////////////////
}

Vertex.prototype.labelPickedCandidate = function(position){
	var margin = 0.01;
	this.label = position.distanceTo(this.position) < margin ? PickedCandidate : NotPicked;
}

Vertex.prototype.setLabel = function(fold){
	var margin = 0.01;
	return FoldVertexLabel (fold, this.position, margin);
}

//function
function FoldVertexLabel (fold, position, margin){
	var v = new THREE.Vector3();
	v.subVectors(position, fold.boundary.passage);
	var fbn = new THREE.Vector3();
	fbn.copy (fold.boundary.normal);
	var distance = fbn.dot(v);

	if (Math.abs(distance) < margin)
		return OnAxis;
	else if (distance < 0)
		return MovedCandidate;
	else
		return Fixed;
}

function Vector2Divide (v, a, b, m, n){

	if (Math.abs(m+n) < 2.2204460492503131e-16)     //DBL_EPSILON
		return 1;
	var c = new THREE.Vector2();
	c.setX (a.x * n);
	c.setY (a.y * n);
	v.setX (b.x * m);
	v.setY (b.y * m);
	v.add (c);
	v.multiplyScalar(1.0/(m+n));
	return 0;
}

function VectorLineAngleRotate (v, line, angle){
	v.sub (line.passage);
	VectorVectorAngleRotate(v, line.direction, angle);
	v.add (line.passage);
}

function VectorVectorAngleRotate (v, axis, angle){
	var projected = new THREE.Vector3();
	var uaxis = new THREE.Vector3();
	var vaxis = new THREE.Vector3();

	VectorVectorVectorProjection (projected, v, axis);
	uaxis.subVectors(v, projected);
	VectorVectorVectorExterior(vaxis, axis, uaxis);
	uaxis.multiplyScalar (Math.cos(angle));
	vaxis.multiplyScalar (Math.sin(angle/axis.length()));
	v.addVectors (uaxis, vaxis);
	v.add (projected);
}

function VectorVectorVectorProjection (v, a, b){
	var va = new THREE.Vector3();
	va.copy (a);
	var tmp = va.dot(b) / (b.x*b.x+b.y*b.y+b.z*b.z);
	
	v.setX (b.x * tmp);
	v.setY (b.y * tmp);
	v.setZ (b.z * tmp);
}