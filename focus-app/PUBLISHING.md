# Testing & publishing Focus Pomodoro

The complete path from this repo to the App Store and Google Play.

## 0. What's already prepared for you

- ✅ App icons and splash screens for both platforms (generated from `assets/`)
- ✅ Android permissions for exact-time notifications
- ✅ App ID `com.adamsalaheldin.focuspomodoro`, app name "Focus Pomodoro", version 1.0
- ✅ Privacy policy page at [`../privacy.html`](../privacy.html) — both stores
  require a public privacy policy URL. Enable GitHub Pages on this repo
  (Settings → Pages → deploy from `main`) and the URL becomes
  `https://<your-username>.github.io/cv/privacy.html`.

## 1. Test on your own devices first

### Android (any computer)

1. Install [Android Studio](https://developer.android.com/studio).
2. `cd focus-app && npm install && npm run android` — opens Android Studio.
3. Testing options:
   - **Emulator:** Device Manager → create a Pixel device → ▶ Run.
   - **Your phone:** enable *Developer options* (tap Build Number 7× in phone
     Settings → About) → enable *USB debugging* → plug in via USB → ▶ Run.
   - **Shareable APK:** `cd android && ./gradlew assembleDebug` →
     `android/app/build/outputs/apk/debug/app-debug.apk` — send to any Android
     phone and install directly.

### iPhone (requires a Mac)

1. Install Xcode from the Mac App Store, plus CocoaPods: `sudo gem install cocoapods`.
2. `cd focus-app && npm install && npm run ios` — opens Xcode (first run installs pods).
3. Select the **App** target → *Signing & Capabilities* → check *Automatically
   manage signing* → add your Apple ID as the Team.
4. ▶ Run on a Simulator, or plug in your iPhone and select it (a **free**
   Apple ID lets you install on your own device; the app expires after 7 days
   and you re-run it — fine for testing).

### What to test

- Timer runs, pauses, and completes with sound + notification (lock the phone
  mid-session: the notification must still arrive at the exact end time).
- Switch to another app mid-focus → distraction guard fires on return.
- All three strictness modes, task check-off, stats/streak, ambient sounds.
- Both light and dark system themes.

## 2. Developer accounts (one-time)

| | Google Play | Apple App Store |
|---|---|---|
| Sign up | [play.google.com/console](https://play.google.com/console) | [developer.apple.com](https://developer.apple.com/programs/enroll/) |
| Cost | $25 one-time | $99 / year |
| Review time | hours–2 days | 1–2 days |
| Note | New personal accounts must run a 14-day closed test with 12+ testers before production release | Requires a Mac to upload builds |

## 3. Release to Google Play

1. **Bump the version** for every upload: in `android/app/build.gradle` increase
   `versionCode` (integer) and set `versionName` (e.g. "1.0.1").
2. **Create a signing key** (KEEP IT SAFE — losing it means you can never update
   the app; never commit it to git):
   ```bash
   keytool -genkey -v -keystore ~/focus-pomodoro.keystore \
     -alias focus -keyalg RSA -keysize 2048 -validity 10000
   ```
3. **Build a signed release bundle** in Android Studio:
   *Build → Generate Signed App Bundle* → choose your keystore → `release` →
   produces `android/app/build/outputs/bundle/release/app-release.aab`.
4. In **Play Console**: *Create app* → fill the store listing:
   - Title, short + full description
   - Screenshots (run the app, take phone screenshots; at least 2)
   - 512×512 icon (`assets/icon.png` scaled) and 1024×500 feature graphic
   - Privacy policy URL (see step 0)
   - *App content* questionnaires: Data safety → "No data collected",
     content rating, target audience
5. *Testing → Closed testing* → create a release → upload the `.aab` → add
   tester emails → run the required test period → then *Promote to Production*.

## 4. Release to the App Store (on your Mac)

1. In Xcode select the App target: set *Version* 1.0.0 / *Build* 1 (increment
   Build on every upload).
2. In [App Store Connect](https://appstoreconnect.apple.com): *My Apps → + →
   New App* — pick the bundle ID `com.adamsalaheldin.focuspomodoro`
   (register it first at developer.apple.com → Identifiers if it's not offered).
3. In Xcode: select *Any iOS Device (arm64)* as the destination →
   *Product → Archive* → *Distribute App → App Store Connect → Upload*.
4. (Recommended) **TestFlight**: the uploaded build appears in App Store
   Connect → TestFlight — install it on your own iPhone via the TestFlight app
   and test for a few days.
5. Fill the App Store listing: screenshots (6.7" iPhone required; take them in
   the Simulator with ⌘S), description, keywords, support URL (your site),
   privacy policy URL, and the *App Privacy* questionnaire → "Data Not
   Collected".
6. *Submit for Review*. Common first-app rejection to avoid: broken links in
   the listing — make sure GitHub Pages is live before submitting.

## 5. Updating the app later

```bash
# edit ../pomodoro.html, then:
cd focus-app && npm run sync
```
Bump `versionCode`/`versionName` (Android) and Version/Build (iOS), rebuild,
and upload the new binary to each console.
