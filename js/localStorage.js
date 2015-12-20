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

function saveTXT(){
	var blob = new Blob ([str], {
        type: "text/plain;charset=utf-8"
    });
    saveAs (blob, "Origami.txt");
}

function loadTXT(){
	var files = event.target.files;
    var reader = new FileReader();
    reader.onload = function()
    {
        var data = this.result.split(" ");
        Origami.load2(data);

        resetScene();
    	display();
    }
    reader.readAsText (files[0]);
}

function exBirdHead(){
    var string = 'F 0 0 0 -10 -10 1.7319121124709865e-15 F 0 1 0 10 10 -3.944304526105059e-31 F 0 1 2 -10 10 0 F 0 3 1 10 -10 0 F 0 3 1 -4.175135960227108 -4.049378426682481 -2.816545609793128e-15 F 0 1 1 -4.175135960227109 -4.049378426682482 -1.875190481689762e-15 F 0 6 0 -4.175135960227109 -4.049378426682481 -2.445795822234383e-15 F 0 11 0 9.999999999999998 10.000000000000002 -2.5555074893662702e-15 F 0 5 0 -10 1.7678181826656338 0 T 0 12 1 -3.42059331681257 10.337233126500001 0 ';
    var data = string.split(" ");
    Origami.load2(data);
    
    resetScene();
    display();
}

function exBoat(){
    var string = 'F 0 0 1 10 -10 0 F 0 1 1 -3.9062397366541712 -4.223621405285512 1.7319121124709867e-15 F 0 1 3 -8.593727420639174 -0.9033178728067284 0 ';
    var data = string.split(" ");
    Origami.load2(data);
    
    resetScene();
    display();
}

function exPlane(){
    var string = 'F 0 0 0 10 -10 0 F 0 1 0 10 10 0 F 0 1 1 0.050302842894304624 -0.02515141879927025 -1.99159850020592e-15 F 0 0 1 0.0503028428943022 -0.0251514187992683 -1.122374758051826e-15 F 0 2 0 4.175135960227111 0.07545425639780974 -1.99159850020592e-15 F 0 5 2 4.175135960227112 0.07545425639781023 -1.3329060825937781e-15 F 0 16 3 -2.0262024922388733 0.00929351817667956 0 F 0 7 1 11.180901835334083 7.175892332828541 -1.80416238424209e-15 B 0 40 0 9.517529878543012 -2.4690960140275138 6.359999999999964 b 0 4 0 10.951454594683945 -1.326347111407805 -5.452461952195587 ';
    var data = string.split(" ");
    Origami.load2(data);
    
    resetScene();
    display();
}