# AleFlow v0.7.2 Release Tasks

**Created:** 2026-01-04
**Status:** ✅ COMPLETED

---

## All Tasks Complete!

- [x] Version bumped to 0.7.2
- [x] Security fix: removed private keys from Git history
- [x] CI builds working for ALL platforms
- [x] Release published on GitHub
- [x] macOS paste functionality verified working

---

## Release Assets (all available at GitHub)

- ✅ macOS Apple Silicon: `AleFlow_0.7.2_aarch64.dmg`
- ✅ macOS Intel: `AleFlow_0.7.2_x64.dmg`
- ✅ Windows x64: `AleFlow_0.7.2_x64-setup.exe`
- ✅ Windows ARM64: `AleFlow_0.7.2_arm64-setup.exe`
- ✅ Linux: DEB, AppImage, RPM

---

## macOS User Instructions (for README)

Since v0.7.2 is unsigned (ad-hoc), users need to:

1. Clear Gatekeeper: `sudo xattr -cr /Applications/AleFlow.app`
2. Grant Accessibility: Remove and re-add AleFlow in System Settings → Privacy & Security → Accessibility

---

**Release URL:** https://github.com/zyahav/AleFlow/releases/tag/v0.7.2
