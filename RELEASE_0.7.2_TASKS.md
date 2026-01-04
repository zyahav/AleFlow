# AleFlow v0.7.2 Release Tasks

**Created:** 2026-01-04
**Goal:** Finalize working version as 0.7.2, push to GitHub, create release binaries

---

## Pre-Release Tasks

- [x] 1. Update version to 0.7.2 in `package.json`
- [x] 2. Update version to 0.7.2 in `src-tauri/Cargo.toml`
- [x] 3. Update version to 0.7.2 in `src-tauri/tauri.conf.json`
- [x] 4. Update `Cargo.lock` by running `cargo check` (auto-updates lock file)
- [x] 5. Commit version bump changes

---

## Push & Release Tasks

- [x] 6. Push all commits to origin/main (includes 5 unpushed + version bump)
- [ ] 7. Trigger GitHub Actions release workflow (workflow_dispatch)
- [ ] 8. Verify CI workflow runs successfully (green checkmark)
- [ ] 9. Verify release artifacts created (DMG, MSI, AppImage, etc.)

---

## Post-Release Verification

- [ ] 10. Download DMG from GitHub Releases
- [ ] 11. Test installation on Mac (drag to /Applications)
- [ ] 12. Verify app launches and works correctly
- [ ] 13. Delete this task file (optional cleanup)

---

## Notes

- Local working version confirmed on Mac before starting
- Tag v0.7.1 exists but points to unpushed commits - will be superseded by v0.7.2
- Release workflow reads version from tauri.conf.json and auto-creates tag
- **SECURITY FIX APPLIED:** Removed private.pem and public.pem from Git history (force pushed)
- **Code signing disabled** in release.yml to allow builds without Apple certificates
