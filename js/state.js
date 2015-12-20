var State = function(){
	this.inFolding = false;
	this.inAnimation = false;
	this.inRotation = false;
	this.inBending = false;
	this.drawAxis = false;
	this.fps = 60;
}

var cursor3D = function(){
	this.x = 0;
	this.y = 0;
	this.z = 0.0;
}

cursor3D.prototype.set = function (x, y, z){  //int int double
	if (z == undefined)
		z = 0.0;
	this.x = x;
	this.y = y;
	this.z = z;
}

var KState = function(){  //for keyboard press
	this.M = false;
	this.N = false;
	this.T = false;
}