# AleFlow v0.7.2 Release Tasks

**Created:** 2026-01-04
**Goal:** Finalize working version as 0.7.2, push to GitHub, create release binaries

---

## Pre-Release Tasks (COMPLETED)

- [x] 1. Update version to 0.7.2 in `package.json`
- [x] 2. Update version to 0.7.2 in `src-tauri/Cargo.toml`
- [x] 3. Update version to 0.7.2 in `src-tauri/tauri.conf.json`
- [x] 4. Update `Cargo.lock` by running `cargo check`
- [x] 5. Commit version bump changes
- [x] 6. Push all commits to origin/main

---

## Security Fixes (COMPLETED)

- [x] Removed private.pem and public.pem from Git history
- [x] Added *.pem to .gitignore
- [x] Disabled code signing in release.yml (sign-binaries: false)
- [x] Removed signingIdentity from tauri.conf.json

---

## Platform Builds - ONE BY ONE

### macOS Apple Silicon (aarch64) - TESTING NOW
- [ ] Build succeeds in CI
- [ ] DMG uploaded to release
- [ ] Download and test on Mac

### macOS Intel (x86_64)
- [ ] Build succeeds in CI
- [ ] DMG uploaded to release
- [ ] (Optional) Test on Intel Mac

### Windows x64 - ALREADY WORKING ✅
- [x] Build succeeded in CI
- [x] EXE and MSI uploaded to release

### Windows ARM64 - ALREADY WORKING ✅
- [x] Build succeeded in CI
- [x] EXE and MSI uploaded to release

### Linux (Ubuntu/Debian) - ALREADY WORKING ✅
- [x] Build succeeded in CI
- [x] DEB, AppImage, RPM uploaded to release

---

## Final Steps

- [ ] All platforms building successfully
- [ ] Publish the release (make it public)
- [ ] Verify download links work
- [ ] Delete this task file

---

## Current Status

Windows and Linux builds are DONE and sitting in a draft release.
macOS is the only blocker - testing fix now.
