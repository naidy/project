//AdjustType
var NoAdjust = 'NoAdjust';
var AdjustVertex = 'AdjustVertex';
var AdjustEdge = 'AdjustEdge';
var DiagonalFold = 'DiagonalFold';
var ArrangeAngle = 'ArrangeAngle';

var Adjust = function(){
	this.type;
	this.markVertex = [];
	this.markEdge = [];
	this.margin;
	this.marginAngle;
}

Adjust.prototype.clear = function(){
	this.type = NoAdjust;
}

Adjust.prototype.set = function(){
	this.clear();
	this.margin = 0.5;
	this.marginAngle = 5.0;
}

Adjust.prototype.adjustVertex = function (stage){  //stage
	var dv = new DV();
	stage.fold.pickedFaceGroup().closestVertex2 (stage.fold.destination, dv);
	if (dv.distance < this.margin){
		this.type = AdjustVertex;
		this.markVertex[0] = dv.vertex;
		stage.fold.update3 (dv.vertex.position);
		return true;
	}
	return false;
}

Adjust.prototype.correctBend = function (stage){  //stage
	var angle = stage.fold.angle;
	if (Math.abs(deg(angle)-90.0) < this.marginAngle){
		angle = rad(90.0);
		this.type = ArrangeAngle;
	}else if (Math.abs(deg(angle)+90.0) < this.marginAngle){
		angle = -rad(90.0);
		this.type = ArrangeAngle;
	}else if (Math.abs(deg(angle)-45.0) < this.marginAngle){
		angle = rad(45.0);
		this.type = ArrangeAngle;
	}else if (Math.abs(deg(angle)+45.0) < this.marginAngle){
		angle = -rad(45.0);
		this.type = ArrangeAngle;
	}
	if (this.type == ArrangeAngle){
		var destination = new Vector();
		destination.rotate4(stage.fold.vertex.position, stage.fold.axis, angle);
		stage.fold.update3 (destination);
		return true;
	}
	return false;
}

Adjust.prototype.adjustDiagonal = function (stage){
	var cd0 = new DV();
	var cd1 = new DV();
	stage.fold.faceGroup.closestVertex (stage.fold.axis, cd0);
	stage.fold.faceGroup.closestVertex3 (stage.fold.axis, cd1, cd0.vertex.position);
	if (cd0.distance < this.margin && cd1.distance < this.margin){
		this.type = DiagonalFold;
		var adjustAxis = new Line();
		adjustAxis.set (cd0.vertex.position, cd1.vertex.position);
		if (stage.fold.axis.direction.dot(adjustAxis.direction) < 0.0)
			adjustAxis.direction.reverse();
		var destination = new Vector();
		destination.rotate4 (stage.fold.vertex.position, adjustAxis, stage.fold.angle);
		this.markVertex[0] = cd0.vertex;
		this.markVertex[1] = cd1.vertex;
		stage.fold.update3 (destination);
		return true;
	}
	return false;
}

Adjust.prototype.adjustEdge = function (stage){
	var pickedFaceList = stage.fold.faceGroup.pickedFaceList (stage.fold.vertex);
	var pickedVertex = stage.fold.vertex;
	var pickedFaceGroup = stage.fold.faceGroup;
	var f = 0;
	while (pickedFaceList[f] != null){
		var pickedEdge = [], closestEdge = [];
		var distance = [];
		var rotatedPosition = [], a = [], b = [];
		rotatedPosition[0] = a;
		rotatedPosition[1] = b;
		var e, v;
		for (e = 0; e < 2; e++){
			pickedEdge[e] = pickedFaceList[f].neighborEdge (pickedVertex, e);
			for (v = 0; v < 2; v++)
				rotatedPosition[e][v] = stage.fold.rotateVertexPosition (pickedEdge[e].vertex[v].position);
			closestEdge[e] = pickedFaceGroup.closestEdge (distance[e], rotatedPosition[e][0], rotatedPosition[e][1]);
		}
		if (distance[0] < this.margin || distance[1] < this.margin){
			this.type = AdjustEdge;
			var line = [];
			var e2 = distance[0] < distance[1] ? 0 : 1;
			line[0] = new Line();
			line[0].set (pickedEdge[e2].vertex[0].position, pickedEdge[e2].vertex[1].position);
			line[1] = new Line();
			line[1].set (closestEdge[e2].vertex[0].position, closestEdge[e2].vertex[1].position);
			var v2 = new Vector();
			v2.sub2(rotatedPosition[e2][1], rotatedPosition[e2][0]);
			if (line[1].direction.dot(v2) < 0.0)
				line[0].direction.reverse();
			this.markEdge = pickedEdge[e2];
			if (line[1].direction.angle (line[0].direction) > Math.PI * 0.9){
				stage.fold.destination.projection3(line[1]);
			}else{
				var axis = new Line();
				axis.equidistance (line[0], line[1]);
				stage.fold.destination.set2(stage.fold.vertex.position);
				stage.fold.destination.rotate3(axis, stage.fold.angle);
			}
			stage.fold.update();
			return true;
		}
		f++;
	}
	delete pickedFaceList;
	return false;
}

Adjust.prototype.correctDestination = function (stage){  //stage
	this.type = NoAdjust;
	if (this.adjustVertex(stage))
		return;
	if (stage.fold.isBend() && this.correctBend(stage))
		return;
	if (this.adjustDiagonal(stage))
		return;
	if (this.adjustEdge(stage))
		return;
}

Adjust.prototype.draw = function (){  //double
	switch (this.type){
		case AdjustVertex:
			lightVertex(this.markVertex[0]);
			break;
		case AdjustEdge:
			if (this.markEdge.label == DividedEdge){
				if (this.markEdge.children[0].label == MovedEdge){
					this.markVertex[0] = this.markEdge.children[0].vertex[0];
					this.markVertex[1] = this.markEdge.children[0].vertex[1];
				}else{
					this.markVertex[0] = this.markEdge.children[1].vertex[0];
					this.markVertex[1] = this.markEdge.children[1].vertex[1];
				}
			}else{
				this.markVertex[0] = this.markEdge.vertex[0];
				this.markVertex[1] = this.markEdge.vertex[1];
			}
			lightVertex(this.markVertex[0]);
			lightVertex(this.markVertex[1]);
			break;
		case DiagonalFold:
			lightVertex(this.markVertex[0]);
			lightVertex(this.markVertex[1]);
			break;
	}
}