var Stage = function(){
	this.ID = 0;
	this.faceGroup;
	this.faceGroupSize;
	this.fold = new Fold();
}

Stage.prototype.setOriginal = function(){
	this.ID = 0;
	this.faceGroup = [];
	this.faceGroup[0] = new FaceGroup();
	this.faceGroup[0].setOriginal();
	this.faceGroupSize = 1;
}

Stage.prototype.closestVertexPosition = function (vector){  //vector
	var closest = null;
	var distance = DBL_MAX;
	var dv = new DV();
	var i;
	for (i = 0; i < this.faceGroupSize; i++){
		dv.reset();
		this.faceGroup[i].closestVertex2 (vector, dv);
		if (dv.distance < distance){
			closest = dv.vertex;
			distance = dv.distance;
		}
	}
	return closest.position;
}

Stage.prototype.labelPickedCandidate = function (position){  //vector
	var i;
	for (i = 0; i < this.faceGroupSize; i++)
		this.faceGroup[i].labelPickedCandidate (position);
}

Stage.prototype.pick = function (v){  //vector
	this.labelPickedCandidate (this.closestVertexPosition(v));
	var i;
	for (i = 0; i < this.faceGroupSize; i++){
		if (this.fold.setPick2 (this.faceGroup[i], v))
			return this.fold.pickedVertexPosition();
	}
	return new Vector();
}

Stage.prototype.renew = function(){
	if (this.fold.pickedFaceGroup().renew(this.ID+1, this.fold) == RenewFailure)
		return true;
	else
		return false;
}

Stage.prototype.renew2 = function (destination, eyePosition, inBending){  //vector vector bool
	if (this.fold.update2 (destination, eyePosition, inBending))
		return true;
	return this.renew();
}

Stage.prototype.childFaceGroupSize = function(){
	return this.fold.isBend() ? this.faceGroupSize + 1 : this.faceGroupSize;
}

Stage.prototype.isPickedFaceGroup = function(n){  //int
	return this.faceGroup[n] == this.fold.pickedFaceGroup();
}

Stage.prototype.newStage = function(parentStage){  //stage
	this.ID = parentStage.ID + 1;
	this.faceGroupSize = parentStage.childFaceGroupSize();
	this.faceGroup = [];
	var i;
	for (i = 0; i < parentStage.faceGroupSize; i++){
		if (parentStage.isPickedFaceGroup(i)){
			this.faceGroup[i] = new FaceGroup();
			this.faceGroup[i].set (this.ID, parentStage.faceGroup[i], parentStage.fold);
		}else{
			this.faceGroup[i] = parentStage.faceGroup[i];
		}
	}
	if (parentStage.fold.isBend()){
		this.faceGroup[this.faceGroupSize - 1] = new FaceGroup();
		this.faceGroup[this.faceGroupSize - 1].set (this.ID, parentStage.fold.pickedFaceGroup(), parentStage.fold, this.faceGroupSize - 1);
		this.faceGroup[this.faceGroupSize - 1].normal.set2(parentStage.fold.rotateNormal(parentStage.fold.pickedFaceGroup().normal));
	}
}

Stage.prototype.reset = function(){
	this.fold.pickedFaceGroup().reset(this.ID+1);
}

Stage.prototype.draw = function (eyePosition){  //vector
	var renderGroup = [];
	renderGroup[0] = this.faceGroup[0];
	var i;
	for (i = 1; i < this.faceGroupSize; i++){
		renderGroup[i] = this.faceGroup[i];
		var j = i - 1;
		while (j >= 0 && renderGroup[j].sort(renderGroup[j+1], eyePosition) == 1){
			var tmp = renderGroup[j];
			renderGroup[j] = renderGroup[j+1];
			renderGroup[j+1] = tmp;
			j--;
		}
	}
	for (i = this.faceGroupSize-1; i >= 0; i--)
		renderGroup[i].draw (eyePosition);
	delete renderGroup;
}

Stage.prototype.saveFold = function (ID){  //int
	this.fold.save(ID);
}

Stage.prototype.loadFold = function (ID){  //int
	return this.fold.load(ID, this.faceGroup);
}

Stage.prototype.loadFold2 = function (ID, data, pt){  //int string pointer
	return this.fold.load2(ID, this.faceGroup, data, pt);
}