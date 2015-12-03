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
	this.position = new Vector();
	this.texcoord = new Vector2D();
	this.label;
	this.parent;
	this.child;
}

Vertex.prototype.set = function(position, texcoord){  //vector vector2D
	this.birthStage = 0;
	this.position.set2(position);
	this.texcoord.set2(texcoord);
	this.parent = this.child = null;
}

Vertex.prototype.labelPickedCandidate = function(position, margin){  //vector double
	if (margin == undefined)
		margin = 0.3;
	this.label = position.distance(this.position) < margin ? PickedCandidate : NotPicked;
}

Vertex.prototype.setLabel = function(fold, margin){  //fold  double
	if (margin == undefined)
		margin = 0.01;
	return this.label = fold.vertexLabel (this.position, margin);
}

Vertex.prototype.set2 = function(vertex1, vertex2, birthStage, fold){  //vertex vertex int fold
	this.birthStage = birthStage;
	this.position.set2(fold.newVertexPosition(vertex1.position, vertex2.position));
	var m = vertex1.position.distance(this.position);
	var n = vertex2.position.distance(this.position);
	this.texcoord.divide(vertex1.texcoord, vertex2.texcoord, m, n);
	this.parent = this.child = null;
}

Vertex.prototype.set3 = function(parentVertex, birthStage, fold){  //vertex int fold
	this.birthStage = birthStage;
	this.position.set2(fold.rotateVertexPosition(parentVertex.position));
	this.texcoord.set2(parentVertex.texcoord);
	this.parent = parentVertex;
	this.child = null;
}

Vertex.prototype.renew = function (birthStage, fold){  //int fold
	if (this.label == MovedCandidate){
		this.label = Moved;
		this.child = new Vertex();
		this.child.set3 (this, birthStage, fold);
	}
}
