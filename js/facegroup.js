var FaceGroup = function(){
	this.ID = 0;
	this.birthStage = 0;
	this.face = [];
	this.faceSize;
	this.normal = new Vector();
}

FaceGroup.prototype.setOriginal = function(){
	this.ID = 0;
	this.birthStage = 0;
	this.faceSize = 1;
	this.face[0] = new Face();
	this.face[0].setOriginal();
	this.normal.set (0, 0, 1);
}

FaceGroup.prototype.closestVertex = function (line, dv){  //line dv
	var dv2 = new DV();
	var i;
	for (i = 0; i < this.faceSize; i++){
		dv2.reset();
		this.face[i].closestVertex (line, dv2);
		if (dv2.distance < dv.distance){
			dv.vertex = dv2.vertex;
			dv.distance = dv2.distance;
		}
	}
}

FaceGroup.prototype.labelPickedCandidate = function (position){  //vector
	var i;
	for (i = 0; i < this.faceSize; i++)
		this.face[i].labelPickedCandidate (position);
}

FaceGroup.prototype.closestVertex2 = function (position, dv){  //vector dv
	var dv2 = new DV();
	var i;
	for (i = 0; i < this.faceSize; i++){
		dv2.reset();
		this.face[i].closestVertex2 (position, dv2);
		if (dv2.distance < dv.distance){
			dv.vertex = dv2.vertex;
			dv.distance = dv2.distance;
			//console.log ('check facegroup');
		}
	}
}

FaceGroup.prototype.closestVertex3 = function (line, dv, except, apartMargin){  //line dv vector double
	if (apartMargin == undefined)
		apartMargin = 1.0;
	var dv2 = new DV();
	var i;
	for (i = 0; i < this.faceSize; i++){
		dv2.reset();
		this.face[i].closestVertex3 (line, dv2, except, apartMargin);
		if (dv2.distance < dv.distance){
			dv.vertex = dv2.vertex;
			dv.distance = dv2.distance;
		}
	}
}

FaceGroup.prototype.pickedFaceList = function (pickedVertex){  //vertex
	var n = 0, i;
	var faceList = [];
	for (i = 0; i < this.faceSize; i++){
		if (this.face[i].include(pickedVertex))
			faceList[n++] = this.face[i];
	}
	faceList[n++] = null;
	return faceList;
}

FaceGroup.prototype.closestEdge = function (dv, p0, p1){  //dv vector vector
	/*var closest = null;
	distance = DBL_MAX;*/
	var closest = null;
	dv.distance = DBL_MAX;
	var dv2 = new DV();
	var i;
	for (i = 0; i < this.faceSize; i++){
		dv2.reset();
		var e = this.face[i].closestEdge (dv2, p0, p1);
		if (dv2.distance < dv.distance){
			closest = e;
			dv.distance = dv2.distance;
		}
	}
	return closest;
}

FaceGroup.prototype.labelVertices = function (fold){  //fold
	var allMoved = true;
	var allFixed = true;
	var i;
	for (i = 0; i < this.faceSize; i++){
		switch (this.face[i].labelVertices(fold)){
			case AllMoved:
				allFixed = false;
				break;
			case AllFixed:
				allMoved = false;
				break;
			case MovedAndFixed:
				allMoved = allFixed = false;
				break;
		}
	}
	return allMoved ? AllMoved : allFixed ? AllFixed : MovedAndFixed;
}

FaceGroup.prototype.clearEdgeAndFaceLabels = function(){
	var i;
	for (i = 0; i < this.faceSize; i++)
		this.face[i].clearEdgeAndFaceLabels();
}

FaceGroup.prototype.renewFoldUp = function (birthStage, fold){  //int fold
	var renewDone = 1;
	var i, j;
	for (i = 0; i < this.faceSize; i++){
		for (j = i + 1; j < this.faceSize; j++){
			if (this.face[i].label == MovedFace && this.face[i].overlap(this.face[j]) || this.face[i].label == DividedFace && this.face[i].children[0].overlap(this.face[j])){
				switch (this.face[j].renew(birthStage, this.ID, fold)){
					case RenewSuccess:
						renewDone = 0;
						break;
					case RenewFailure:
						return RenewFailure;
				}
			}
		}
	}
	return renewDone ? RenewDone : RenewSuccess;
}

FaceGroup.prototype.renewFoldDown = function (birthStage, fold){  //int fold
	var renewDone = 1;
	var i, j;
	for (i = this.faceSize - 1; i >= 0; i--){
		for (j = i - 1; j >= 0; j--){
			if (this.face[i].label == MovedFace && this.face[i].overlap(this.face[j]) || this.face[i].label == DividedFace && this.face[i].children[0].overlap(this.face[j])){
				switch (this.face[j].renew(birthStage, this.ID, fold)){
					case RenewSuccess:
						renewDone = 0;
						break;
					case RenewFailure:
						return RenewFailure;
				}
			}
		}
	}
	return renewDone ? RenewDone : RenewSuccess;
}

FaceGroup.prototype.renewTuckIn = function (birthStage, fold){  //int fold
	var renewDone = 1;
	var lowest = 0;
	while (this.face[lowest].label != MovedFace && this.face[lowest].label != DividedFace && lowest < this.faceSize - 1)
		lowest ++;
	var highest = this.faceSize - 1;
	while (this.face[highest].label != MovedFace && this.face[highest].label != DividedFace && highest > 0)
		highest --;
	var i;
	for (i = lowest + 1; i < highest; i++){
		if (this.face[lowest].label == MovedFace && this.face[lowest].overlap(this.face[i]) || this.face[lowest].label == DividedFace && this.face[lowest].children[0].overlap(this.face[i])){
			switch (this.face[i].renew(birthStage, this.ID, fold)){
				case RenewSuccess:
					renewDone = 0;
					break;
				case RenewFailure:
					return RenewFailure;
			}
		}
	}
	return renewDone ? RenewDone : RenewSuccess;
}

FaceGroup.prototype.renew = function (birthStage, fold){  //int fold
	if (this.labelVertices(fold) != MovedAndFixed)
		return RenewFailure;
	this.clearEdgeAndFaceLabels();
	var renewFailure = false;
	if (fold.pickedFace().renew(birthStage, this.ID, fold) == RenewFailure)
		renewFailure = true;
	else if (fold.pickedFace().label == FixedFace)
		renewFailure = true;
	else{
		switch (fold.type){
			case FoldUp:
				if (this.renewFoldUp(birthStage, fold) == RenewFailure)
					renewFailure = true;
				break;
			case FoldDown:
				if (this.renewFoldDown(birthStage, fold) == RenewFailure)
					renewFailure = true;
				break;
			case TuckIn:
				if (this.renewTuckIn(birthStage, fold) == RenewFailure)
					renewFailure = true;
				break;
			case BendUp:
				if (this.renewFoldUp(birthStage, fold) == RenewFailure)
					renewFailure = true;
				break;
			case BendDown:
				if (this.renewFoldDown(birthStage, fold) == RenewFailure)
					renewFailure = true;
				break;
		}
	}
	if (renewFailure){
		this.reset(this.ID + 1);
		return RenewFailure;
	}
	return RenewSuccess;
}

FaceGroup.prototype.constructFoldUp = function (parentFaceGroup){  //facegroup
	this.normal.set2(parentFaceGroup.normal);
	this.faceSize = 0;
	var i;
	for (i = 0; i < parentFaceGroup.faceSize; i++){
		if (parentFaceGroup.face[i].label == FixedFace || parentFaceGroup.face[i].label == UndoneFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[1];
		}
	}
	for(i = parentFaceGroup.faceSize - 1; i >= 0; i--){
		if(parentFaceGroup.face[i].label == MovedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if(parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[0];
		}
	}
}

FaceGroup.prototype.constructFoldDown = function (parentFaceGroup){  //facegroup
	this.normal.set2(parentFaceGroup.normal);
	this.faceSize = 0;
	var i;
	for(i = parentFaceGroup.faceSize - 1; i >= 0; i--){
		if(parentFaceGroup.face[i].label == MovedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if(parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[0];
		}
	}
	for (i = 0; i < parentFaceGroup.faceSize; i++){
		if (parentFaceGroup.face[i].label == FixedFace || parentFaceGroup.face[i].label == UndoneFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[1];
		}
	}
}

FaceGroup.prototype.constructBend0 = function (parentFaceGroup){  //facegroup
	this.normal.set2(parentFaceGroup.normal);
	this.faceSize = 0;
	var i;
	for(i = 0; i < parentFaceGroup.faceSize; i++){
		if(parentFaceGroup.face[i].label == FixedFace || parentFaceGroup.face[i].label == UndoneFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if(parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[1];
		}
	}
}

FaceGroup.prototype.constructBend1 = function (parentFaceGroup){  //facegroup
	this.normal.set2(parentFaceGroup.normal);
	this.faceSize = 0;
	var i;
	for(i = 0; i < parentFaceGroup.faceSize; i++){
		if(parentFaceGroup.face[i].label == MovedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if(parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[0];
		}
	}
}

FaceGroup.prototype.constructTuckIn = function (parentFaceGroup){  //facegroup
	this.normal.set2(parentFaceGroup.normal);
	this.faceSize = 0;
	var lowest = 0;
	while (parentFaceGroup.face[lowest].label != MovedFace && parentFaceGroup.face[lowest].label != DividedFace)
		lowest++;
	var highest = parentFaceGroup.faceSize - 1;
	while (parentFaceGroup.face[highest].label != MovedFace && parentFaceGroup.face[highest].label != DividedFace)
		highest--;
	var middle = Math.floor((lowest + highest) / 2);

	var i;
	for (i = 0; i <= middle; i++){
		if (parentFaceGroup.face[i].label == FixedFace || parentFaceGroup.face[i].label == UndoneFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[1];
		}
	}
	for (i = middle; i >= 0; i--){
		if (parentFaceGroup.face[i].label == MovedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[0];
		}
	}
	for (i = parentFaceGroup.faceSize - 1; i > middle; i--){
		if (parentFaceGroup.face[i].label == MovedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[0];
		}
	}
	for (i = middle + 1; i < parentFaceGroup.faceSize; i++){
		if (parentFaceGroup.face[i].label == FixedFace || parentFaceGroup.face[i].label == UndoneFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i];
		}else if (parentFaceGroup.face[i].label == DividedFace){
			this.face[this.faceSize++] = parentFaceGroup.face[i].children[1];
		}
	}
}

FaceGroup.prototype.renewPointer = function(){
	var i;
	for (i = 0; i < this.faceSize; i++)
		this.face[i].renewPointer(this.ID);
}

FaceGroup.prototype.set = function (birthStage, parentFaceGroup, fold, groupNumber){  //int facegroup fold int
	if (groupNumber == undefined)
		groupNumber = -1;
	this.ID = groupNumber == -1 ? parentFaceGroup.ID : groupNumber;
	this.birthStage = birthStage;
	switch (fold.type){
		case FoldUp:
			this.constructFoldUp(parentFaceGroup);
			break;
		case FoldDown:
			this.constructFoldDown(parentFaceGroup);
			break;
		case TuckIn:
			this.constructTuckIn(parentFaceGroup);
			break;
		case BendUp:
			groupNumber == -1 ? this.constructBend0(parentFaceGroup) : this.constructBend1(parentFaceGroup);
			break;
		case BendDown:
			groupNumber == -1 ? this.constructBend0(parentFaceGroup) : this.constructBend1(parentFaceGroup);
			break;
	}
	this.renewPointer();
}

FaceGroup.prototype.reset = function (deleteStage){  //int
	var i;
	for (i = 0; i < this.faceSize; i++)
		this.face[i].resetPointer (deleteStage);
	for (i = 0; i < this.faceSize; i++)
		this.face[i].reset (deleteStage, this.ID);
}

FaceGroup.prototype.visibleSide = function (eyePosition){  //vector
	var n = new Vector();
	n.sub2 (this.face[0].vertex(0).position, eyePosition);
	var normal = new Vector();
	normal.set2(this.normal);
	return normal.dot(n) < 0 ? 0 : 1;
}

FaceGroup.prototype.whichSide = function (plane){  //plane
	var infront = false, behind = false, onIntersection = false;
	var i;
	for (i = 0; i < this.faceSize; i++){
		switch (this.face[i].whichSide(plane)){
			case InfrontApart:
				infront = true;
				break;
			case InfrontContact:
				infront = onIntersection = true;
				break;
			case Across:
				infront = behind = true;
				break;
			case BehindContact:
				behind = onIntersection = true;
				break;
			case BehindApart:
				behind = true;
				break;
		}
	}
	if (infront && !behind)
		return onIntersection ? InfrontContact : InfrontApart;
	else if (!infront && behind)
		return onIntersection ? BehindContact : BehindApart;
	else
		return Across;
}

FaceGroup.prototype.sort = function (faceGroup, eyePosition){  //facegroup vector
	var plane = new Plane();
	var tmp = new Vector();
	tmp.set2(faceGroup.normal);
	tmp.reverse();
	plane.normal.set2(faceGroup.visibleSide(eyePosition) == 0 ? faceGroup.normal : tmp);
	plane.passage.set2(faceGroup.face[0].vertex(0).position);
	var side0 = this.whichSide(plane);
	tmp.set2(this.normal);
	tmp.reverse();
	plane.normal.set2(this.visibleSide(eyePosition) == 0 ? this.normal : tmp);
	plane.passage.set2(this.face[0].vertex(0).position);
	var side1 = faceGroup.whichSide(plane);
	if ((side0 == InfrontApart || side0 == InfrontContact) && (side1 == Across || side1 == BehindContact))
		return 0;
	if ((side1 == BehindApart || side1 == BehindContact) && (side0 == Across || side0 == InfrontContact))
		return 0;
	return 1;
}

FaceGroup.prototype.draw = function (eyePosition){  //vector
	var tmp = new Vector();
	var i, z = 0;
	tmp.sub2 (this.face[0].vertex(0).position, eyePosition);
	if (tmp.dot (this.normal) < 0.0){
		for (i = 0; i < this.faceSize; i++){
			this.face[i].draw (this.normal, z);
			z += 0.01;
		}
	}else{
		var frontNormal = new Vector();
		frontNormal.set2(this.normal);
		frontNormal.reverse();
		for (i = this.faceSize - 1; i >= 0; i--){
			this.face[i].draw (frontNormal, z);
			z -= 0.01;
		}
	}
}