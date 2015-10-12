//  Plane
var Plane = function(){
	this.normal = new THREE.Vector3();
	this.passage = new THREE.Vector3();
}

Plane.prototype.set = function(a, b, c, d){
	this.normal.set (a, b, c);
	if (Math.abs(a) > Math.abs(b) && Math.abs(a) > Math.abs(c))
		this.passage.set(-d/a, 0.0, 0.0);
	else if (Math.abs(b) > Math.abs(c))
		this.passage.set(0.0, -d/b, 0.0);
	else
		this.passage.set(0.0, 0.0, -d/c);
}

Plane.prototype.signedDistance = function(point){
	var p = new THREE.Vector3();
	p.copy(point);
	return (p.sub(this.passage)).dot(this.normal);
}

Plane.prototype.distance = function(point){
	return Math.abs(this.signedDistance(point));
}

Plane.prototype.equidistance = function(A, B){
	var a = new THREE.Vector3();
	var b = new THREE.Vector3();
	a.copy(A);
	b.copy(B);
	this.normal.copy(a.sub(b));
	this.passage.copy(a.add(b));
	this.passage.multiplyScalar(0.5);
}

//Line
var Line = function(){
	this.direction = new THREE.Vector3();
	this.passage = new THREE.Vector3();
}

Line.prototype.set = function(a, b){
	this.direction.subVectors(b, a);
	this.passage.copy (a);
}

Line.prototype.distance = function(point){
	var plane = new Plane();
	plane.normal.copy(this.direction);
	var p = new THREE.Vector3();
	p.copy(point);
	plane.passage.copy(p);
	var projected = new THREE.Vector3();
	LinePlaneIntersection(projected, this, plane);
	return VectorVectorDistance(projected, point);
}

Line.prototype.equidistance = function(a, b){
	var vertical = new THREE.Vector3();
	VectorVectorVectorExterior(vertical, a.direction, b.direction);
	var pl = new Plane();
	VectorVectorVectorExterior(pl.normal, a.direction, vertical);
	pl.passage.copy (a.passage);
	a.direction.normalize();
	b.direction.normalize();
	this.direction.addVectors(a.direction, b.direction);
	LinePlaneIntersection (this.passage, b, pl);
}

Line.prototype.intersection = function(a, b){
	var ai, bi, d;
	VectorVectorVectorExterior(this.direction, a.normal, b.normal);
	this.direction.normalize();
	var an = new THREE.Vector3();
	an.copy(a.normal);
	ai = an.dot(a.passage);
	var bn = new THREE.Vector3();
	bn.copy(b.normal);
	bi = bn.dot(b.passage);

	if (Math.abs(this.direction.x) > Math.abs(this.direction.y) && Math.abs(this.direction.x) > Math.abs(this.direction.z)){
		this.passage.setX(0);
		d = a.normal.y * b.normal.z - a.normal.z * b.normal.y;
		this.passage.setY ((ai * b.normal.z - bi * a.normal.z) / d);
		this.passage.setZ (-(ai * b.normal.y - bi * a.normal.y) / d);
	}else if (Math.abs(this.direction.y) > Math.abs(this.direction.z)){
		this.passage.setY(0);
		d = a.normal.z * b.normal.x - a.normal.x * b.normal.z;
		this.passage.setZ ((ai * b.normal.x - bi * a.normal.x) / d);
		this.passage.setX (-(ai * b.normal.z - bi * a.normal.z) / d);
	}else{
		this.passage.setZ(0);
		d = a.normal.x * b.normal.y - a.normal.y * b.normal.x;
		this.passage.setX ((ai * b.normal.y - bi * a.normal.y) / d);
		this.passage.setY (-(ai * b.normal.x - bi * a.normal.x) / d);
	}
}

//function
function LinePlaneIntersection (vector, line, plane){
	var pp = new THREE.Vector3(); pp.copy(plane.passage);
	var lp = new THREE.Vector3(); lp.copy(line.passage);
	var pn = new THREE.Vector3(); pn.copy(plane.normal);

	var t = (pp.sub(lp)).dot(pn);
	t /= pn.dot(line.direction);
	vector.copy (line.direction);
	vector.multiplyScalar(t);
	vector.add(line.passage);
}

function VectorVectorDistance (v1, v2){
	return Math.sqrt((v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y) + (v1.z-v2.z)*(v1.z-v2.z));
}

function VectorVectorVectorExterior (v, v1, v2){
	v.setX(v1.y*v2.z-v2.y*v1.z);
	v.setY(v1.z*v2.x-v2.z*v1.x);
	v.setZ(v1.x*v2.y-v2.x*v1.y);
}