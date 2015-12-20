function undoFold(){
    Origami.reset();
    resetScene();
    display();
}

function initFold(){
    Origami.reset2(0);
    resetScene();
    display();
}

function animateFold(){
    if (!State.inFolding && !State.inAnimation){
        clearlog();
        Origami.save();
        Origami.reset2(0);
        Origami.animation.position = -1.0;
        State.inAnimation = true;
        Origami.animation.step = 0;
    }
    else {
        Origami.load();
        State.inAnimation = false;
    }
    resetScene();
    display();
}

function saveFold(){
    Origami.save();
    saveTXT();
}

function axisOnOff(){
    if (axisTurn){
        scene.remove(axis);
        axisTurn = !axisTurn;
    }
    else{
        scene.add(axis);
        axisTurn = !axisTurn;
    }
}