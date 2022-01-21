// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'



let camera, scene, raycaster, renderer
const mouse = new THREE.Vector2()
window.addEventListener( 'click', onClick, false);

init()
animate()

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xbfe3dd )
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 0, 75, 160 );


    //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    //camera.position.y = - 100


    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )
  
    
const controls = new OrbitControls( camera, renderer.domElement )






//LIGHT
    //const directionalLight = new THREE.DirectionalLight( 0xffffff )
    //directionalLight.position.set( 0, 0, 30 )
    //directionalLight.castShadow = true
    //directionalLight.intensity = 2

    //scene.add( directionalLight )

    //raycaster = new THREE.Raycaster()

    //add 3DM file here
    
    const loader = new Rhino3dmLoader()
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/' )

    loader.load( 'Bureaux for web.3dm', function ( object ) {

        document.getElementById('loader').remove()
        scene.add( object )
        console.log( object )

    } )

}

// LIGHTS

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.22 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 50, 0 );
scene.add( hemiLight );

//const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
//scene.add( hemiLightHelper );

//

const dirLight = new THREE.DirectionalLight( 0xffffff,  );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( - 1, 1.75, 1 );
dirLight.position.multiplyScalar( 60);
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

//const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
//scene.add( dirLightHelper );

// GROUND

const groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
groundMat.color.setHSL( 0.3, 1, 0.75 );

const ground = new THREE.Mesh( groundGeo, groundMat );
ground.position.y =   0;
ground.rotation.x = 0;
ground.receiveShadow = true;
scene.add( ground );

// SKYDOME

const vertexShader = document.getElementById( 'vertexShader' ).textContent;
const fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
const uniforms = {
    "topColor": { value: new THREE.Color( 0x0077ff ) },
    "bottomColor": { value: new THREE.Color( 0xffffff ) },
    "offset": { value: 33 },
    "exponent": { value: 0.6 }
};
uniforms[ "topColor" ].value.copy( hemiLight.color );

scene.fog.color.copy( uniforms[ "bottomColor" ].value );

const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
const skyMat = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide
} );

const sky = new THREE.Mesh( skyGeo, skyMat );
scene.add( sky );



function onClick( event ) {

    console.log( `click! (${event.clientX}, ${event.clientY})`)

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    
    raycaster.setFromCamera( mouse, camera )

	// calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children, true )

    let container = document.getElementById( 'container' )
    if (container) container.remove()

    // reset object colours
    scene.traverse((child, i) => {
        if (child.isMesh) {
            child.material.color.set( 'white' )
        }
    });

    if (intersects.length > 0) {

        // get closest object
        const object = intersects[0].object
        console.log(object) // debug

        object.material.color.set( 'pink' )

        // get user strings
        let data, count
        if (object.userData.attributes !== undefined) {
            data = object.userData.attributes.userStrings
        } else {
            // breps store user strings differently...
            data = object.parent.userData.attributes.userStrings
        }

        // do nothing if no user strings
        if ( data === undefined ) return

        console.log( data )
        
        // create container div with table inside
        container = document.createElement( 'div' )
        container.id = 'container'
        
        const table = document.createElement( 'table' )
        container.appendChild( table )

        for ( let i = 0; i < data.length; i ++ ) {

            const row = document.createElement( 'tr' )
            row.innerHTML = `<td>${data[ i ][ 0 ]}</td><td>${data[ i ][ 1 ]}</td>`
            table.appendChild( row )
        }

        document.body.appendChild( container )
    }

}

function animate() {

    requestAnimationFrame( animate )
    renderer.render( scene, camera )

}

