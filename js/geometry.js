//math
function rad (x){  //double
	return x * 1.74532925199433e-2;
}
function deg (x){  //double
	return x * 5.72957795130824e1;
}

//Plane
var Plane = function(){
	this.normal = new Vector();
	this.passage = new Vector();
}

Plane.prototype.set = function(a, b, c, d){  //double *4
	this.normal.set (a, b, c);
	if (Math.abs(a) > Math.abs(b) && Math.abs(a) > Math.abs(c))
		this.passage.set(-d/a, 0.0, 0.0);
	else if (Math.abs(b) > Math.abs(c))
		this.passage.set(0.0, -d/b, 0.0);
	else
		this.passage.set(0.0, 0.0, -d/c);
}

Plane.prototype.signedDistance = function(point){  //vector
	var b = new Vector();
	b.sub2(point, this.passage);
	return (b.dot(this.normal));
}

Plane.prototype.distance = function(point){  //vector
	return Math.abs(this.signedDistance(point));
}

Plane.prototype.equidistance = function(a, b){  //vector vector
	this.normal.sub2(b, a);
	this.passage.add2(a, b);
	this.passage.mul(0.5);
}

//Line
var Line = function(){
	this.direction = new Vector();
	this.passage = new Vector();
}

Line.prototype.distance = function(point){  //vector
	var plane = new Plane();
	plane.normal.set2(this.direction);
	plane.passage.set2(point);
	var projected = new Vector();
	projected.intersection(this, plane);
	return projected.distance(point);
}

Line.prototype.equidistance = function(a, b){  //line line
	var vertical = new Vector();
	vertical.exterior(a.direction, b.direction);
	var pl = new Plane();
	pl.normal.exterior(a.direction, vertical);
	pl.passage.set2(a.passage);
	a.direction.normalize();
	b.direction.normalize();
	this.direction.add2(a.direction, b.direction);
	this.passage.intersection(b, pl);
}

Line.prototype.intersection = function(a, b){  //plane plane
	var ai, bi, d;
	this.direction.exterior(a.normal, b.normal);
	this.direction.normalize();
	ai = a.normal.dot(a.passage);
	bi = b.normal.dot(b.passage);

	if (Math.abs(this.direction.x) > Math.abs(this.direction.y) && Math.abs(this.direction.x) > Math.abs(this.direction.z)){
		this.passage.x = 0;
		d = a.normal.y * b.normal.z - a.normal.z * b.normal.y;
		this.passage.y = (ai * b.normal.z - bi * a.normal.z) / d;
		this.passage.z = -(ai * b.normal.y - bi * a.normal.y) / d;
	}else if (Math.abs(this.direction.y) > Math.abs(this.direction.z)){
		this.passage.y = 0;
		d = a.normal.z * b.normal.x - a.normal.x * b.normal.z;
		this.passage.z = (ai * b.normal.x - bi * a.normal.x) / d;
		this.passage.x = -(ai * b.normal.z - bi * a.normal.z) / d;
	}else{
		this.passage.z = 0;
		d = a.normal.x * b.normal.y - a.normal.y * b.normal.x;
		this.passage.x = (ai * b.normal.y - bi * a.normal.y) / d;
		this.passage.y = -(ai * b.normal.x - bi * a.normal.x) / d;
	}
}

Line.prototype.set = function(a, b){   // vector vector
	this.direction.sub2(b, a);
	this.passage.set2(a);
}