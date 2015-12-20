//animation
var Animation = function(){
	var position;
	var step = 0;
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

Origami.prototype.save = function(){
	str = "";
	var i;
	for (i = 0; i < this.maxStage; i++)
		this.stage[i].saveFold(i);
}

Origami.prototype.load = function(){
	this.reset2(0);
	while (this.stage[this.maxStage].loadFold(this.maxStage)){
		this.stage[this.maxStage].renew();
		this.stage[this.maxStage+1] = new Stage();
		this.stage[this.maxStage+1].newStage(this.stage[this.maxStage]);
		this.maxStage++;
	}
}

Origami.prototype.load2 = function(data){  //string
	this.reset2(0);
	var pt = 0;
	while (this.stage[this.maxStage].loadFold2(this.maxStage, data, pt)){
		this.stage[this.maxStage].renew();
		this.stage[this.maxStage+1] = new Stage();
		this.stage[this.maxStage+1].newStage(this.stage[this.maxStage]);
		this.maxStage++;
		pt += 7;
	}
}

Origami.prototype.play = function (fps){  //int
	if (this.animation.position < 0.0){
		if (!this.stage[this.maxStage].loadFold(this.animation.step)){
			return true;
		}
		this.animation.step++;
	}
	else {
		this.reset();
	}
	this.stage[this.maxStage].fold.modify(this.animation.updatePosition(1.0/fps));
	this.stage[this.maxStage].renew();
	this.stage[this.maxStage+1] = new Stage();
	this.stage[this.maxStage+1].newStage(this.stage[this.maxStage]);
	this.maxStage++;
	if (this.animation.position >= 1.0)
		this.animation.position = -1.0;
	return false;
}