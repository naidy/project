var Vector = function(x, y, z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Vector.prototype.set = function (x, y, z){  //double*3
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector.prototype.set2 = function (a){  //vector
	this.x = a.x;
	this.y = a.y;
	this.z = a.z;
}

Vector.prototype.abs = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

Vector.prototype.abs2 = function(){
	return this.x*this.x + this.y*this.y + this.z*this.z;
}

Vector.prototype.add = function (a){  //vector
	this.x += a.x;
	this.y += a.y;
	this.z += a.z;
}

Vector.prototype.add2 = function (a, b){  //vector*2
	this.x = a.x + b.x;
	this.y = a.y + b.y;
	this.z = a.z + b.z;
}

Vector.prototype.add3 = function (a, b, c){  //double*3
	this.x += a;
	this.y += b;
	this.z += c;
}

Vector.prototype.sub = function (a){  //vector
	this.x -= a.x;
	this.y -= a.y;
	this.z -= a.z;
}

Vector.prototype.sub2 = function (a, b){  //vector*2
	this.x = a.x - b.x;
	this.y = a.y - b.y;
	this.z = a.z - b.z;
}

Vector.prototype.sub3 = function (a, b, c){  //double*3
	this.x -= a;
	this.y -= b;
	this.z -= c;
}

Vector.prototype.dot = function (a){  //vector
	return this.x*a.x + this.y*a.y + this.z*a.z;
}

Vector.prototype.mul = function (k){  //double
	this.x *= k;
	this.y *= k;
	this.z *= k;
}

Vector.prototype.mul2 = function (k, a){  //double vector
	this.x = k*a.x;
	this.y = k*a.y;
	this.z = k*a.z;
}

Vector.prototype.divide = function (a, b, m, n){  //vector*2 double*2
	if (Math.abs(m+n) < DBL_EPSILON){
		console.log ('Unexpected ratio '+m+' : '+n+' in Vector::divide()!');
		return 1;
	}
	var c = new Vector();
	c.mul2(n, a);
	this.mul2(m, b);
	this.add(c);
	this.mul(1/(m+n));
	return 0;
}

Vector.prototype.angle = function (a){  //vector
	return Math.acos(a.dot(this) / Math.sqrt(a.abs2() * this.abs2()));
}

Vector.prototype.distance = function (a){  //vector
	return Math.sqrt((this.x-a.x)*(this.x-a.x) + (this.y-a.y)*(this.y-a.y) + (this.z-a.z)*(this.z-a.z));
}

Vector.prototype.distance2 = function (a){  //vector
	return (this.x-a.x)*(this.x-a.x) + (this.y-a.y)*(this.y-a.y) + (this.z-a.z)*(this.z-a.z);
}

Vector.prototype.exchange = function (a){  //vector
	var b = new Vector (a.x, a.y, a.z);
	a.set (this.x, this.y, this.z);
	this.set (b.x, b.y, b.z);
}

Vector.prototype.exterior = function (a, b){  //vector*2
	this.x = a.y*b.z-b.y*a.z;
	this.y = a.z*b.x-b.z*a.x;
	this.z = a.x*b.y-b.x*a.y;
}

Vector.prototype.ifZero = function(){
	return this.abs2() < DBL_EPSILON ? 1 : 0;
}

Vector.prototype.intersection = function (line, plane){  //line plane
	var tmp = new Vector();
	tmp.sub2(plane.passage, line.passage);
	var t = tmp.dot(plane.normal);
	t /= plane.normal.dot(line.direction);
	this.set2(line.direction);
	this.mul(t);
	this.add(line.passage);
}

Vector.prototype.normal = function (a, b, c){  //vector*3
	var d1 = new Vector(), d2 = new Vector();
	d1.sub2(b, a);
	d2.sub2(c, b);
	this.exterior(d1, d2);
}

Vector.prototype.normalize = function(){
	this.mul(1/this.abs());
}

Vector.prototype.normalize2 = function (a){  //vector
	this.mul2(1/a.abs(), a);
}

Vector.prototype.projection = function (a, b){  //vector*2
	this.mul2(a.dot(b)/b.abs2(), b);
}

Vector.prototype.projection2 = function (a){  //vector
	this.projection(this, a);
}

Vector.prototype.projection3 = function (line){  //line
	this.sub(line.passage);
	this.projection2(line.direction);
	this.add(line.passage);
}

Vector.prototype.reverse = function(){
	this.x *= -1;
	this.y *= -1;
	this.z *= -1;
}

Vector.prototype.reverse2 = function (a){  //vector
	this.x = -a.x;
	this.y = -a.y;
	this.z = -a.z;
}

Vector.prototype.rotate = function (axis, angle){  //vector double
	var projected = new Vector(), uaxis = new Vector(), vaxis = new Vector();
	projected.projection(this, axis);
	uaxis.sub2(this, projected);
	vaxis.exterior(axis, uaxis);
	uaxis.mul(Math.cos(angle));
	vaxis.mul(Math.sin(angle)/axis.abs());
	this.add2(uaxis, vaxis);
	this.add(projected);
}

Vector.prototype.rotate2 = function (a, axis, angle){  //vector*2 double
	this.set2(a);
	this.rotate(axis, angle);
}

Vector.prototype.rotate3 = function (axis, angle){  //line double
	this.sub(axis.passage);
	this.rotate(axis.direction, angle);
	this.add(axis.passage);
}

Vector.prototype.rotate4 = function (a, axis, angle){  //vector line double
	this.set2(a);
	this.rotate3(axis, angle);
}

Vector.prototype.symmetry = function (a){  //vector
	this.reverse();
	this.add(a);
	this.add(a);
}

Vector.prototype.unitX = function(){
	this.set(1, 0, 0);
}

Vector.prototype.unitY = function(){
	this.set(0, 1, 0);
}

Vector.prototype.unitZ = function(){
	this.set(0, 0, 1);
}

Vector.prototype.zero = function(){
	this.set(0, 0, 0);
}