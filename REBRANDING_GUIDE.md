# AleFlow White-Label / Rebranding Guide

This guide documents the complete process for rebranding this repository (forked from Handy) into a new white-labeled application. Follow these steps to create a new distribution with your own name, logo, and branding.

## Prerequisites
- Node.js & Bun (`npm install -g bun`)
- Rust & Cargo
- Tauri CLI (`bun install`)
- macOS Tools (for icon generation): `sips`, `iconutil`

---

## 1. Naming & Identifiers

### Configuration Files
1.  **`package.json`**:
    - Update `"name"` to your new internal package name (e.g., `"aleflow-app"`).
    - Update `"productName"` (if present).

2.  **`src-tauri/tauri.conf.json`**:
    - Update `"productName"`: This is the name displayed in the Menu Bar and About panel.
    - Update `"identifier"`: **Crucial**. Change from `com.pais.handy` to your unique ID (e.g., `com.yourname.appname`).
    - Update `"version"` as needed.

3.  **`src-tauri/Cargo.toml`**:
    - Update `[package] name`.
    - Update `[package] default-run` if the binary name changes.

### Codebase Search & Replace
Perform a global case-insensitive search for the old name (e.g., "Handy") and replace it with your new name.
*   **Key Locations**:
    - `src/components/settings/debug/DebugPaths.tsx`: Updates data paths (e.g., `%APPDATA%/aleflow`).
    - `src/App.tsx`, `src/components/**/*.tsx`: User-facing strings (Window titles, prompts).
    - `README.md`, `BUILD.md`, `AGENTS.md`.

---

## 2. Icons & Assets (Critical)

**Note**: Simply replacing `icon.png` and running `tauri icon` may result in **blank/white icons** on macOS. Use the following manual method for reliability.

### 1. Source Image
Prepare a high-quality (1024x1024) PNG icon. Save it as `src-tauri/icons/icon.png`.

### 2. Manual Generation (macOS)
Run the following commands in the terminal to generate the standard Apple Icon Image (`.icns`) and the `.iconset` folder required for the DMG installer.

```bash
# 1. Create the iconset folder
mkdir -p src-tauri/icons/AleFlow.iconset

# 2. Resize source image to all required sizes
sips -z 16 16     src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_16x16.png
sips -z 32 32     src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_16x16@2x.png
sips -z 32 32     src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_32x32.png
sips -z 64 64     src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_32x32@2x.png
sips -z 128 128   src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_128x128.png
sips -z 256 256   src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_128x128@2x.png
sips -z 256 256   src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_256x256.png
sips -z 512 512   src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_256x256@2x.png
sips -z 512 512   src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_512x512.png
sips -z 1024 1024 src-tauri/icons/icon.png --out src-tauri/icons/AleFlow.iconset/icon_512x512@2x.png

# 3. Convert iconset to ICNS
iconutil -c icns src-tauri/icons/AleFlow.iconset -o src-tauri/icons/icon.icns
```

### 3. DMG Configuration
In `src-tauri/tauri.conf.json`, ensure your DMG config points to this valid icon file (automatically handled if `icon.icns` is present and bundles are active).

---

## 3. UI & Styling

### Global Variables
Edit `src/App.css` to update the brand colors:
```css
@theme {
  --color-logo-primary: #C1121F; /* Update this for your brand color */
  --color-logo-stroke: #382731;
  /* ... */
}
```

### Overlay Transparency
To ensure the recording overlay (the floating capsule) is transparent and doesn't show a white box:
1.  Ensure `src/overlay/RecordingOverlay.css` has:
    ```css
    :root, html, body {
      background-color: transparent !important;
    }
    ```
2.  Import `App.css` in `src/overlay/main.tsx` to ensure CSS variables are available for icons.

---

## 4. System & Security (macOS)

To ensure **Accessibility Permissions** (required for pasting text) persist after a restart, you **must** sign the application. For local distribution (student Use), ad-hoc signing is sufficient.

In `src-tauri/tauri.conf.json`:
```json
"bundle": {
  "macOS": {
    "signingIdentity": "-",  // <--- CRITICAL for permissions
    "entitlements": "Entitlements.plist",
    // ...
  }
}
```

---

## 5. Documentation Cleaning

1.  **`README.md`**:
    - Update Title and Description.
    - Add "Forked from / Attribution" section to comply with MIT License.
    - Remove references to original "Sponsors" or "Discord" unless you own them.
2.  **Delete Irrelevant Files**:
    - `CONTRIBUTING.md` (if complex/irrelevant).
    - `CONTRIBUTING_TRANSLATIONS.md`.

---

## 6. Build & Verify

### Build Command
```bash
bun run tauri build
```

### Verification Checklist
1.  **Icon check**: Does the `.dmg` and the installed `.app` have your logo (not the default rocket/white page)?
2.  **Permissions**: On first run, does it prompt for Microphone & Accessibility?
3.  **Functionality**:
    - Press shortcut.
    - Speak.
    - Does text paste? (Verifies Accessibility + Enigo).
    - Does the overlay appear with correct colors? (Verifies CSS variables).
