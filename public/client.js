import * as THREE from '/build/three.module.js'
import { ConvexGeometry } from '/jsm/geometries/ConvexGeometry.js';
import Stats from '/jsm/libs/stats.module.js';
import * as dat from '/dat/dat.gui.module.js';
import * as jQuery from '/jquery/jquery.js';
import {TrackballControls} from '/jsm/controls/TrackballControls.js'
import {SceneUtils} from '/jsm/utils/SceneUtils.js'

var rockObject;
var stats = initStats();

// create a scene, that will hold all our elements such as objects, cameras and lights.
var scene = new THREE.Scene();

const spotLight = new THREE.SpotLight( 0xffffff , 0.2);
spotLight.position.set( 0, 1000, 0 );

spotLight.castShadow = true;
scene.add( spotLight );
// create a render and set the size
var webGLRenderer = new THREE.WebGLRenderer();
webGLRenderer.setClearColor(0xEEEEEE, 1.0);
webGLRenderer.setSize(window.innerWidth, window.innerHeight);
webGLRenderer.shadowMap.Enabled = true;

//webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
directionalLight.position.copy(new THREE.Vector3(25, 30, -50));
directionalLight.castShadow = true;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

scene.add(directionalLight);

// position and point the camera to the center of the scene

var material = new THREE.MeshBasicMaterial({color: '#a8a2a2'});

var planeGeometry = new THREE.PlaneGeometry(248, 248);
var plane = new THREE.Mesh(planeGeometry, material);
plane.rotateX(-Math.PI * 0.5);
plane.position.z = 50;
scene.add(plane);

// add the output of the renderer to the html element
$("#WebGL-output").append(webGLRenderer.domElement);    

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.x = -30;
camera.position.y = 40;
camera.position.z = 50;
camera.lookAt(new THREE.Vector3(10, 0, 0));
var camControl = new TrackballControls( camera, webGLRenderer.domElement );
// setup the control gui
var AllControls = function() {
    // we need the first child, since it's a multimaterial
    this.rockRadius = 16;
    this.positionDiff = 2;
    this.rockHight = 300;
    this.cubeSize = 1;
    this.seeMesh = false;
    this.pointCount = 1000;
    this.redraw = function () {
        scene.remove(rockObject);
        addRock();
    }
}

var controls = new AllControls();

var gui = new dat.GUI();
gui.add(controls, 'seeMesh').onChange(controls.redraw);
gui.add(controls, 'pointCount', 100, 2000).onChange(controls.redraw);
gui.add(controls, 'redraw');

addRock();
render();

function render() {
    
    stats.update();
    // render using requestAnimationFrame
    camControl.update();
    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);

}


function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    $("#Stats-output").append(stats.domElement);

    return stats;
}

function addRock(){
    var dif = 0.7;
    var points = [];
    for (var i = 0; i < controls.pointCount; i++){
        var randomX = - controls.rockRadius + Math.random() * controls.rockRadius * 2;
        var randomY = - controls.rockRadius + Math.random() * controls.rockRadius * 3;
        var randomZ = - controls.rockRadius + Math.random() * controls.rockRadius * 2;
        if ((randomX * randomX + randomZ * randomZ) <= (controls.rockRadius * controls.rockRadius) &&
        -controls.rockHight/2 <= randomY && controls.rockHight/2 >= randomY){
            points.push(new THREE.Vector3(randomX, randomY, randomZ));
        }
    }
    
    var rockGeometry = new ConvexGeometry(points);

    rockGeometry.computeBoundingBox();
    var max = rockGeometry.boundingBox.max,
    min = rockGeometry.boundingBox.min;
    var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    var faces = rockGeometry.faces;
    rockGeometry.faceVertexUvs[0] = [];

    for (var i = 0; i < faces.length ; i++) {
    
        var v1 = rockGeometry.vertices[faces[i].a], 
            v2 = rockGeometry.vertices[faces[i].b], 
            v3 = rockGeometry.vertices[faces[i].c];
    
            rockGeometry.faceVertexUvs[0].push([
            new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
            new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
            new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
        ]);
    }
    rockGeometry.uvsNeedUpdate = true;
        
    var rockMesh = createRockMesh(rockGeometry);
    rockObject = new THREE.Object3D();
    rockObject.position.z = controls.rockRadius * controls.positionDiff;
    rockObject.add(rockMesh);
    scene.add(rockObject);
    }
    
    function createRockMesh(geom) {
        var chessMaterial = new THREE.MeshPhongMaterial();
        new THREE.TextureLoader().load('/assets/chessboard.jpg', function (texture) {   
            chessMaterial.map = texture;
        });
        
        var wireFrameMat = new THREE.MeshBasicMaterial();
        wireFrameMat.wireframe = controls.seeMesh;
        
        var rockMesh= new SceneUtils.createMultiMaterialObject(geom, [chessMaterial, wireFrameMat]);
        rockMesh.position.y = controls.rockRadius - controls.cubeSize / 2;
        return rockMesh;
    }
