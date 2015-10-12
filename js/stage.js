var Stage = function(){
	this.ID = 0;
	this.faceGroup = new FaceGroup();
	this.faceGroupSize;
	this.fold = new Fold();
}

Stage.prototype.childFaceGroupSize = function(){
	return this.fold.isBend() ? faceGroupSize + 1 : faceGroupSize;
}

Stage.prototype.isPickedFaceGroup = function(n){
	return this.faceGroup[n] == this.fold.faceGroup;
}

Stage.prototype.newStage = function(parentStage){
	this.ID = parentStage.ID + 1;
	this.faceGroupSize = parentStage.childFaceGroupSize();
	//this.faceGroup = 
	var i;
	for (i = 0; i < parentStage.faceGroupSize; i++){
		if (parentStage.isPickedFaceGroup(i)){
			this.faceGroup[i]
		}
	}
}