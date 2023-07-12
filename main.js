import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Water } from 'three/examples/jsm/objects/Water'
import { Sky } from 'three/examples/jsm/objects/Sky'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene,camera);

let lagoonModel;
const gltfloader = new GLTFLoader()
gltfloader.setMeshoptDecoder(MeshoptDecoder);
gltfloader.load('./sailboat/lagoon7-v1.glb', (gltf) => {
  lagoonModel = gltf.scene;
  lagoonModel.rotation.y = 3.12;
  lagoonModel.translateY(-1.3);
  scene.add(lagoonModel)
  }
)


const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(20,20,20)

scene.add(pointLight)

/*
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper)

function addStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff})
  const star = new THREE.Mesh( geometry, material);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x,y,z);
  scene.add(star)
}

Array(200).fill().forEach(addStar)
*/

const controls = new OrbitControls(camera, renderer.domElement)

let lagoon_tracker = 0;
let lagoon_wobbler = true;

function lagoonAnimate() {
  if (lagoonModel) {
    if (lagoon_wobbler) {
      lagoonModel.rotation.x = Math.sin(lagoon_tracker) * 0.05;
      lagoon_tracker += 0.01;
      if (lagoon_tracker >= 1) {
        lagoon_wobbler = false;
      }
    } else {
      lagoonModel.rotation.x = Math.sin(lagoon_tracker) * 0.05;
      lagoon_tracker -= 0.01;
      if (lagoon_tracker <= -1) {
        lagoon_wobbler = true;
      }
    }
  }
}

let water, sun;

sun = new THREE.Vector3();

// Water

const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    } ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
);

water.rotation.x = - Math.PI / 2;

scene.add( water );

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 2;
  skyUniforms[ 'mieCoefficient' ].value = 0.005;
  skyUniforms[ 'mieDirectionalG' ].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  let renderTarget;

function updateSun() {

  const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
  const theta = THREE.MathUtils.degToRad( parameters.azimuth );

  sun.setFromSphericalCoords( 1, phi, theta );

  sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
  water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

  if ( renderTarget !== undefined ) renderTarget.dispose();

  renderTarget = pmremGenerator.fromScene( sky );

  scene.environment = renderTarget.texture;

}

updateSun();




function animate(){
  requestAnimationFrame(animate);
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  lagoonAnimate();

  controls.update();

  renderer.render(scene,camera)
}

animate()