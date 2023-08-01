import './style.css'
import * as THREE from 'three'
import studio from '@theatre/studio'
import * as core from '@theatre/core'
//import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Water } from 'three/examples/jsm/objects/Water'
import { Sky } from 'three/examples/jsm/objects/Sky'
import { LinearToneMapping } from 'three'
import * as TWEEN from '@tweenjs/tween.js'




const project = core.getProject("opening")
const sheet = project.sheet("Establishing shots")

const craneCam = sheet.object("Crane Cam", {
  position: {x: 0, y: 0, z: 0},
  rotation: {x: 0, y: 0, z: 0},
  fov:75,
  near: 0.1,
  far:90
})


studio.initialize()


const scene = new THREE.Scene();


// craneCam.onValuesChange((v) => {
//   scene.craneCam.position.set(v.position)
//   scene.craneCam.rotation.set(v.rotation)
// })




const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 5, 10000);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})


renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(22,29,80);

renderer.toneMapping = LinearToneMapping;
renderer.toneMappingExposure = .4; // sets the exposure of the scene
renderer.render(scene,camera);

let lagoonModel;
const gltfloader = new GLTFLoader()
gltfloader.setMeshoptDecoder(MeshoptDecoder);
gltfloader.load('./sailboat/lagoon7-v1.glb', (gltf) => {
  lagoonModel = gltf.scene;
  lagoonModel.scale.set(5,5,5)
  lagoonModel.rotation.y = 3.12;
  lagoonModel.translateY(-8.7);
  scene.add(lagoonModel)
  }
)


const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(20,20,20)

scene.add(pointLight)



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

const waterGeometry = new THREE.PlaneGeometry( 100000, 100000 );
water = new Water(
  waterGeometry,
  {
    textureWidth: 10000,
    textureHeight: 10000,
    waterNormals: new THREE.TextureLoader().load('assets/waternormals.jpg', function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xFFDD00, // Adjust this value to dim or brighten the sun
    waterColor: 0x001e0f,
    distortionScale: 6,
    fog: scene.fog !== undefined
  }
);

water.rotation.x = - Math.PI / 2;

scene.add( water );

// Skybox

const sky = new Sky();
sky.scale.setScalar( 100000 );
scene.add( sky );

const skyUniforms = sky.material.uniforms;

skyUniforms[ 'turbidity' ].value = 10;
skyUniforms[ 'rayleigh' ].value = 2;
skyUniforms[ 'mieCoefficient' ].value = 0.01;
skyUniforms[ 'mieDirectionalG' ].value = 0.8;

const pmremGenerator = new THREE.PMREMGenerator( renderer );
let renderTarget;

const sunSpeed = 2 * Math.PI / 120;// adjust speed of sun
const parabolaHeight = 0; // Adjust this value to control the height of the parabola
const parabolaWidth = 1000; // Adjust this value to control the width of the parabola

function updateSun() {
  const elapsedTime = Date.now() * 0.001; // Convert milliseconds to seconds
  const orbitRadius = 100; // Adjust this value based on your scene

  const theta = elapsedTime * sunSpeed; // Angle of rotation for the sun

  const sunX = 0; // X-coordinate of the sun (no horizontal movement)

  // Calculate the Y-coordinate of the sun using a parabolic path
  const parabolicOffset = parabolaHeight * Math.pow((2 * theta) / parabolaWidth - 1, 2);
  const sunY = Math.cos(theta) * orbitRadius + parabolicOffset;

  const sunZ = Math.sin(theta) * orbitRadius; // Z-coordinate of the sun


  sun.set(sunX, sunY, sunZ); // Update the sun's position

  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  if (renderTarget !== undefined) renderTarget.dispose();

  renderTarget = pmremGenerator.fromScene(sky);

  scene.environment = renderTarget.texture;
}


const startPoint = new THREE.Vector3(30, 30, 30);
const endPoint = new THREE.Vector3(150, 150, 500);
// Function to update camera position based on scroll position
function updateCameraPositionOnScroll() {
  // Define the start and end points for the camera position

  // Calculate the current scroll percentage
  const scrollPercentage = window.scrollY / (document.body.scrollHeight - window.innerHeight);

  // Interpolate between start and end points based on the scroll percentage
  const interpolatedPosition = new THREE.Vector3().lerpVectors(startPoint, endPoint, scrollPercentage);

  // Set the camera position
  camera.position.copy(interpolatedPosition);
  camera.lookAt(new THREE.Vector3());
}

// Attach an event listener to the scroll event
window.addEventListener('scroll', updateCameraPositionOnScroll);


// Create a Tween to animate the camera position
const tweenDuration = 4000; // Duration of the tween in milliseconds
const tween = new TWEEN.Tween(camera.position)
  .to(endPoint, tweenDuration)
  .easing(TWEEN.Easing.Quadratic.InOut) // You can choose a different easing function if desired
  .onUpdate(() => {
    // Look at the target point during the animation
    camera.lookAt(new THREE.Vector3());
  });

// Start the tween
tween.start();

function animate(){
  requestAnimationFrame(animate);
  water.material.uniforms[ 'time' ].value += 1.0 / 150.0;
  lagoonAnimate();


  TWEEN.update();

  console.log(camera.position)
  updateSun();

  controls.update();

  renderer.render(scene,camera)
}

animate()

/*
const tl = gsap.timeline();
window.addEventListener('mousedown', function(){
  tl.to(camera.position,{
    z: 14, 
    duration: 1.5,
    onUpdate: function(){
      camera.lookAt(0,0,0)
    }
  })
  .to(camera.position,{
    y: 50, 
    duration: 5,
    onUpdate: function(){
      camera.lookAt(-50,-100,20)
    }
  })
  .to(camera.position,{
    y: -10, 
    x: -50,
    z: 33,
    duration: 10,
    onUpdate: function(){
      camera.lookAt(50,100,20)
    }
  })
  
})
*/









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