//FaceLabel
var UndoneFace = 'UndoneFace';
var FixedFace = 'FixedFace';
var MovedFace = 'MovedFace';
var DividedFace = 'DividedFace';
//RenewResult
var RenewDone = 'RenewDone';
var RenewSuccess = 'RenewSuccess';
var RenewFailure = 'RenewFailure';
//FaceLocation
var InfrontApart = 'InfrontApart';
var InfrontContact = 'InfrontContact';
var Across = 'Across';
var BehindContact = 'BehindContact';
var BehindApart = 'BehindApart';

var Face = function(){
	this.birthStage = 0;
	this.faceGroupID = 0;
	//this.edge = 
	this.vertexSize = 4;
	this.label;                  //FaceLabel
	//this.newEdge = 
	this.parent = null;                 //Face
	this.children = [];                 //Face
	this.children[0] = null;
	this.children[1] = null;
}