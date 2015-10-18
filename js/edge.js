//EdgeLabel
var UndoneEdge = 'UndoneEdge';
var MovedEdge = 'MovedEdge';
var FixedEdge = 'FixedEdge';
var DividedEdge = 'DividedEdge';

var Edge = function(){
	this.birthStage = 0;
	this.face = [];
	this.vertex = [];
	this.label;
	this.newVertex = null;
	this.parent = null;
	this.children = [];
	
	var i;
	for (i = 0; i < 2; i++){
		this.face[i] = null;
		this.vertex[i] = null;
		this.children[i] = null;
	}
}

Edge.prototype.set1 = function(children0, children1, birthStage){  //face face int
	this.birthStage = birthStage;
	this.face[0] = children0;
	this.face[1] = children1;
	this.label = FixedEdge;
}

Edge.prototype.set2 = function(parentEdge, birthStage){  //edge int
	this.birthStage = birthStage;
	this.face[0] = parentEdge.face[0];
	this.face[1] = parentEdge.face[1];
	this.parent = parentEdge;
}

Edge.prototype.distance = function(p0, p1){   //vector vector
	var e = new Line();
	e.set(this.vertex[0].position, vertex[1].position);
	var d0 = e.distance(p0);
	var d1 = e.distance(p1);
	return d0 > d1 ? d0 : d1;
}

Edge.prototype.connectFace = function(face){  //face
	return face == this.face[0] ? this.face[1] : this.face[0];
}

Edge.prototype.renew = function(birthStage, fold){  //int fold
	if (this.label != UndoneEdge)
		return;
	if (this.vertex[0].label == Moved && this.vertex[1].label == Fixed || this.vertex[1].label == Moved && this.vertex[0].label == Fixed){
		this.label = DividedEdge;
		var i;
		for (i = 0; i < 2; i++){
			this.children[i] = new Edge();
			this.children[i].set2 (this, birthStage);
		}
		this.newVertex = new Vertex();
		this.newVertex.set2 (this.vertex[0], this.vertex[1], birthStage, fold);
		this.children[0].vertex[0] = this.vertex[0];
		this.children[0].vertex[1] = this.newVertex;
		this.children[1].vertex[0] = this.newVertex;
		this.children[1].vertex[1] = this.vertex[1];
		this.children[0].label = this.vertex[0].label == Moved ? MovedEdge : FixedEdge;
		this.children[1].label = this.vertex[1].label == Moved ? MovedEdge : FixedEdge;
	}else if (this.vertex[0].label == Moved || this.vertex[1].label == Moved){
		this.label = MovedEdge;
	}else{
		this.label = FixedEdge;
	}
}

Edge.prototype.reset = function(deleteStage){  //int
	if (this.vertex[0].child != null){
		delete this.vertex[0].child;
		this.vertex[0].child = null;
	}
	if (this.vertex[1].child != null){
		delete this.vertex[1].child;
		this.vertex[1].child = null;
	}
	if (this.children[0] != null){
		delete this.children[0];
		this.children[0] = null;
	}
	if (this.children[1] != null){
		delete this.children[1];
		this.children[1] = null;
	}
	if (this.newVertex != null){
		delete this.newVertex;
		this.newVertex = null;
	}
}

Edge.prototype.primaryVertex = function (face){  //face
	return face == this.face[0] || face.parent == this.face[0] || face.children[0] == this.face[0] || face.children[1] == this.face[0] ? this.vertex[0] : this.vertex[1];
}