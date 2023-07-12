import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/*
let lagoonModel;
const mtlLoader = new MTLLoader()
mtlLoader.load('./sailboat/lagoon2.mtl', (materials) => {
  materials.preload()
  const lagoon = new OBJLoader()
  console.log(materials)
  lagoon.setMaterials(materials)
  lagoon.load('./sailboat/lagoon2.obj', (lagoonLoaded) => {
    lagoonModel = lagoonLoaded;
    scene.add(lagoonLoaded)
  })
})
*/

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
  scene.add(lagoonModel)
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  },
  function (error) {
    console.log(error);
  }
)

const geometry = new THREE.TorusGeometry(10,3,16,100)
const material = new THREE.MeshStandardMaterial({color: 0xFF6347, wireframe: true})
const torus = new THREE.Mesh( geometry, material)

//scene.add(torus)

const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(20,20,20)

scene.add(pointLight)

const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight)

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper)

const controls = new OrbitControls(camera, renderer.domElement)

function addStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff})
  const star = new THREE.Mesh( geometry, material);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x,y,z);
  scene.add(star)
}

Array(200).fill().forEach(addStar)


let lagoon_tracker = 0;
let lagoon_wobbler = true;
function lagoonAnimate(){
  if (lagoonModel) {
    if (lagoon_wobbler == true){
      lagoonModel.rotation.x += 0.002
      lagoon_tracker += .002
      if (lagoon_tracker >= .15) {
        lagoon_wobbler = false;
      }
    } else if (lagoon_wobbler == false){
      lagoonModel.rotation.x -= 0.002
      lagoon_tracker -= 0.002
      if (lagoon_tracker <= -.15) {
        lagoon_wobbler = true;
      }
    }
      
  }
}




function animate(){
  requestAnimationFrame(animate);
  torus.rotation.y += 0.001;
  torus.rotation.z += 0.001;

  lagoonAnimate();

  controls.update();

  renderer.render(scene,camera)
}

animate()