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
	this.vertexSize;
	this.label;
	this.newEdge = null;
	this.parent = null;
	this.children = [];
	this.children[0] = null;
	this.children[1] = null;
}

Face.prototype.vertex = function (i){  //int
	return this.edge[i].primaryVertex(this);
}

Face.prototype.normal = function(){
	var n = new Vector();
	n.normal(this.vertex(2).position, this.vertex(1).position, this.vertex(0).position);
	return n;
}

Face.prototype.connectFace = function (i){  //int
	return this.edge[i].connectFace(this);
}

Face.prototype.setOriginal = function(){
	this.birthStage = 0;
	this.faceGroupID = 0;
	this.vertexSize = 4;
	var position = [];
	var i;
	for (i = 0; i < this.vertexSize; i++)
		position[i] = new Vector();
	position[0].set (10, 10, 0);
	position[1].set (-10, 10, 0);
	position[2].set (-10, -10, 0);
	position[3].set (10, -10, 0);

	var texcoord = [];
	var xmin, xmax, ymin, ymax;
	xmin = xmax = position[0].x;
	ymin = ymax = position[0].y;
	for (i = 0; i < this.vertexSize; i++){
		texcoord[i] = new Vector2D();

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
	this.newEdge = this.parent = this.children[0] = this.children[1] = null;
}

Face.prototype.closestVertex = function (line, dv){  //line dv
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = line.distance (this.vertex(i).position);
		if (d < dv.distance){
			dv.vertex = this.vertex(i);
			dv.distance = d;
		}
	}
}

Face.prototype.labelPickedCandidate = function (position){  //vector
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.vertex(i).labelPickedCandidate (position);
}

Face.prototype.closestVertex2 = function (position, dv){  //vector dv
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = position.distance(this.vertex(i).position);
		if (d < dv.distance){
			dv.vertex = this.vertex(i);
			dv.distance = d;
			//console.log ('check face');
		}
	}
}

Face.prototype.closestVertex3 = function (line, dv, except, apartMargin){  //line dv vector double
	if (apartMargin == undefined)
		apartMargin = 1.0;
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = line.distance (this.vertex(i).position);
		if (d < dv.distance && this.vertex(i).position.distance(except) > apartMargin){
			dv.vertex = this.vertex(i);
			dv.distance = d;
		}
	}
}

Face.prototype.closestEdge = function (dv, p0, p1){  //dv vector vector
	var closest = null;  //edge
	dv.distance = DBL_MAX;  //DBL_MAX
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = this.edge[i].distance(p0, p1);
		if (d < dv.distance){
			closest = this.edge[i];
			dv.distance = d;
		}
	}
	return closest;
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

Face.prototype.set2 = function (parentFace, birthStage){  //face int
	this.birthStage = birthStage;
	this.edge = [];
	this.vertexSize = 0;
	this.faceGroupID = parentFace.faceGroupID;
	this.newEdge = null;
	this.parent = parentFace;
	this.children[0] = this.children[1] = null;
}

Face.prototype.setBoundary = function (boundary){  //plane
	var faceNormal = new Vector();
	faceNormal.normal(this.vertex(0).position, this.vertex(1).position, this.vertex(2).position);
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var edge = new Vector();
		edge.sub2 (this.vertex((i+1)%this.vertexSize).position, this.vertex(1).position);
		boundary[i].normal.exterior(faceNormal, edge);
		boundary[i].normal.normalize();
		boundary[i].passage.set2(this.vertex((i+1)%this.vertexSize).position);
	}
}

Face.prototype.ifIncluded = function (boundary, boundarySize, margin){  //plane int double
	margin = 0.1;
	var gravity = new Vector();
	var i;
	for (i = 0; i < this.vertexSize; i++)
		gravity.add (this.vertex(i).position);
	gravity.mul(1/this.vertexSize);
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

Face.prototype.renew = function (birthStage, faceGroupID, fold){  //int int fold
	if (this.label != UndoneFace)
		return RenewDone;
	if (faceGroupID != this.faceGroupID)
		return RenewFailure;
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.vertex(i).renew(birthStage, fold);
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].renew(birthStage, fold);
	var m = 0, f = 0;
	for (i = 0; i < this.vertexSize; i++){
		if (this.vertex(i).label == Moved)
			m++;
		else if (this.vertex(i).label == Fixed)
			f++;
	}
	if (f == 0)
		this.label = MovedFace;
	else if (m == 0)
		this.label = FixedFace;
	else{
		this.label = DividedFace;
		this.children[0] = new Face();
		this.children[0].set2 (this, birthStage);
		this.children[1] = new Face();
		this.children[1].set2 (this, birthStage);
		this.newEdge = new Edge();
		this.newEdge.set1 (this.children[0], this.children[1], birthStage);
		for (i = 0; i < this.vertexSize; i++){
			switch (this.edge[i].label){
				case MovedEdge:
					this.children[0].edge[this.children[0].vertexSize++] = this.edge[i];
					if (this.edge[(i+1)%this.vertexSize].label == FixedEdge){
						this.newEdge.vertex[0] = this.vertex((i+1)%this.vertexSize);
						this.children[0].edge[this.children[0].vertexSize++] = this.newEdge;
					}
					break;
				case FixedEdge:
					this.children[1].edge[this.children[1].vertexSize++] = this.edge[i];
					if (this.edge[(i+1)%this.vertexSize].label == MovedEdge){
						this.newEdge.vertex[1] = this.vertex((i+1)%this.vertexSize);
						this.children[1].edge[this.children[1].vertexSize++] = this.newEdge;
					}
					break;
				case DividedEdge:
					this.children[0].edge[this.children[0].vertexSize++] = this.edge[i].children[0].label == MovedEdge ? this.edge[i].children[0] : this.edge[i].children[1];
					this.children[1].edge[this.children[1].vertexSize++] = this.edge[i].children[0].label == FixedEdge ? this.edge[i].children[0] : this.edge[i].children[1];
					if (this.vertex(i).label == Moved){
						this.newEdge.vertex[0] = this.edge[i].newVertex;
						this.children[0].edge[this.children[0].vertexSize++] = this.newEdge;
					}else{
						this.newEdge.vertex[1] = this.edge[i].newVertex;
						this.children[1].edge[this.children[1].vertexSize++] = this.newEdge;
					}
					break;
			}
		}
	}
	for (i = 0; i < this.vertexSize; i++){
		if (this.edge[i].label == MovedEdge || this.edge[i].label == DividedEdge){
			if (this.connectFace(i) != null){
				if (this.connectFace(i).renew(birthStage, faceGroupID, fold) == RenewFailure)
					return RenewFailure;
			}
		}
	}
	return RenewSuccess;
}

Face.prototype.renewPointer = function (faceGroupID){  //int
	this.faceGroupID = faceGroupID;
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].renewPointer();
}

Face.prototype.resetPointer = function (deleteStage){  //int
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].resetPointer(deleteStage);
}

Face.prototype.reset = function (deleteStage, faceGroupID){  //int int
	this.faceGroupID = faceGroupID;
	var i;
	for (i = 0; i < this.vertexSize; i++)
		this.edge[i].reset(deleteStage);
	if (this.children[0] != null){
		delete this.children[0];
		this.children[0] = null;
	}
	if (this.children[1] != null){
		delete this.children[1];
		this.children[1] = null;
	}
	if (this.newEdge != null){
		delete this.newEdge;
		this.newEdge = null;
	}
}

Face.prototype.whichSide = function (plane, margin){  //plane double
	if (margin == undefined)
		margin = 0.01;
	var before = 0, behind = 0, onIntersection = 0;
	var i;
	for (i = 0; i < this.vertexSize; i++){
		var d = plane.signedDistance(this.vertex(i).position);
		if (d > margin)
			before = 1;
		else if (d < -margin)
			behind = 1;
		else
			onIntersection = 1;
	}
	if (before == 1 && behind == 0)
		return onIntersection ? InfrontContact : InfrontApart;
	else if (before == 0 && behind == 1)
		return onIntersection ? BehindContact : BehindApart;
	else
		return Across;
}

Face.prototype.draw = function (faceNormal, z){  //vector double
	var which = faceNormal.dot(this.normal());
	//console.log (which);
	/*var shape = new THREE.Shape();
    var i;
    for (i = 0; i < this.vertexSize; i++){
    	if (i < 1)
    		shape.moveTo (this.vertex(i).position.x, this.vertex(i).position.y, this.vertex(i).position.z);
    	else
    		shape.lineTo (this.vertex(i).position.x, this.vertex(i).position.y, this.vertex(i).position.z);
    }
    shape.lineTo (this.vertex(0).position.x, this.vertex(0).position.y, this.vertex(0).position.z);
    var paperGeo = new THREE.ShapeGeometry (shape);
*/
    var paperGeo = new THREE.Geometry();
    var i;
    for (i = 0; i < this.vertexSize; i++){
    	paperGeo.vertices.push(new THREE.Vector3(this.vertex(i).position.x, this.vertex(i).position.y, this.vertex(i).position.z));
    }
    var face;
    for (i = 0; i < this.vertexSize - 2; i++){
    	face = new THREE.Face3(0, i+1, i+2);
    	paperGeo.faces.push(face);
    }
    for (i = 0; i < this.vertexSize - 2; i++){
    	paperGeo.faceVertexUvs[0].push([new THREE.Vector2(this.vertex(0).texcoord.x, this.vertex(0).texcoord.y),
    		new THREE.Vector2(this.vertex(i+1).texcoord.x, this.vertex(i+1).texcoord.y),
    		new THREE.Vector2(this.vertex(i+2).texcoord.x, this.vertex(i+2).texcoord.y)]);
    }
    paperGeo.computeBoundingSphere();
	paperGeo.computeFaceNormals();
	paperGeo.computeVertexNormals();

    var shaderMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
            front: {
                type: 'c',
                value: fc
            },
            back: {
                type: 'c',
                value: bc
            },
            n: {
                type: 'f',
                value: which
            },
            tex: {
                type: 't',
                value: chooseTex
            },
            mode: {
            	type: 'i',
            	value: useColor
            }
        },
        vertexShader: document.getElementById('myVertexShader').textContent,
        fragmentShader: document.getElementById('myFragmentShader').textContent
    });
    
    var paper = new THREE.Mesh (paperGeo, shaderMaterial);
    paper.position.z += z;
    scene.add (paper);
    objects.push(paper);

    var material = new THREE.LineBasicMaterial({color: 0x000000});
	var geometry = new THREE.Geometry();
	for (i = 0; i < this.vertexSize; i++){
		var p = new THREE.Vector3();
		p.set (this.vertex(i).position.x, this.vertex(i).position.y, this.vertex(i).position.z + z);
		geometry.vertices.push(p);
	}
	var p = new THREE.Vector3();
	p.set(this.vertex(0).position.x, this.vertex(0).position.y, this.vertex(0).position.z + z);
	geometry.vertices.push(p);

	var line = new THREE.Line(geometry, material);
	scene.add (line);
	objects.push(line);
	//console.log (this.vertex(0));
}

//other
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
