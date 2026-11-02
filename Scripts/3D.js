
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createProjectCarousel } from "../Scripts/ui.js";

// Scene
const scene = new THREE.Scene();
let mixer = null;
scene.background = new THREE.Color('#dce0e8');

// Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  10000
);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

// Transparent canvas background
scene.background = null;

Object.assign(renderer.domElement.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    pointerEvents: 'none'
});


document.body.prepend(renderer.domElement);

// Lighting
scene.add(new THREE.HemisphereLight(0xcdd6f4, 0x45475a, 2));

const sunlight = new THREE.DirectionalLight(0xffe8c2, 2);
sunlight.position.set(8, 12, 6);
scene.add(sunlight);

// Camera state
const cameraTarget = new THREE.Vector3();
const desiredPosition = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();

let modelCenter = new THREE.Vector3();
let pivotCenter = new THREE.Vector3();
let modelScale = 1;
let loaded = false;

// Configure one camera view per frontend section.
// Coordinates are relative to the model's center and size.
const views = {
  hero: {
    position: [0.1902, 0.1508, 0.247],
    target: [-0.2795, 0.2338, -0.3071],
    fov: 50,
    roll: -5.5,
  },

  projects: {
    position: [0.0328, -0.066, 0.1000],
    target: [0.0344, -0.0445, -0.4133],
    fov: 50,
    roll: 0.02,
  },

  skills: {
    position:  [0.4544, -0.2989, 0.4235],
    target: [-0.1158, 0.1175, -0.4065],
    fov: 50,
    roll: -14.71,
  },

  about: {
    position: [0.4969, -0.297, 0.5361],
    target:  [0.0362, -0.0216, 0.1747],
    fov: 50,
    roll: -28.48,
  },

  contact: {
    position: [0.0294, 0.0495, 0.2819],
    target: [0.0346, 0.1176, -0.1718],
    fov: 50,
    roll: 0,
  },
  ThankYou: {
    position: [0.0147, -0.2345, 0.4946],
    target: [0.0116, -0.1088, 0.0798],
    fov: 50,
    roll: 0,
  },
};

let projectCarousel = null;
let carouselActive = false;

const carouselClock = new THREE.Clock();


// Load model and preserve its exported materials
const loader = new GLTFLoader();

loader.load(
  '../Resources/Models/4.glb',

  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Initialize model animations
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
        });

        console.log(
          "Available animations:",
          gltf.animations.map((a) => a.name),
        );
      } else {
        console.log("No animations found in this model.");
      }
    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const bounds = new THREE.Box3().setFromObject(model);
    modelCenter = bounds.getCenter(new THREE.Vector3());

    const size = bounds.getSize(new THREE.Vector3());
    modelScale = Math.max(size.x, size.y, size.z, 0.01);

    camera.near = Math.max(modelScale / 10000, 0.001);
    camera.far = Math.max(modelScale * 100, 1000);
    camera.updateProjectionMatrix();


loaded = true;

// Find the object that will act as the carousel pivot.
const pivotObject = model.getObjectByName("Lighthouse_Body");

if (pivotObject) {
  pivotObject.updateWorldMatrix(true, false);

  new THREE.Box3()
    .setFromObject(pivotObject)
    .getCenter(pivotCenter);

  console.log("Carousel pivot:", pivotCenter);
} else {
  // Fall back to the model center if the name doesn't match.
  pivotCenter.copy(modelCenter);
  console.warn("Lighthouse_Body not found; using model center.");
}

projectCarousel = createProjectCarousel({
  scene,
  camera,
  renderer,
  getModelCenter: () => modelCenter,
  getModelScale: () => modelScale,
  getPivotCenter: () => pivotCenter
});

setView("hero", true);

// Notify the frontend that the model is ready
window.dispatchEvent(
    new Event("model-background-ready")
);

// Hide welcome loading screen
const loadingScreen = document.getElementById("loading-screen");

if (loadingScreen) {
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
    }, 700);
}

console.log("3D background loaded");

  },

  undefined,

  (error) => {
    console.error('Could not load 3D background:', error);
  }
);

// Public control: smoothly move to a named view
let desiredFov = camera.fov;
let desiredRoll = 0;

function setView(name, instant = false) {
  if (!loaded || !views[name]) return;

   carouselActive = name === "projects";
   projectCarousel?.setActive(carouselActive);

  const view = views[name];

  desiredTarget.set(
    modelCenter.x + view.target[0] * modelScale,
    modelCenter.y + view.target[1] * modelScale,
    modelCenter.z + view.target[2] * modelScale
  );

  desiredPosition.set(
    modelCenter.x + view.position[0] * modelScale,
    modelCenter.y + view.position[1] * modelScale,
    modelCenter.z + view.position[2] * modelScale
  );

  desiredFov = view.fov ?? 50;
  desiredRoll = THREE.MathUtils.degToRad(view.roll ?? 0);

  if (instant) {
    camera.position.copy(desiredPosition);
    cameraTarget.copy(desiredTarget);
    camera.fov = desiredFov;
    camera.updateProjectionMatrix();
    camera.lookAt(cameraTarget);
    camera.rotateZ(desiredRoll);
  }
}

// Public control: define custom camera views
function defineView(name, position, target = [0, 0, 0]) {
  views[name] = { position, target };
}

// Public control: inspect available views
function getViews() {
  return Object.keys(views);
}

// Smooth render loop


function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(carouselClock.getDelta(), 0.05);

  if (loaded) {
    const smoothing = 1 - Math.exp(-5 * delta);
    // Smoothly animate the camera position and target.
    camera.position.lerp(desiredPosition, smoothing);
    cameraTarget.lerp(desiredTarget, smoothing);

    mixer?.update(delta);

    // Smoothly animate the camera FOV.
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      desiredFov,
      smoothing
    );

    camera.updateProjectionMatrix();

    // Keep the camera facing the target during transitions.
    camera.lookAt(cameraTarget);

    // Animate the separate project carousel.
    projectCarousel?.update(delta);
  }

  renderer.render(scene, camera);
}



animate();


// Responsive resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Expose background controls to your frontend
window.modelBackground = {
  setView,
  defineView,
  getViews
};
