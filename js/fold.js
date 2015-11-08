//FoldType
var FoldUp = 'FoldUp';
var FoldDown = 'FoldDown';
var TuckIn = 'TuckIn';
var BendUp = 'BendUp';
var BendDown = 'BendDown';
var Bend = 'Bend';
var Undecided = 'Undecided';

var Fold = function(){
	this.vertex;
	this.vertexID;
	this.face;
	this.faceID;
	this.faceGroup;

	this.destination = new Vector();
	this.type;
	this.boundary = new Plane();
	this.axis = new Line();
	this.angle;

	this.destination2 = new Vector();
	this.type2;
	this.boundary2 = new Plane();
	this.axis2 = new Line();
	this.angle2;
}

Fold.prototype.setPick = function (face){  //face
	var i;
	for (i = 0; i < face.vertexSize; i++){
		if (face.vertex(i).label == PickedCandidate){
			this.vertexID = i;
			this.vertex = face.vertex(this.vertexID);
			return true;
		}
	}
	return false;
}

Fold.prototype.setPick2 = function (faceGroup, viewDirection){  //facegroup vector
	var i;
	if (viewDirection.dot(faceGroup.normal) > 0){
		for (i = 0; i < faceGroup.faceSize; i++){
			if (this.setPick(faceGroup.face[i])){
				this.faceID = i;
				this.face = faceGroup.face[this.faceID];
				this.faceGroup = faceGroup;
				return true;
			}
		}
	}else{
		for (i = faceGroup.faceSize - 1; i >= 0; i--){
			if (this.setPick(faceGroup.face[i])){
				this.faceID = i;
				this.face = faceGroup[this.faceID];
				this.faceGroup = faceGroup;
				return true;
			}
		}
	}
	return false;
}

Fold.prototype.pickedVertexPosition = function(){
	return this.vertex.position;
}

Fold.prototype.update = function (margin){  //double
	if (margin == undefined)
		margin = 0.1;
	this.boundary.equidistance (this.vertex.position, this.destination);
	if (this.boundary.normal.abs() < margin)
		return true;
	var tmp = new Vector();
	tmp.set2 (this.faceGroup.normal);
	tmp.reverse();
	if (this.type == BendDown || this.type == FoldDown)
		this.angle = -2.0 * this.boundary.normal.angle(tmp);
	else
		this.angle = 2.0 * this.boundary.normal.angle(this.faceGroup.normal);
	if (Math.abs(this.angle+360) < rad(10.0) || Math.abs(this.angle) < rad(10.0) || Math.abs(this.angle - 360) < rad(10.0))
		return true;

	var pickedPlane = new Plane();
	pickedPlane.normal.set2(this.faceGroup.normal);
	pickedPlane.passage.set2(this.vertex.position);

	this.axis.intersection (pickedPlane, this.boundary);
	return false;
}

Fold.prototype.isBend = function(){
	return this.type == BendUp || this.type == BendDown;
}

Fold.prototype.update2 = function(destination, eyePosition, inBending){  //vector vector bool
	var pickedPlane = new Plane();
	pickedPlane.normal.set2(this.faceGroup.normal);
	pickedPlane.passage.set2(this.vertex.position);

	var viewLine = new Vector();
	viewLine.sub2(pickedPlane.passage, eyePosition);

	if (keyboard.down("T"))
		this.type = TuckIn;
	else if (inBending)
		this.type = viewLine.dot(pickedPlane.normal) > 0 ? BendDown : BendUp;
	else{
		if (this.isBend() && (viewLine.mul(pickedPlane.signedDistance(destination))).dot(pickedPlane.normal) < 0){
			this.type = viewLine.dot(pickedPlane.normal) > 0 ? BendDown : BendUp;
		}else{
			var v = new Vector();
			v.add2(destination, viewLine);
			var line = new Line();
			console.log (destination);
			line.set (destination, v);
			destination.intersection(line, pickedPlane);
			this.type = viewLine.dot(pickedPlane.normal) > 0 ? FoldDown : FoldUp;
		}
	}

	this.destination.set2(destination);
	return this.update();
}

Fold.prototype.update3 = function (destination){  //vector
	this.destination.set2(destination);
	return this.update();
}

Fold.prototype.pickedFaceGroup = function(){
	return this.faceGroup;
}

Fold.prototype.pickedFace = function(){
	return this.face;
}

Fold.prototype.vertexLabel = function (position, margin){  //vector double
	var v = new Vector();
	v.sub2(position, this.boundary.passage);
	var distance = v.dot(this.boundary.normal);
	if (Math.abs(distance) < margin)
		return OnAxis;
	else if (distance < 0)
		return MovedCandidate;
	else
		return Fixed;
}

Fold.prototype.newVertexPosition = function (v1, v2){  //vector vector
	var edge = new Line();
	edge.set (v1, v2);
	var position = new Vector();
	position.intersection(edge, this.boundary);
	return position;
}

Fold.prototype.rotateVertexPosition = function (v){  //vector
	var position = new Vector();
	v.rotate3(this.axis, this.angle);
	position.set2(v);
	return position;
}

Fold.prototype.rotateNormal = function (normal){  //vector
	var v1 = new Vector();
	var v2 = new Vector();
	var vo = new Vector();
	v2.rotate4(normal, this.axis, this.angle);
	v1.rotate4(vo, this.axis, this.angle);
	vo.sub2(v2, v1);
	return vo;
}