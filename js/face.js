//FaceLabel
var UndoneFace = 'UndoneFace';
var FixedFace = 'FixedFace';
var MovedFace = 'MovedFace';
var DividedFace = 'DividedFace';
//RenewResult
var RenewDone = 'RenewDone';
var RenewSuccess = 'RenewSuccess';
var RenewFailure = 'RenewFailure';
//FaceLocation
var InfrontApart = 'InfrontApart';
var InfrontContact = 'InfrontContact';
var Across = 'Across';
var BehindContact = 'BehindContact';
var BehindApart = 'BehindApart';

var Face = function(){
	this.birthStage = 0;
	this.faceGroupID = 0;
	this.edge = null;
	this.vertexSize = 4;
	this.label;
	this.newEdge = null;
	this.parent = null;
	this.children = [];
	this.children[0] = null;
	this.children[1] = null;
}

Face.prototype.set = function(){
	var position = [];
	var i;
	for (i = 0; i < this.vertexSize; i++)
		position[i] = new THREE.Vector3();
	position[0].set (10, 10, 0);
	position[1].set (-10, 10, 0);
	position[2].set (-10, -10, 0);
	position[3].set (10, -10, 0);

	var texcoord = [];
	var xmin, xmax, ymin, ymax;
	xmin = xmax = position[0].x;
	ymin = ymax = position[0].y;
	for (i = 0; i < this.vertexSize; i++){
		texcoord[i] = new THREE.Vector2();

		if (position[i].x < xmin)
			xmin = position[i].x;
		else if (position[i].x > xmax)
			xmax = position[i].x;
		if (position[i].y < ymin)
			ymin = position[i].y;
		else if (position[i].y > ymax)
			ymax = position[i].y;
	}
	for (i = 0; i < this.vertexSize; i++){
		texcoord[i].x = (position[i].x - xmin)/(xmax - xmin);
		texcoord[i].y = (position[i].y - ymin)/(ymax - ymin);
	}

	this.edge = [];
	for (i = 0; i < this.vertexSize; i++){
		this.edge[i] = new Edge();
		this.edge[i].face[0] = this;
		this.edge[i].vertex[0] = new Vertex();
		this.edge[i].vertex[0].set (position[i], texcoord[i]);
	}
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].vertex[1] = this.edge[(i+1)%this.vertexSize].vertex[0];
}

Face.prototype.set2 = function (parentFace, birthStage){  //face int
	this.birthStage = birthStage;
	this.edge = [];
	this.vertexSize = 0;
	this.faceGroupID = parentFace.faceGroupID;
	this.newEdge = null;
	this.parent = parentFace;
}

Face.prototype.closetEdge = function (distance, p0, p1){  //double vector vector
	var closest = null;  //edge
	distance = 1.79769e+308;  //DBL_MAX
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = this.edge[i].distance(p0, p1);
		if (d < distance){
			closest = this.edge[i];
			distance = d;
		}
	}
	return closest;
}

Face.prototype.vertex = function (i){  //int
	return this.edge[i].primaryVertex(this);
}

Face.prototype.labelVertices = function (fold){  //fold
	var m, b, f, i;
	m = b = f = 0;
	for (i = 0; i < this.vertexSize; i++){
		switch (this.vertex(i).setLabel(fold)){
			case MovedCandidate:
				m++;
				break;
			case Fixed:
				f++;
				break;
			case OnAxis:
				b++;
				break;
		}
	}
	if ((b+f) == 0)
		return AllMoved;
	else if (m == 0)
		return AllFixed;
	else
		return MovedAndFixed;
}

Face.prototype.clearEdgeAndFaceLabels = function (){
	this.label = UndoneFace;
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].label = UndoneEdge;
}

Face.prototype.neighborEdge = function (vertex, select){  //vertex int
	var i;
	for (i = 0; i < this.vertexSize; i++){
		if (this.vertex(i) == vertex)
			return this.edge[(i-1+this.vertexSize+select)%this.vertexSize];
	}
	return null;
}

Face.prototype.include = function (vertex){  //vertex
	var i;
	for (i = 0; i < this.vertexSize; i++){
		if (this.vertex(i) == vertex)
			return 1;
	}
	return 0;
}

Face.prototype.setBoundary = function (boundary){  //plane
	var faceNormal = new THREE.Vector3();
	VectorNormal (faceNormal, this.vertex(0).position, this.vertex(1).position, this.vertex(2).position);
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var edge = new THREE.Vector3();
		edge.subVectors (this.vertex((i+1)%this.vertexSize).position, this.vertex(1).position);
		VectorVectorVectorExterior(boundary[i].normal, faceNormal, edge);
		boundary[i].normal.normalize();
		boundary[i].passage.copy (this.vertex((i+1)%this.vertexSize).position);
	}
}

Face.prototype.ifIncluded = function (boundary, boundarySize, margin){  //plane int double
	margin = 0.1;
	var gravity = new THREE.Vector3();
	var i;
	for (i = 0; i < this.vertexSize; i++)
		gravity.add (this.vertex(i).position);
	gravity.divideScalar(this.vertexSize);
	for (i = 0; i < boundarySize; i++){
		if (boundary[i].signedDistance(gravity) <= margin)
			return 0;
	}
	return 1;
}

Face.prototype.overlap = function (face, margin){  //face double
	margin = 0.1;
	var boundary = [];
	boundary[0] = [];
	boundary[1] = [];
	var i, j;
	for (i = 0; i < this.vertexSize; i++)
		boundary[0][i] = new Plane();
	this.setBoundary (boundary[0]);

	for (i = 0; i < face.vertexSize; i++)
		boundary[1][i] = new Plane();
	face.setBoundary (boundary[1]);

	if (this.ifIncluded (boundary[1], face.vertexSize))
		return 1;
	if (face.ifIncluded (boundary[0], this.vertexSize))
		return 1;

	for (j = 0; j < face.vertexSize; j++){
		for (i = 0; i < this.vertexSize; i++){
			var distance = [];
			distance[0] = boundary[0][i].signedDistance(face.vertex(j).position);
			distance[1] = boundary[0][i].signedDistance(face.vertex((j+1)%face.vertexSize).position);
			distance[2] = boundary[1][j].signedDistance(this.vertex(i).position);
			distance[3] = boundary[1][j].signedDistance(this.vertex((i+1)%this.vertexSize).position);
			var intersect = 1;
			if (distance[0]*distance[1] >= 0)
				intersect = 0;
			if (Math.abs(distance[0]) < margin)
				intersect = 0;
			if (Math.abs(distance[1]) < margin)
				intersect = 0;
			if (distance[2]*distance[3] >= 0)
				intersect = 0;
			if (Math.abs(distance[2]) < margin)
				intersect = 0;
			if (Math.abs(distance[3]) < margin)
				intersect = 0;
			if (intersect)
				return 1;
		}
	}
	return 0;
}