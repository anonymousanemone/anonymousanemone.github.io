let imageMap = {};
let rootPath = "";
let preloadedImages = {};
let lastScene = "";
let lastRegion = "";

// Load JSON first
fetch('scene_dict.json')
  .then(res => res.json())
  .then(data => {
    rootPath = data["root-path"] || "";
    delete data["root-path"];
    imageMap = data;
  })
  .catch(err => console.error("Failed to load scene_dict.json:", err));

// Wait for Vorple to initialize before starting observation
vorple.addEventListener("init", () => {
  waitForElementsThenObserve();
});

function waitForElementsThenObserve() {
  const sceneEl = document.querySelector(".status-line-left");
  const regionEl = document.querySelector(".status-line-right");
  const imgEl = document.getElementById("scene-graphic");

  if (!sceneEl || !regionEl || !imgEl) {
    // Retry in 100ms
    setTimeout(waitForElementsThenObserve, 100);
    return;
  }
  console.log("Detected status line.")
  startObserving(sceneEl, regionEl, imgEl);
}

function startObserving(sceneEl, regionEl, imgEl) {
  const defaultImageSrc = imgEl.src;
   // initial detection: try once immediately
  tryToUpdateImage(sceneEl, regionEl, imgEl, defaultImageSrc);

  // observe future changes
  const observer = new MutationObserver(() => {
    tryToUpdateImage(sceneEl, regionEl, imgEl, defaultImageSrc);
  });

  observer.observe(sceneEl, { childList: true, subtree: true });
  observer.observe(regionEl, { childList: true, subtree: true });
}

function tryToUpdateImage(sceneEl, regionEl, imgEl, defaultImageSrc) {
    const currentScene = sceneEl.textContent.trim();
    const currentRegion = regionEl.textContent.trim();
    // console.log(currentScene, currentRegion)

    if (!currentScene || !currentRegion) return;

    const regionChanged = currentRegion !== lastRegion;
    const sceneChanged = currentScene !== lastScene;

    if (!regionChanged && !sceneChanged) return;

    if (regionChanged) {
      clearPreloadedImages();
      preloadRegionImages(currentRegion);
      lastRegion = currentRegion;
    }

    if (sceneChanged) {
      lastScene = currentScene;

      const regionScenes = imageMap[currentRegion];
      if (!regionScenes) {
        console.warn(`Region "${currentRegion}" not found.`);
        imgEl.src = defaultImageSrc;
        return;
      }

      const imagePath = regionScenes[currentScene];
      if (imagePath && typeof imagePath === "string" && imagePath.trim() !== "") {
        const fullPath = rootPath ? rootPath + imagePath : imagePath;
        imgEl.src = fullPath;
      } else {
        console.warn(`Scene "${currentScene}" not found in region "${currentRegion}" or image path is empty.`);
        imgEl.src = defaultImageSrc;
      }
    }
  }

function preloadRegionImages(regionName) {
  const regionScenes = imageMap[regionName];
  if (!regionScenes) return;

  for (const scene in regionScenes) {
    const path = regionScenes[scene];
    if (path && path.trim() !== "") {
      const fullPath = rootPath ? rootPath + path : path;
      const img = new Image();
      img.src = fullPath;
      preloadedImages[fullPath] = img;
    }
  }
}

function clearPreloadedImages() {
  preloadedImages = {};
  removeHintStyle();
}

function removeHintStyle() {
  const spans = document.querySelectorAll('span.hint');
  spans.forEach(span => {
    // if the span's text content is empty
    if (!/\w+/.test(span.textContent)) {
      span.classList.remove('hint');
    }
  });
}