const ownerDesigns = [
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

const seedCommunityDesigns = [
  {
    id: "preview-001",
    name: "Chrome Pulse",
    creator: "Community preview",
    placement: "big",
    imageUrl: "",
    createdAt: "Preview"
  },
  {
    id: "preview-002",
    name: "Corner Static",
    creator: "Community preview",
    placement: "small",
    imageUrl: "",
    createdAt: "Preview"
  }
];

const logKey = "tee-dev-design-log";

const ownerGrid = document.querySelector("#owner-grid");
const communityGrid = document.querySelector("#community-grid");
const ledgerList = document.querySelector("#ledger-list");
const heroCount = document.querySelector("#hero-count");
const form = document.querySelector("#design-form");
const imageUrlInput = document.querySelector("#image-url");
const imageFileInput = document.querySelector("#image-file");
const fileName = document.querySelector("#file-name");
const designNameInput = document.querySelector("#design-name");
const previewImage = document.querySelector("#preview-image");
const previewFallback = document.querySelector("#preview-fallback");
const previewName = document.querySelector("#preview-name");
const previewPlacement = document.querySelector("#preview-placement");
const exportButton = document.querySelector("#export-log");
const clearButton = document.querySelector("#clear-log");
let uploadedImageData = "";

function getLog() {
  return JSON.parse(localStorage.getItem(logKey) || "[]");
}

function setLog(entries) {
  localStorage.setItem(logKey, JSON.stringify(entries));
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
  const priceLabel = source === "owner" ? "$38 drop" : "Preview buy flow";
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
  ownerGrid.innerHTML = ownerDesigns.map((design) => renderCard(design, "owner")).join("");
  const communityDesigns = [...getLog(), ...seedCommunityDesigns].slice(0, 6);
  communityGrid.innerHTML = communityDesigns.map((design) => renderCard(design, "community")).join("");
}

function renderLedger() {
  const entries = getLog();
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
    : `<li><div><strong>No logged submissions yet</strong><small> Create a preview to add the first ledger entry.</small></div></li>`;
}

function updatePreview() {
  const placement = new FormData(form).get("placement") || "big";
  const name = designNameInput.value.trim() || "Late night logo";
  const imageUrl = imageUrlInput.value.trim() || uploadedImageData;

  previewName.textContent = name;
  previewPlacement.textContent = placement === "small" ? "Left-chest print" : "Full-front print";
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

form.addEventListener("input", updatePreview);

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
    imageUrlInput.value = "";
    updatePreview();
  });
  reader.readAsDataURL(file);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const imageUrl = formData.get("imageUrl").trim() || uploadedImageData;
  const entry = {
    id: crypto.randomUUID(),
    name: formData.get("designName").trim(),
    creator: formData.get("creatorName").trim(),
    imageUrl,
    placement: formData.get("placement"),
    createdAt: new Date().toISOString()
  };

  setLog([entry, ...getLog()]);
  renderProducts();
  renderLedger();
  form.reset();
  uploadedImageData = "";
  fileName.textContent = "No file selected";
  updatePreview();
});

exportButton.addEventListener("click", () => {
  const jsonl = getLog().map((entry) => JSON.stringify(entry)).join("\n");
  const blob = new Blob([jsonl], { type: "application/x-ndjson" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tee-dev-design-log-${new Date().toISOString().slice(0, 10)}.jsonl`;
  link.click();
  URL.revokeObjectURL(url);
});

clearButton.addEventListener("click", () => {
  setLog([]);
  renderProducts();
  renderLedger();
});

renderProducts();
renderLedger();
updatePreview();
