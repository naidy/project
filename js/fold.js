var FoldUp = 'FoldUp';
var FoldDown = 'FoldDown';
var TuckIn = 'TuckIn';
var BendUp = 'BendUp';
var BendDown = 'BendDown';
var Bend = 'Bend';
var Undecided = 'Undecided';

var Fold = function(){
	//var vertex = new Vertex();
	this.vertexID;
	this.face = new Face();
	this.faceID;
	this.faceGroup = new FaceGroup();

	this.destination = new THREE.Vector3();
	this.type;
	this.boundary = new Plane();
	this.axis = new Line();
	this.angle;

	this.destination2 = new THREE.Vector3();
	this.type2;
	this.boundary2 = new Plane();
	this.axis2 = new Line();
	this.angle2;
}

Fold.prototype.isBend = function(){
	return this.type == BendUp || this.type == BendDown;
}

Fold.prototype.update = function(margin){
	this.boundary.equidistance (this.vertex.position, this.destination);
	if (boundary.normal.length() < margin)
		return true;
	if (this.type == BendDown || this.type == FoldDown)
		this.angle = -2.0 * this.boundary.normal.angleTo(this.faceGroup.normal.multiplyScalar(-1));
	else
		this.angle = 2.0 * this.boundary.normal.angleTo(this.faceGroup.normal);
	if (Math.abs(angle+Math.PI*2) < 10.0 || Math.abs(angle) < 10.0 || Math.abs(angle - Math.PI*2) < 10.0)
		return true;

	var pickedPlane = new Plane();
	pickedPlane.normal.copy (this.faceGroup.normal);
	pickedPlane.passage.copy (this.vertex.position);

	this.axis.intersection (pickedPlane, this.boundary);
	return false;
}

Fold.prototype.update2 = function(destination, eyePosition, inBending){
	var pickedPlane = new Plane();
	pickedPlane.normal.copy (this.faceGroup.normal);
	pickedPlane.passage.copy (this.vertex.position);

	var viewLine = new THREE.Vector3();
	viewLine.subVectors(pickedPlane.passage, eyePosition);
	var vl = new THREE.Vector3();
	vl.copy (viewLine);

	if (inBending)
		this.type = vl.dot(pickedPlane.normal) > 0 ? BendDown : BendUp;
	else{
		if (this.isBend() && (viewLine.multiplyScalar(pickedPlane.signedDistance(destination))).dot(pickedPlane.normal) < 0){
			this.type = vl.dot(pickedPlane.normal) > 0 ? BendDown : BendUp;
		}else{
			var v = new THREE.Vector3();
			v.addVectors(destination, viewLine);
			var line = new Line();
			line.set (destination, v);
			LinePlaneIntersection (destination, line, pickedPlane);
			this.type = vl.dot(pickedPlane.normal) > 0 ? FoldDown : FoldUp;
		}
	}

	this.destination.copy (destination);
	return this.update(0.1);
}

Fold.prototype.newVertexPosition = function(v1, v2){
	var edge = new Line();
	edge.set (v1, v2);
	var position = new THREE.Vector3();
	LinePlaneIntersection(position, edge, this.boundary);
	return position;
}

Fold.prototype.rotateVertexPosition = function(v){
	var position = new THREE.Vector3();
	VectorLineAngleRotate (v, this.axis, this.angle);
	position.copy (v);
	return position;
}