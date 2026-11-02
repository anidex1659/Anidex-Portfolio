
import * as THREE from "three";

const PROJECTS = [
    {
    title: "ShowCase",
    description:
      "A local-first Android media library that organizes movies, TV series, anime, and music into a modern streaming-style experience. Features automatic library scanning, TMDB metadata and artwork, offline media information, playback history, Continue Watching, and automatic episode playback.",
    tech: "Kotlin · Jetpack Compose · Room · Media3 · Retrofit · TMDB API",
    icons: ["kotlin", "androidstudio", "gradle"],
    github: "https://github.com/anidex1659/ShowCase",
    accent: "#8caaee"
  },
  {
    title: "StudyMate",
    description:
      "An AI-powered learning workspace designed to make studying smarter and more organized. Combines contextual AI chat, intelligent note summarization, automatic quiz generation, flashcards, and a block-based note editor with integrations for learning resources and productivity tools.",
    tech: "Node.js · Express.js · MongoDB · EJS · Gemini AI · REST APIs",
    icons: ["nodejs", "express", "mongodb"],
    accent: "#a6d189"
  },
  {
    title: "Sports Tournament Management System",
    description:
      "A full-stack platform for managing sports tournaments from registration to match scheduling. Includes team and player management, authentication, role-based access control, tournament schedules, and dashboards to simplify tournament organization and track essential information.",
    tech: "Node.js · Express.js · MongoDB · JavaScript",
    icons: ["javascript", "nodejs", "mongodb"],
    accent: "#ef9f76"
  },
  {
    title: "KitsuKoi",
    description:
      "A gamified virtual pet companion built with Godot that connects everyday productivity with an interactive game experience. Features an animated pet with multiple emotional states, task management, habits, planning, XP, coins, and AI-powered conversations with text-to-speech support.",
    tech: "Godot 4 · GDScript · Python · Flask · OpenRouter · Edge-TTS",
    icons: ["godot", "python"],
    accent: "#f5c2e7"
  },
];


const CAROUSEL_CONFIG = {
  // Card dimensions (relative to modelScale)
  cardWidth: 0.2,
  cardHeight: 0.1,

  // Orbit dimensions
  radiusX: 0.25,
  radiusZ: 0.2,

  // Position relative to Lighthouse_Body's center
  offsetX: 0,
  offsetY: -0.06,
  offsetZ: 0,

  // Vertical distribution
  verticalSpread: 0,

  // Animation
  rotationSpeed: 0.35,
  hoverScale: 1.04,
  selectedScale: 1.08,

  // Card facing
  faceCamera: true
};


export function createProjectCarousel({
  scene,
  camera,
  renderer,
  getModelCenter,
  getModelScale,
  getPivotCenter
}) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);
  scene.add(group);

  const cards = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let active = false;
  let hovered = false;
  let angleOffset = 0;
  let selectedIndex = 0;

  function createTexture(project, index) {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 480;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#232634";
    ctx.fillRect(0, 0, 768, 480);

    ctx.fillStyle = project.accent;
    ctx.fillRect(0, 0, 12, 480);

    ctx.beginPath();
    ctx.arc(625, 100, 95, 0, Math.PI * 2);
    ctx.fillStyle = project.accent + "30";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(625, 100, 70, 0, Math.PI * 2);
    ctx.strokeStyle = project.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = project.accent;
    ctx.font = "bold 22px Arial";
    ctx.fillText(`PROJECT 0${index + 1}`, 48, 65);

    ctx.fillStyle = "#c6d0f5";
    ctx.font = "bold 58px Arial";
    ctx.fillText(project.title, 48, 180, 650);

    ctx.fillStyle = "#bac2de";
    ctx.font = "25px Arial";
    ctx.fillText("SELECTED WORK", 50, 235);

    ctx.fillStyle = project.accent;
    ctx.fillRect(48, 390, 130, 5);

    ctx.fillStyle = "#a5adce";
    ctx.font = "20px Arial";
    ctx.fillText("ANIDEX / PORTFOLIO", 48, 435);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy =
      renderer.capabilities.getMaxAnisotropy();

    return texture;
  }

 function updateProjectInfo(index) {
  const project = PROJECTS[index];
  if (!project) return;

  selectedIndex = index;

  // Update existing HTML information
  const name = document.getElementById("project_name");
  const description = document.getElementById("project_description");
  const tech = document.getElementById("project_tech");
  const counter = document.getElementById("project_counter");
  const stack = document.getElementById("stack");
  const githubButton = document.getElementById("git-btn");

  if (name) name.textContent = project.title;
  if (description) description.textContent = project.description;
  if (tech) tech.textContent = project.tech;

  if (counter) {
    counter.textContent =
      `${String(index + 1).padStart(2, "0")} / ` +
      `${String(PROJECTS.length).padStart(2, "0")}`;
  }

  // Update technology icons without changing the #stack container
  if (stack) {
    stack.replaceChildren();

    const icons = document.createElement("img");
    icons.src =
      `https://skillicons.dev/icons?i=${project.icons.join(",")}`;
    icons.alt = `${project.title} technologies`;
    icons.loading = "lazy";

    stack.appendChild(icons);
  }

  // Connect the GitHub button to the selected project
  if (githubButton) {
    githubButton.onclick = () => {
      window.open(project.github, "_blank", "noopener,noreferrer");
    };
  }
}

  function createCards() {
    const scale = getModelScale();
    const cardWidth = scale * CAROUSEL_CONFIG.cardWidth;
    const cardHeight = scale * CAROUSEL_CONFIG.cardHeight;

    const segments = 32;
    PROJECTS.forEach((project, index) => {
      const geometry = new THREE.PlaneGeometry(
        cardWidth,
        cardHeight,
        segments,
        1,
      );

      const positions = geometry.attributes.position;

      // Curvature radius: smaller means a stronger bend.
      const curveRadius = cardWidth * 1.5;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);

        // Cylindrical curve across the card width.
        const theta = x / curveRadius;

        positions.setX(i, curveRadius * Math.sin(theta));

        positions.setZ(i, curveRadius * (Math.cos(theta) - 1));
      }

      geometry.computeVertexNormals();

      const material = new THREE.MeshBasicMaterial({
        map: createTexture(project, index),
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true,
      });

      const card = new THREE.Mesh(geometry, material);

      card.userData.projectIndex = index;
      card.userData.angle = (index / PROJECTS.length) * Math.PI * 2;
      card.userData.hovered = false;

      group.add(card);
      cards.push(card);
    });

    updateProjectInfo(0);
  }

  


function positionCards() {
  const center = getPivotCenter() ?? getModelCenter();
  const scale = getModelScale();
  const count = cards.length;

  const radiusX = scale * CAROUSEL_CONFIG.radiusX;
  const radiusZ = scale * CAROUSEL_CONFIG.radiusZ;

  const centerX = center.x + scale * CAROUSEL_CONFIG.offsetX;
  const centerY = center.y + scale * CAROUSEL_CONFIG.offsetY;
  const centerZ = center.z + scale * CAROUSEL_CONFIG.offsetZ;

  for (const card of cards) {
    const index = card.userData.projectIndex;
    const angle = card.userData.angle + angleOffset;

    // Elliptical horizontal orbit.
    const x = centerX + Math.sin(angle) * radiusX;
    const z = centerZ + Math.cos(angle) * radiusZ;

    // Optional vertical variation between cards.
    const y =
      centerY +
      Math.sin(angle) * scale * CAROUSEL_CONFIG.verticalSpread;

    card.position.set(x, y, z);

    if (CAROUSEL_CONFIG.faceCamera) {
      // Point the card's front outward, away from the orbit center.
      const outward = new THREE.Vector3(
      Math.sin(angle),
      0,
      Math.cos(angle)
        );
      card.rotation.set(0, 0, 0);
      card.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      outward
      );
    } else {
      card.rotation.set(0, -angle, 0);
    }
  }

  group.updateMatrixWorld(true);
}




  function getCardAtPointer(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    positionCards();
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(cards, false);
    return hits.length ? hits[0].object : null;
  }

  function onPointerMove(event) {
    if (!active) {
      hovered = false;
      return;
    }

    for (const card of cards) {
      card.userData.hovered = false;
    }

    const card = getCardAtPointer(event);
    hovered = Boolean(card);

    if (card) {
      card.userData.hovered = true;
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "";
    }
  }

  function onClick(event) {
    if (!active) return;

    const card = getCardAtPointer(event);
    if (card) {
      updateProjectInfo(card.userData.projectIndex);
    }
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("click", onClick);

  createCards();

  return {
    setActive(value) {
      active = value;
      group.visible = value;

      if (!value) {
        hovered = false;
        document.body.style.cursor = "";
      }
    },

    update(delta) {
      if (!active) return;

      if (!hovered) {
        angleOffset += CAROUSEL_CONFIG.rotationSpeed * delta;
      }

      positionCards();

      for (const card of cards) {
       const targetScale =
         card.userData.projectIndex === selectedIndex
           ? CAROUSEL_CONFIG.selectedScale
           : card.userData.hovered
             ? CAROUSEL_CONFIG.hoverScale
             : 1;

        card.scale.x = THREE.MathUtils.lerp(
          card.scale.x, targetScale, 0.12
        );

        card.scale.y = THREE.MathUtils.lerp(
          card.scale.y, targetScale, 0.12
        );
      }
    },

    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("click", onClick);

      for (const card of cards) {
        group.remove(card);
        card.geometry.dispose();
        card.material.map?.dispose();
        card.material.dispose();
      }

      scene.remove(group);
    }
  };
}
