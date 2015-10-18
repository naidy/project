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

function VectorNormal (v, a, b, c){  //vector vector vector
	var d1 = new THREE.Vector3();
	var d2 = new THREE.Vector3();
	d1.subVectors(b, a);
	d2.subVectors(c, b);
	VectorVectorVectorExterior(v, d1, d2);
}