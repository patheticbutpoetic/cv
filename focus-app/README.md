# Focus Pomodoro — iPhone & Android app (Capacitor)

This folder wraps the [`pomodoro.html`](../pomodoro.html) study app as a native
mobile app using [Capacitor](https://capacitorjs.com). The web page and the app
share the **same code** — `www/index.html` is a copy of `../pomodoro.html`.

Native extras (active only inside the app):

- **Local notifications** — the "pomodoro complete" alert fires at the exact end
  time even if the phone is locked or you're in another app.
- **Distraction guard catches app-switching** — leaving the app during a focus
  session counts as a distraction, exactly like leaving the tab on the web.
- **Haptic buzz** when a pomodoro completes.
- Safe-area support for notches, and no browser-only buttons (fullscreen, etc.).

## Prerequisites

- Node.js 20+
- **Android:** [Android Studio](https://developer.android.com/studio)
- **iOS:** a Mac with Xcode 15+ and CocoaPods (`sudo gem install cocoapods`)

## First-time setup

```bash
cd focus-app
npm install
npm run sync        # copies ../pomodoro.html into www/ and syncs both platforms
```

> Note: `ios/` was generated on Linux, so CocoaPods didn't run yet. The first
> `npm run sync` (or `npx cap sync ios`) on your Mac installs the pods.

## Run on Android

```bash
npm run android     # sync + open in Android Studio
```

Then press ▶ Run on an emulator or a USB-connected phone (enable USB debugging
in the phone's developer options). To just build an APK:
`cd android && ./gradlew assembleDebug` — the APK lands in
`android/app/build/outputs/apk/debug/`.

## Run on iPhone (requires a Mac)

```bash
npm run ios         # sync + open in Xcode
```

In Xcode: select the `App` target → *Signing & Capabilities* → pick your Apple
ID team, then press ▶ Run on a simulator or your plugged-in iPhone. A free
Apple ID works for installing on your own device; App Store distribution needs
a paid developer account.

## Making changes

Edit `../pomodoro.html` (the single source of truth), then:

```bash
npm run sync
```

and re-run from Android Studio / Xcode.

## Notes

- The **desktop app blocker** (`../focus-blocker/`) is a PC tool; on phones,
  system-level app blocking isn't possible from an app without special
  permissions. The in-app distraction guard covers phone usage instead.
- App icons/splash screens are currently Capacitor defaults. To use your own,
  add `assets/icon.png` (1024×1024) and `assets/splash.png` (2732×2732) here and
  run `npx @capacitor/assets generate`.
