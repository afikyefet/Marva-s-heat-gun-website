# Product Viewer

Minimal 3D product viewer built with [`<model-viewer>`](https://modelviewer.dev/).  
Single HTML file — no build step, no dependencies to install.

---

## Swapping in your model

1. Export your model from KeyShot as `.glb`
2. Rename the file to **`model.glb`**
3. Drop it into this folder, replacing the existing file

The page references `./model.glb` directly, so no code changes needed.

> **Note:** There is already a `.glb` file in this folder (`Fiskars Craft Heat Gun Marva.glb`).  
> Either rename it to `model.glb`, or update the `src` attribute on the `<model-viewer>` element in `index.html` to match the filename you want to use.

---

## Serving locally

The page **must** run over HTTP — not opened as a `file://` URL.  
Browsers block cross-origin requests for local files, which prevents the `.glb` from loading.

**Python (no install needed):**
```bash
python3 -m http.server 8080
# open http://localhost:8080
```

**Node / npx (no install needed):**
```bash
npx serve .
# follow the URL it prints
```

**VS Code:**  
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension → right-click `index.html` → *Open with Live Server*.

---

## Quick customization

| What to change | Where in `index.html` |
|---|---|
| Title text | `<p id="title">PRODUCT NAME</p>` |
| Rotation speed | `rotation-per-second="18deg"` on `<model-viewer>` |
| Camera start angle | `camera-orbit="0deg 75deg auto"` on `<model-viewer>` — also update `INITIAL_ORBIT` in the `<script>` to match |
| Shadow strength | `shadow-intensity="0.6"` on `<model-viewer>` (0 = none, 1 = full) |
| Reset button style | `#reset-btn` block in `<style>` |
| Page title (browser tab) | `<title>Product Viewer</title>` in `<head>` |
