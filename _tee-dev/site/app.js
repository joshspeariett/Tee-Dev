const fallbackOwnerDesigns = [
  {
    name: "Noise Maker",
    creator: "Owner Studio",
    placement: "big",
    description: "High-contrast full-front graphic for loud nights and clean silhouettes.",
    color: "acid"
  },
  {
    name: "After Hours",
    creator: "Owner Studio",
    placement: "small",
    description: "Minimal left-chest mark with a late train, last call feel.",
    color: "cyan"
  },
  {
    name: "Street Signal",
    creator: "Owner Studio",
    placement: "big",
    description: "Bold block type built for heavyweight black cotton.",
    color: "hot"
  }
];

const sessionKey = "tee-dev-session-designs";
const placementSpecs = {
  big: {
    label: "Full-front print",
    width: 2400,
    height: 3000,
    tolerance: 0
  },
  small: {
    label: "Left-chest print",
    width: 1200,
    height: 1200,
    tolerance: 0
  }
};

const ownerGrid = document.querySelector("#owner-grid");
const communityGrid = document.querySelector("#community-grid");
const ledgerList = document.querySelector("#ledger-list");
const heroCount = document.querySelector("#hero-count");
const form = document.querySelector("#design-form");
const imageUrlInput = document.querySelector("#image-url");
const imageFileInput = document.querySelector("#image-file");
const uploadPanel = document.querySelector("#upload-panel");
const urlPanel = document.querySelector("#url-panel");
const fileName = document.querySelector("#file-name");
const designNameInput = document.querySelector("#design-name");
const previewImage = document.querySelector("#preview-image");
const previewFallback = document.querySelector("#preview-fallback");
const previewName = document.querySelector("#preview-name");
const previewPlacement = document.querySelector("#preview-placement");
const dimensionNote = document.querySelector("#dimension-note");
const formMessage = document.querySelector("#form-message");
const exportButton = document.querySelector("#export-log");
const clearButton = document.querySelector("#clear-log");
let uploadedImageData = "";
let fittedImageData = "";
let currentImageDimensions = null;
let storefrontDesigns = [...fallbackOwnerDesigns];

function getSessionDesigns() {
  return JSON.parse(sessionStorage.getItem(sessionKey) || "[]");
}

function setSessionDesigns(entries) {
  sessionStorage.setItem(sessionKey, JSON.stringify(entries));
}

function createFallbackText(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.slice(0, 7).toUpperCase())
    .join("\n") || "YOUR\nART";
}

function teeMarkup(design) {
  const placementClass = design.placement === "small" ? "small-print" : "big-print";
  const tone = design.color || (design.placement === "small" ? "cyan" : "acid");
  const label = createFallbackText(design.name);
  const img = design.imageUrl
    ? `<img class="${design.placement}" src="${design.imageUrl}" alt="${design.name} artwork">`
    : `<div class="print ${placementClass}" data-tone="${tone}">${label}</div>`;

  return `
    <div class="tee tee-graphite">
      <div class="collar"></div>
      ${img}
    </div>
  `;
}

function renderCard(design, source) {
  const priceLabel = "Buy";
  return `
    <article class="product-card">
      <div class="product-art">${teeMarkup(design)}</div>
      <div class="product-info">
        <div class="tag-row">
          <span class="tag">${source === "owner" ? "Owner" : "Submitted"}</span>
          <span class="tag">${design.placement === "small" ? "Left chest" : "Full front"}</span>
        </div>
        <h3>${design.name}</h3>
        <p>${design.description || `Created by ${design.creator}.`}</p>
        <button class="button ghost" type="button">${priceLabel}</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  ownerGrid.innerHTML = storefrontDesigns.map((design) => renderCard(design, "owner")).join("");
  const communityDesigns = getSessionDesigns().slice(0, 6);
  communityGrid.innerHTML = communityDesigns.length
    ? communityDesigns.map((design) => renderCard(design, "community")).join("")
    : `<div class="empty-state">Your added designs will appear here for this session only.</div>`;
}

function renderLedger() {
  const entries = getSessionDesigns();
  heroCount.textContent = `${entries.length} design${entries.length === 1 ? "" : "s"}`;
  ledgerList.innerHTML = entries.length
    ? entries.map((entry) => `
      <li>
        <div>
          <strong>${entry.name}</strong>
          <small> by ${entry.creator} | ${entry.placement === "small" ? "left-chest print" : "full-front print"}</small>
        </div>
        <small>${new Date(entry.createdAt).toLocaleString()}</small>
      </li>
    `).join("")
    : `<li><div><strong>No designs added yet</strong><small> Add artwork to start your session list.</small></div></li>`;
}

function getImageSourceMode() {
  return new FormData(form).get("imageSourceMode") || "upload";
}

function updateSourceMode() {
  const mode = getImageSourceMode();
  uploadPanel.classList.toggle("is-hidden", mode !== "upload");
  urlPanel.classList.toggle("is-hidden", mode !== "url");

  if (mode === "upload") {
    imageUrlInput.value = "";
  } else {
    uploadedImageData = "";
    imageFileInput.value = "";
    fileName.textContent = "No file selected";
  }
}

function getPlacementSpec() {
  return placementSpecs[new FormData(form).get("placement") || "big"];
}

function setFormMessage(message, tone = "muted") {
  formMessage.textContent = message;
  formMessage.dataset.tone = tone;
}

function updateDimensionNote() {
  const spec = getPlacementSpec();
  dimensionNote.textContent = `${spec.label} artwork will be fitted to ${spec.width} x ${spec.height} px.`;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    if (!source) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Image could not be loaded")));
    image.src = source;
  });
}

function fitImageToSpec(image, spec) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = spec.width;
  canvas.height = spec.height;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(spec.width / image.naturalWidth, spec.height / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const x = Math.round((spec.width - width) / 2);
  const y = Math.round((spec.height - height) / 2);

  context.drawImage(image, x, y, width, height);
  return canvas.toDataURL("image/png");
}

async function fitCurrentArtwork(source) {
  if (!source) {
    currentImageDimensions = null;
    fittedImageData = "";
    setFormMessage("");
    return false;
  }

  const spec = getPlacementSpec();

  try {
    const image = await loadImage(source);
    const originalDimensions = {
      width: image.naturalWidth,
      height: image.naturalHeight
    };

    if (!originalDimensions.width || !originalDimensions.height) {
      setFormMessage("We could not read that image size. Try a PNG or JPG.", "error");
      return false;
    }

    fittedImageData = fitImageToSpec(image, spec);
    currentImageDimensions = {
      width: spec.width,
      height: spec.height,
      originalWidth: originalDimensions.width,
      originalHeight: originalDimensions.height
    };

    setFormMessage(
      `Artwork fitted from ${originalDimensions.width} x ${originalDimensions.height} px to ${spec.width} x ${spec.height} px.`,
      "success"
    );
    return true;
  } catch (error) {
    currentImageDimensions = null;
    fittedImageData = "";
    setFormMessage("We could not resize that image. Try uploading the file directly, or use a PNG/JPG URL that allows previewing.", "error");
    return false;
  }
}

function updatePreview() {
  const placement = new FormData(form).get("placement") || "big";
  const name = designNameInput.value.trim() || "Late night logo";
  const rawImageUrl = getImageSourceMode() === "url" ? imageUrlInput.value.trim() : uploadedImageData;
  const imageUrl = fittedImageData || rawImageUrl;
  const spec = placementSpecs[placement];

  previewName.textContent = name;
  previewPlacement.textContent = spec.label;
  previewFallback.textContent = createFallbackText(name);
  previewFallback.className = `print ${placement === "small" ? "small-print" : "big-print"}`;

  previewImage.className = "";
  previewImage.removeAttribute("src");
  previewImage.alt = "";
  previewFallback.style.display = "grid";

  if (imageUrl) {
    previewImage.src = imageUrl;
    previewImage.alt = `${name} preview artwork`;
    previewImage.classList.add(placement);
    previewFallback.style.display = "none";
  }
}

async function loadStorefrontDesigns() {
  try {
    const response = await fetch("/api/storefront-designs");
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.designs) && payload.designs.length) {
      storefrontDesigns = payload.designs;
      renderProducts();
    }
  } catch (error) {
    console.warn("Storefront designs unavailable", error);
  }
}

async function logSubmission(entry) {
  const payload = {
    ...entry,
    imageSource: entry.imageFileName ? "upload" : "url",
    imageData: entry.imageFileName ? entry.imageUrl : "",
    imageUrl: entry.imageFileName ? "" : entry.imageUrl,
    imageWidth: entry.imageWidth,
    imageHeight: entry.imageHeight
  };

  try {
    await fetch("/api/design-submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("Backend submission log unavailable", error);
  }
}

form.addEventListener("input", () => {
  updateSourceMode();
  updateDimensionNote();
  fittedImageData = "";
  currentImageDimensions = null;
  setFormMessage("");
  updatePreview();
});

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  uploadedImageData = "";
  fileName.textContent = file ? file.name : "No file selected";

  if (!file) {
    updatePreview();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploadedImageData = reader.result;
    fittedImageData = "";
    imageUrlInput.value = "";
    updatePreview();
    fitCurrentArtwork(uploadedImageData).then(updatePreview);
  });
  reader.readAsDataURL(file);
});

imageUrlInput.addEventListener("change", () => {
  fittedImageData = "";
  updatePreview();
  fitCurrentArtwork(imageUrlInput.value.trim()).then(updatePreview);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const sourceMode = getImageSourceMode();
  const rawImageUrl = sourceMode === "url" ? formData.get("imageUrl").trim() : uploadedImageData;

  if (!rawImageUrl) {
    updatePreview();
    return;
  }

  if (!fittedImageData) {
    const isFit = await fitCurrentArtwork(rawImageUrl);
    if (!isFit) return;
  }

  const entry = {
    id: crypto.randomUUID(),
    name: formData.get("designName").trim(),
    creator: formData.get("creatorName").trim(),
    imageUrl: fittedImageData,
    imageFileName: sourceMode === "upload" ? imageFileInput.files[0]?.name || "" : "",
    imageWidth: currentImageDimensions.width,
    imageHeight: currentImageDimensions.height,
    originalImageWidth: currentImageDimensions.originalWidth,
    originalImageHeight: currentImageDimensions.originalHeight,
    placement: formData.get("placement"),
    createdAt: new Date().toISOString()
  };

  setSessionDesigns([entry, ...getSessionDesigns()]);
  logSubmission(entry);
  renderProducts();
  renderLedger();
  form.reset();
  uploadedImageData = "";
  fittedImageData = "";
  currentImageDimensions = null;
  fileName.textContent = "No file selected";
  updateSourceMode();
  updateDimensionNote();
  updatePreview();
  setFormMessage("Added to your session.", "success");
});

exportButton.addEventListener("click", () => {
  const jsonl = getSessionDesigns().map((entry) => JSON.stringify(entry)).join("\n");
  const blob = new Blob([jsonl], { type: "application/x-ndjson" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tee-dev-design-log-${new Date().toISOString().slice(0, 10)}.jsonl`;
  link.click();
  URL.revokeObjectURL(url);
});

clearButton.addEventListener("click", () => {
  setSessionDesigns([]);
  renderProducts();
  renderLedger();
});

renderProducts();
renderLedger();
updateSourceMode();
updateDimensionNote();
updatePreview();
loadStorefrontDesigns();
