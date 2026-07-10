const state = {
  artworkData: "",
  artworkIsSquare: false
};

const controls = {
  name: document.querySelector("#shirt-name"),
  neck: document.querySelector("#neck-shape"),
  size: document.querySelector("#shirt-size"),
  shirtColor: document.querySelector("#shirt-color"),
  trimColor: document.querySelector("#trim-color"),
  imageFile: document.querySelector("#image-file"),
  fileName: document.querySelector("#file-name"),
  imagePlacement: document.querySelector("#image-placement"),
  imageScale: document.querySelector("#image-scale"),
  customText: document.querySelector("#custom-text"),
  textColor: document.querySelector("#text-color"),
  textPosition: document.querySelector("#text-position")
};

const preview = {
  shirt: document.querySelector("#shirt-preview"),
  neck: document.querySelector("#shirt-neck"),
  artwork: document.querySelector("#artwork-preview"),
  text: document.querySelector("#text-preview"),
  summaryName: document.querySelector("#summary-name"),
  summarySize: document.querySelector("#summary-size")
};

function setArtworkPosition() {
  const placement = controls.imagePlacement.value;
  const scale = Number(controls.imageScale.value) / 100;
  const base = placement === "small"
    ? { width: 88, height: 88, top: 122, right: 84 }
    : { width: 238, height: 260, top: 145, right: null };

  preview.artwork.style.width = `${Math.round(base.width * scale)}px`;
  preview.artwork.style.height = `${Math.round(base.height * scale)}px`;
  preview.artwork.style.top = `${base.top}px`;
  preview.artwork.style.left = placement === "small" ? "auto" : "50%";
  preview.artwork.style.right = placement === "small" ? `${base.right}px` : "auto";
  preview.artwork.style.transform = placement === "small" ? "none" : "translateX(-50%)";
}

function updateTextPosition() {
  const position = controls.textPosition.value;
  preview.text.hidden = position === "none";
  preview.text.style.top = position === "above" ? "120px" : "420px";
}

function render() {
  preview.shirt.style.setProperty("--shirt-color", controls.shirtColor.value);
  preview.shirt.style.setProperty("--trim-color", controls.trimColor.value);
  preview.shirt.dataset.neck = controls.neck.value;
  preview.neck.dataset.neck = controls.neck.value;

  preview.text.textContent = controls.customText.value || "";
  preview.text.style.color = controls.textColor.value;
  updateTextPosition();

  preview.summaryName.textContent = controls.name.value || "My custom tee";
  preview.summarySize.textContent = `Size ${controls.size.value}`;

  if (state.artworkData) {
    preview.artwork.src = state.artworkData;
    preview.artwork.hidden = false;
    preview.artwork.classList.toggle("rounded-art", state.artworkIsSquare || controls.imagePlacement.value === "small");
  } else {
    preview.artwork.removeAttribute("src");
    preview.artwork.hidden = true;
  }

  setArtworkPosition();
}

function loadArtwork(file) {
  state.artworkData = "";
  state.artworkIsSquare = false;
  controls.fileName.textContent = file ? file.name : "No file selected";

  if (!file) {
    render();
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const image = new Image();
    image.addEventListener("load", () => {
      state.artworkIsSquare = image.naturalWidth === image.naturalHeight;
      state.artworkData = reader.result;
      render();
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

Object.values(controls).forEach((control) => {
  if (control && control !== controls.imageFile) {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  }
});

controls.imageFile.addEventListener("change", () => {
  loadArtwork(controls.imageFile.files[0]);
});

render();
