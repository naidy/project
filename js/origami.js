//animation
var Animation = function(){
	var position;
}

Animation.prototype.updatePosition = function (delta){ //double
	if (this.position < 0.0)
		this.position = delta;
	else
		this.position += delta;
	return this.position;
}

//origami
var Origami = function(){
	this.maxStage = 0;
	this.stage = [];
	this.tentative = false;
	this.adjust = new Adjust();
	this.animation = new Animation();
}

Origami.prototype.setOriginal = function(){
	this.maxStage = 0;
	this.stage[0] = new Stage();
	this.stage[0].setOriginal();
	this.tentative = false;
}

Origami.prototype.pickVertex = function (v){  //vector
	return this.stage[this.maxStage].pick (v);
}

Origami.prototype.moveVertex = function (destination, eyePosition, inBending){  //vector vector bool
	if (this.tentative){
		this.reset();
		this.tentative = false;
	}
	if (this.stage[this.maxStage].fold.update2 (destination, eyePosition, inBending)){
		this.tentative = false;
		return;
	}
	this.adjust.correctDestination (this.stage[this.maxStage]);
	if (this.stage[this.maxStage].renew()){
		this.tentative = false;
		return;
	}
	this.stage[this.maxStage+1] = new Stage();
	this.stage[this.maxStage+1].newStage(this.stage[this.maxStage]);
	this.maxStage++;
	this.tentative = true;
}

Origami.prototype.releaseVertex = function(){
	this.tentative = false;
}

Origami.prototype.reset = function(){
	if (this.maxStage == 0)
		return;
	this.maxStage--;
	delete this.stage[this.maxStage+1];
	this.stage[this.maxStage].reset();
}

Origami.prototype.reset2 = function (maxStage){  //int
	while (this.maxStage > maxStage)
		this.reset();
}

Origami.prototype.draw = function (eyePosition){  //vector
	this.stage[this.maxStage].draw (eyePosition);
}

Origami.prototype.drawAdjust = function(){
	if (this.tentative)
		this.adjust.draw();
}