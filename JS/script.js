noise.seed( Math.random() );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.set( 0, 0,-1 );
camera.lookAt(new THREE.Vector3( 0, 0, 1000));

var light = new THREE.PointLight( 0xffffff, 1, 200 );
var light2 = new THREE.AmbientLight( 0x606060 );
light.position.set( 50, 50, 50 );
scene.add( light );
scene.add( light2 );

var nbrPoint = 100;
var arraySplineCoord = [];
var createTunnel =  function(){
	var _x = 0;
	var _y = 0;
	for( var i=0; i< nbrPoint; i++){
		_x = noise.simplex3( i/50, _y/50, 0 );
		_y = noise.simplex3( _x/50, i/50, 0 );
		var _z = i*10;
		arraySplineCoord[i] = { _X: _x, _Y: _y, _Z: _z};
		
		var color = Math.abs( noise.simplex2( _x/25, _y/25 ) ) * 128;

		var lum = Math.round( (nbrPoint - i) / 1.5 );
		var color ='hsl('+color+', 75%, '+lum+'%)';
		var newCol = new THREE.Color( color );
		var material = new THREE.MeshBasicMaterial( { color: newCol, side: THREE.DoubleSide } );

		var size = (nbrPoint - i)/2 + 50;
		var geometry = new THREE.RingGeometry( size, size*2, 5, 1 );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(_x*50, _y*50, _z);
		mesh.name = 'anneaux';
		scene.add(mesh);
		if( scene.children[i].name == "anneaux" ){
			scene.children[i].material.needsUpdate = true;
		}
	}
	camera.lookAt(new THREE.Vector3(0,0, arraySplineCoord[nbrPoint-1]._Z));
};

var animateTunnel = function(t, a, b, c, d){
	var _x = 0;
	var _y = 0;
	for( var i = 0; i < nbrPoint; i++ ){
		if( scene.children[i].name == "anneaux" ){
			_x = noise.simplex3( i/50, _y/50, t );
			_y = noise.simplex3( _x/50, i/50, t );
			var _z = i*10;
			scene.children[i].position.set( _x*50, _y*50, _z);
			var _rotZ = noise.simplex3( _x/50, _y/50, _z/333 + t );
			scene.children[i].rotation.z = _rotZ;
			
			var depthLum = Math.round( (nbrPoint - i) / 1.1 );
			var _L = 1 - ( (i+a)%(b) / b );
			_L = ( _L > 0.6 ) ? _L =  Math.linearNormal( .5, 1, _L ) : _L = .5 - Math.linearNormal( .5, 1, _L ) ;
			_L *= depthLum/100;
			// scene.children[i].material.color.setHSL( _L, 0.5, .5 );
			scene.children[i].material.color.setHSL( (depthLum*.005) * _L, 0.5, _L );
		}
	}
	if( scene.children[0].name == "anneaux" ) camera.position.set( scene.children[0].position.x, scene.children[0].position.y,-1 );
	if( scene.children[50].name == "anneaux" ) camera.lookAt(new THREE.Vector3( scene.children[50].position.x, scene.children[50].position.y, scene.children[50].position.z));
};

var shape;
var lengthSphere = [];
var initSphereVert = [];
var funkyMesh = function(){
	var _x = 0;
	var _y = 0;
	var _z = 0;
	var material = new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true, emissive: 0x1b1b1b });
	var geometry = new THREE.IcosahedronGeometry( 33, 2 );
	shape = new THREE.Mesh(geometry, material);
	shape.position.set( 0, 0, 100);
	shape.name = 'funkyMesh';
	scene.add(shape);
	for( var i=0; i < shape.geometry.vertices.length; i++ ){
		var vert = shape.geometry.vertices[i];
		lengthSphere.push( Math.sqrt( vert.x*vert.x + vert.y*vert.y + vert.z*vert.z ) );
		initSphereVert.push(vert);
	}
};


var animateFunkyMesh = function(h,t){
	shape.material.needsUpdate = true;
	shape.geometry.verticesNeedUpdate = true;
	var _x = 0;
	var _y = 0;
	var _z = 0;
	var radius = 33;
	shape.position.set( scene.children[10].position.x, scene.children[10].position.y, 100 );
	light.position.set( scene.children[10].position.x, scene.children[10].position.y, 0 );
	shape.rotation.z = scene.children[10].rotation.z;
	shape.rotation.x = -scene.children[10].rotation.z;
	shape.material.color.setHSL( h, .66, .33 );

	for( var i = 0; i < shape.geometry.vertices.length; i++ ){
		var _Vert = shape.geometry.vertices[i];
		var _x = ( noise.simplex3( t/333, i, i ) + 1 ) / 2;
		var _y = ( noise.simplex3( i, t/333, i) + 1 ) / 2;
		var _z = ( noise.simplex3( i, i, t/333 ) + 1 ) / 2;

		shape.geometry.vertices[i].x = _x ;
		shape.geometry.vertices[i].y = _y ;
		shape.geometry.vertices[i].z = _z ;
	}


};

var count = 0;
var speed = 150;
var colorChange = 0;
var colorChangeMax = 50;
var hueChange = 0;
function animate() {
	//if( count < 25 ) 
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	count++;
	( colorChange < colorChangeMax ) ? colorChange++ : colorChange = 0 ;
	if( colorChange >= colorChangeMax ) hueChange+=.01 ;
	if( hueChange >= 1 ) hueChange = 0;
	animateTunnel(count/speed, colorChange, colorChangeMax, hueChange);
	//animateFunkyMesh(hueChange, count);

}

window.addEventListener('resize', function(){
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer.setSize( window.innerWidth, window.innerHeight );
});

createTunnel();
//funkyMesh();

animate();
