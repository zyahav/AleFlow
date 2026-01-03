# AGENT_REBRAND_GUIDE.md

**SYSTEM INSTRUCTION FOR AI AGENTS:**
If a user asks you to "white label" or "rebrand" this repository, follow this exact guide. Your goal is to guide the user through the process and execute the technical changes.

---

## 🛑 Phase 1: Information Gathering
**DO NOT START CODING YET.** First, ask the user the following questions to gather the necessary "Rebranding Configuration". Wait for their specific answers.

**Ask the user:**
1.  **App Name**: "What is the new name of the application? (e.g., MyRecorder)"
2.  **App ID**: "What is the unique bundle identifier? (e.g., com.mycompany.rec)"
3.  **Description**: "What is the short description for the app?"
4.  **Brand Color**: "What is your primary brand color? (Provide a Hex Code, e.g., #FF5733)"
5.  **Icon Image**: "Please upload or provide the path to a **1024x1024 PNG** image to be used as the app icon."
    *   *Note to Agent: Verify the user provides a valid image path or file.*

---

## 🛠️ Phase 2: Execution (Agent Actions)
Once you have the inputs, perform the following technical steps in order.

### Step 1: Naming & Identifiers
**Action**: Modify the following files with the **App Name** and **App ID** provided by the user.

1.  **`package.json`**:
    *   Set `"name"` to a kebab-case version of App Name (e.g., `my-recorder`).
    *   Set `"productName"` to the App Name.
2.  **`src-tauri/tauri.conf.json`**:
    *   Set `"productName"` to the App Name.
    *   Set `"identifier"` to the App ID.
    *   Update `bundle.macOS.dmg.title` (if present) to the App Name.
3.  **`src-tauri/Cargo.toml`**:
    *   Set `package.name` to a snake_case version of App Name.
    *   Set `default-run` to the same snake_case name.

### Step 2: Global Text Replacement
**Action**: Perform a global case-insensitive search and replace across the entire repository (excluding `.git` and `node_modules`).
*   **Find**: "AleFlow" (or "Handy")
*   **Replace**: [User's App Name]

*Critical check*: Ensure you do not break code logic (e.g., check `DebugPaths.tsx` manually to ensure paths like `%APPDATA%/appname` are valid).

### Step 3: Brand Styling
**Action**: Update the application's color scheme.
1.  Edit **`src/App.css`**:
    *   Locate the `@theme` or `:root` block.
    *   Change `--color-logo-primary` to the **Brand Color** provided by the user.
    *   Ensure `--color-background-ui` matches if it was meant to be the brand color.

### Step 4: Icon Generation (Crucial)
**Action**: Creating the icon requires specific macOS commands. Do not just copy the file.
1.  **Save** the user's icon image to `src-tauri/icons/icon.png` (overwrite existing).
2.  **Execute** this shell script to generate the required `.icns` and `.iconset`:
    ```bash
    # 1. Ensure directory exists
    mkdir -p src-tauri/icons/AleFlow.iconset

    # 2. Resize images (using system tools)
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

    # 3. Create ICNS file
    iconutil -c icns src-tauri/icons/AleFlow.iconset -o src-tauri/icons/icon.icns
    ```

### Step 5: Clean Documentation
**Action**:
1.  **Rewrite `README.md`**:
    *   Title: [App Name]
    *   Description: [User's Description]
    *   **Attribution**: You MUST keep a section "Forked from Handy / AleFlow" to comply with the MIT License.
2.  **Delete** helper doc files that mention the old brand (e.g., `REBRANDING_GUIDE.md`, `AGENTS.md` if not needed).

---

## 🚀 Phase 3: Build & Delivery
**Action**:
1.  Run `bun run tauri build`.
2.  Locate the output in `src-tauri/target/release/bundle/dmg/`.
3.  **Verify**:
    *   Open the DMG.
    *   Check that the Icon is the user's custom icon.
    *   Check that the Application Name is correct.

**Final Handoff**: Tell the user the white-label app is ready and provide the path to the installer.
