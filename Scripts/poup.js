
const projectGalleries = {
  ShowCase: [
    {
      src: "../Resources/ScreenShots/ShowCase/home.jpeg",
      caption: "Home screen"
    },
    {
      src: "../Resources/ScreenShots/ShowCase/liblery.jpeg",
      caption: "Media library"
    },
    {
      src: "../Resources/ScreenShots/ShowCase/player.jpg",
      caption: "Media player"
    },
    {
      src: "../Resources/ScreenShots/ShowCase/info.jpg",
      caption: "Movie details"
    },
    {
      src: "../Resources/ScreenShots/ShowCase/setings.jpeg",
      caption: " "
    }
  ],

  StudyMate: [
    {
      src: "../Resources/ScreenShots/StudyMate/dashboard.png",
      caption: "Dashboard"
    },
    {
      src: "../Resources/ScreenShots/StudyMate/notes.png",
      caption: "Study workspace"
    },
    {
      src: "../Resources/ScreenShots/StudyMate/apisearch.png",
      caption: "Dashboard"
    },
    {
      src: "../Resources/ScreenShots/StudyMate/chats.png",
      caption: "Chats"
    },
    {
      src: "../Resources/ScreenShots/StudyMate/task.png",
      caption: "task"
    },
    {
      src: "../Resources/ScreenShots/StudyMate/flashcards.png",
      caption: "flashcards"
    }
  ],

  KitsuKoi: [
    {
      src: "../Resources/ScreenShots/KitsoKoi/image.png",
      caption: "Virtual pet"
    }
  ],

  AniDextop: [
    {
      src: "./Screenshots/AniDextop/desktop.png",
      caption: "Desktop interface"
    }
  ]
};

const modal = document.getElementById("screenshot_modal");
const title = document.getElementById("screenshot_title");
const image = document.getElementById("screenshot_image");
const caption = document.getElementById("screenshot_caption");
const counter = document.getElementById("screenshot_counter");
const thumbnails = document.getElementById("screenshot_thumbnails");

let currentGallery = [];
let currentIndex = 0;
let previousFocus = null;

function renderScreenshot() {
  if (!currentGallery.length) return;

  const item = currentGallery[currentIndex];

  image.src = item.src;
  image.alt = `${title.textContent}: ${item.caption}`;
  caption.textContent = item.caption;
  counter.textContent =
    `${String(currentIndex + 1).padStart(2, "0")} / ` +
    `${String(currentGallery.length).padStart(2, "0")}`;

  [...thumbnails.children].forEach((thumb, index) => {
    thumb.classList.toggle("is-active", index === currentIndex);
    thumb.setAttribute("aria-current", index === currentIndex ? "true" : "false");

    if (index === currentIndex) {
      thumb.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });
}

function showScreenshot(index) {
  currentIndex =
    (index + currentGallery.length) % currentGallery.length;
  renderScreenshot();
}

function openScreenshotGallery(projectName) {
  const gallery = projectGalleries[projectName];

  if (!gallery || !gallery.length) {
    console.warn(`No screenshots configured for ${projectName}`);
    return;
  }

  currentGallery = gallery;
  currentIndex = 0;
  previousFocus = document.activeElement;
  title.textContent = projectName;
  thumbnails.replaceChildren();

  gallery.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "screenshot-thumb";
    button.setAttribute("aria-label", `Show ${item.caption}`);

    const thumbImage = document.createElement("img");
    thumbImage.src = item.src;
    thumbImage.alt = "";
    thumbImage.loading = "lazy";

    button.appendChild(thumbImage);
    button.addEventListener("click", () => showScreenshot(index));
    thumbnails.appendChild(button);
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");

  renderScreenshot();
  document.getElementById("screenshot_close").focus();
}

function closeScreenshotGallery() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
  previousFocus?.focus();
}

document.getElementById("ss-btn").addEventListener("click", () => {
  const projectName = document.getElementById("project_name").textContent.trim();
  openScreenshotGallery(projectName);
});

document.getElementById("screenshot_close").addEventListener(
  "click", closeScreenshotGallery
);

modal.querySelector(".screenshot-backdrop").addEventListener(
  "click", closeScreenshotGallery
);

document.getElementById("screenshot_prev").addEventListener(
  "click", () => showScreenshot(currentIndex - 1)
);

document.getElementById("screenshot_next").addEventListener(
  "click", () => showScreenshot(currentIndex + 1)
);

document.addEventListener("keydown", event => {
  if (!modal.classList.contains("is-open")) return;

  if (event.key === "Escape") closeScreenshotGallery();
  if (event.key === "ArrowLeft") showScreenshot(currentIndex - 1);
  if (event.key === "ArrowRight") showScreenshot(currentIndex + 1);
});
