function clearlog(){
	var ID;
	for (ID = 0; ID < 100; ID++){
		localStorage.setItem("origami_type"+ID, null);
		localStorage.setItem("origami_faceGroup"+ID, null);
		localStorage.setItem("origami_face"+ID, null);
		localStorage.setItem("origami_vertex"+ID, null);
		localStorage.setItem("origami_x"+ID, null);
		localStorage.setItem("origami_y"+ID, null);
		localStorage.setItem("origami_z"+ID, null);
	}
}