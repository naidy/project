var Origami = function(){
	this.maxStage = 0;
	this.tentative = false;
	
	this.stage = [];
	var i;
	for (i = 0; i < 256; i++)
		this.stage[i] = new Stage();

	//var faceProperty;
	//var adjust;
	//var animation;
}

Origami.prototype.moveVertex = function(destination, eyePosition, inBending){
	if (this.tentative){
		this.reset();
		this.tentative = false;
	}
	if (this.stage[this.maxStage].fold.update2(destination, eyePosition, inBending)){
		this.tentative = false;
		return;
	}
	
	/*if (stage[maxStage].renew()){
		this.tentative = false;
		return;
	}*/
	//Stage[maxStage+1] = new Stage();
	this.maxStage++;
	this.tentative = true;
}

Origami.prototype.releaseVertex = function(){
	this.tentative = false;
}

Origami.prototype.reset = function(){
	this.maxStage--;
	//delete Stage[maxStage+1];
	//Stage[maxStage].reset();
}