# CleanScan

**Clean scans. Perfect PDFs.**

A premium, **local-first, English-only** document scanner for iOS and Android. CleanScan turns camera photos and gallery images into clean, professional PDFs — with batch pages, scanner-style filters, a local library, ID Card mode, Scan Quality Score, smart naming, and one-tap sharing.

Built with **React Native + Expo + TypeScript** per the CleanScan PRD (v1.0).

---

## Quick start

```bash
cd CleanScan
npm install          # install dependencies
npm start            # start the Expo dev server
npm run android      # run on Android (device/emulator or Expo Go)
npm run ios          # run on iOS (Expo Go / simulator)
```

> The camera and gallery flows require a real device or emulator. Everything else runs in Expo Go.

### Tests

Two suites:

```bash
npm test                              # fast pure-logic suite (ts-jest, Node) — 63 tests
npx jest --config jest.expo.config.js # component render suite (jest-expo) — 10 tests
npm run typecheck                     # tsc --noEmit (0 errors)
```

The pure-logic suite has **no** React Native/Expo imports, so it runs anywhere (CI, plain Node).

---

## Product scope

- **English-only.** No multilingual UI, RTL, or non-English OCR.
- **Local-first.** No account, no cloud upload in V1. Scans stay on the device unless the user shares/exports.
- **Analytics never collect** document content, image content, OCR text, file names, or private paths.

### Implemented (V1 + V1.5)

Home · Mode Select · Camera (single + batch) · Permission screens · Crop/Review (rotate + manual crop) · Enhance (filters + adjustments) · Batch Pages (drag-reorder, multi-select delete, add, edit) · Export (smart naming, paper/quality/compression, validation, large-PDF warning, progress) · PDF generation · PDF Full Preview · PDF Ready (one-tap share presets) · Library (search, tabs, favorite, rename, delete, action sheet) · Tools · OCR example placeholder · Settings · Empty/Loading/Error states · **ID Card Mode** (front/back → one A4 page) · **Scan Quality Score** · **Auto Retake Warning** · **Smart Auto Naming** · **Smart Scan Modes** · Local-first privacy copy · Temp-file cleanup · Error handling · Crash-reporting + analytics wrappers.

### Coming Soon (clearly labeled, no fake functionality)

Merge/Sign/Compress/Protect/Watermark/Organize PDFs, real OCR, folders, auto edge detection + perspective correction, true B&W/shadow-removal filters, cloud backup. These are marked **Coming Soon** in the UI and are not wired to fake behavior.

---

## Architecture

```
CleanScan/
  app/                       # Expo Router screens (file-based routing)
    _layout.tsx              # root: init dirs/db/settings + startup temp cleanup
    (tabs)/                  # Home · Library · Tools · Settings
    (scan)/                  # mode-select · camera · crop-review · enhance
                             # batch-pages · export · id-card/{front,back,preview}
    (pdf)/                   # preview (full view) · ready (share presets)
    permissions/             # camera · gallery
    ocr.tsx  onboarding.tsx
  src/
    components/{common,documents,scanner,tools,share}
    constants/               # colors, typography, spacing, radius, layout,
                             # paperSizes, scanModes (design tokens — PRD §9, §19, §45)
    db/                      # SQLite: database, migrations, documentRepository
    hooks/                   # useAppTheme, useHaptics
    services/                # camera, imageImport, imageEnhancement, crop,
                             # scanQuality, pdfGeneration, localStorage,
                             # documentLibrary, smartNaming, share, sharePreset,
                             # idCardPdf, tempFileCleanup, permissions,
                             # analytics, crashReporting
    store/                   # zustand: scanStore, documentStore, settingsStore, idCardStore
    types/                   # Document, DocumentPage, ScanProject, ScanMode,
                             # ScanQualityResult, PdfExportSettings, LibraryFolder, AppSettings
    utils/                   # safeFileName, fileSize, dateFormat, reorder,
                             # search, errors, logger, id
  scripts/generate-assets.js # regenerate placeholder brand PNGs
```

### PDF generation (PRD §17.5)

Pages are prepared (rotate + resize/compress per quality preset), embedded as base64 data URIs in one image-per-page HTML document, rendered with `expo-print`, then moved out of cache into app storage. Base64 data URIs are used for iOS reliability. Progress is reported per page.

---

## Manual QA checklist (PRD §25.3, §37.4, §59)

Automated coverage is noted; the rest need a device.

| Case | How it's covered |
| --- | --- |
| Camera permission denied | `permissions/camera.tsx` + `permissionsService` (blocked → Open Settings) |
| Gallery permission denied | `permissions/gallery.tsx` |
| Camera / gallery cancel | Import returns `null`/`[]`, not an error (`imageImportService`) |
| Single image → PDF | Camera → crop → enhance → export → `createPdfFromPages` |
| Multiple images → PDF | Import multi → batch-pages → export |
| Batch reorder | `DraggableFlatList` + `reorderPages` (unit-tested) |
| Batch delete | Multi-select + `removePage` (unit-tested, reindexes) |
| Rotate page | `cropService.rotateImage` + `updatePage` |
| Apply filter / Apply to All | `enhance.tsx` `patchTargets` |
| Save / Share / Rename PDF | `export.tsx`, `shareService`, `RenameDialog` (validated) |
| Empty / search-empty library | `EmptyState` in `library.tsx` |
| Search library | `filterByName` (unit-tested) |
| Delete document | `documentLibraryService.deleteDocument` (DB row + files) |
| ID Card front/back | `(scan)/id-card/*` + `createIdCardPdf` |
| Scan Quality Score | `scanQualityService` + `computeQualityScore` (unit-tested) |
| Auto Retake Warning | `RetakeWarningModal` + `shouldWarnRetake` (unit + component tests) |
| Smart Auto Naming | `suggestDocumentName` (unit-tested) |
| Temp file cleanup | `tempFileCleanupService` (after export + on startup) |
| App restart persistence | SQLite documents + JSON settings reload on launch |

---

## Building for stores

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android   # dev client
eas build --profile development --platform ios
eas build --platform android                         # production
eas build --platform ios
```

`app.json` already contains bundle ids (`com.adam.cleanscan`), permission usage strings, and Android permissions.

> **Assets:** `src/assets/images/*.png` are generated placeholders (`node scripts/generate-assets.js`). Replace them with the final CleanScan logo from the brand exploration before store submission.

---

## Privacy

- No account required; works fully offline for scan, import, PDF creation, save, library, and share.
- Scans are stored locally; nothing is uploaded to a server in V1.
- `analyticsService` strips any private keys and only tracks allowed properties (page count, mode, platform, settings, success, duration). `crashReportingService` never sends image/PDF/OCR content.
