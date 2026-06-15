# GSFCU 6S Monitor — Android App

**Package:** `com.gsfcu.monitor`  
**Min SDK:** Android 5.0 (API 21)  
**Target SDK:** Android 14 (API 34)  
**Version:** 1.0.0

---

## 📱 What's Included

This is a complete Android Studio project that wraps the GSFCU 6S Monitor web app into a native Android application.

### Features
- ✅ **Branded splash screen** — Maroon & gold GSFCU theme
- ✅ **Full WebView** with JavaScript enabled
- ✅ **Camera integration** — take photos for complaints
- ✅ **Gallery picker** — attach existing photos
- ✅ **Mobile bottom navigation bar** — replaces desktop sidebar
- ✅ **Mobile-responsive CSS** — auto-injected on load
- ✅ **Pull-to-refresh** gesture support
- ✅ **Back button handling** — logout or exit dialog
- ✅ **Offline asset loading** — HTML/CSS/JS bundled in APK
- ✅ **Status bar** styled in GSFCU maroon
- ✅ **Touch-optimized** tap targets (48dp minimum)
- ✅ **Zone map tap mode** — tap zones instead of hover
- ✅ **Scrollable tables** — horizontal scroll on narrow screens

---

## 🏗️ Project Structure

```
gsfcu6s-android/
├── build.gradle                        # Root build config
├── settings.gradle
├── gradle.properties
└── app/
    ├── build.gradle                    # App dependencies
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── assets/
        │   └── index.html              ← Your 6S web app (mobile-optimized)
        ├── java/com/gsfcu/monitor/
        │   ├── SplashActivity.java     ← Branded splash screen
        │   └── MainActivity.java       ← WebView + camera + bridge
        └── res/
            ├── layout/
            │   ├── activity_splash.xml
            │   └── activity_main.xml
            ├── values/
            │   ├── colors.xml          ← GSFCU brand colors
            │   ├── strings.xml
            │   └── themes.xml
            ├── drawable/
            │   ├── splash_icon_bg.xml
            │   ├── ic_launcher_foreground.xml
            │   └── ic_launcher_background.xml
            ├── mipmap-*/               ← App icon (all densities)
            └── xml/
                ├── network_security_config.xml
                └── file_paths.xml
```

---

## 🔨 How to Build

### Option A — Android Studio (Recommended)

1. **Install Android Studio** from https://developer.android.com/studio
2. **Open the project** → File → Open → select the `gsfcu6s-android/` folder
3. **Sync Gradle** — click "Sync Now" when prompted
4. **Run on device** → plug in Android phone (USB debugging on) → click ▶ Run
5. **Build APK** → Build → Build Bundle(s)/APK(s) → Build APK(s)
   - APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

### Option B — Command Line

```bash
# Ensure Java 17 and Android SDK are installed
export ANDROID_HOME=/path/to/android-sdk

cd gsfcu6s-android
chmod +x gradlew
./gradlew assembleDebug

# APK location:
# app/build/outputs/apk/debug/app-debug.apk
```

### Option C — Install on Device via ADB

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 Installing on Android Phone (without building)

If you want to quickly test without building:

1. Copy `app/src/main/assets/index.html` to your phone
2. Open it in **Chrome for Android** — it works as a standalone web app
3. Use Chrome → Menu → "Add to Home Screen" for a home screen shortcut

---

## 🎨 Customization

### Update the web app
Replace `app/src/main/assets/index.html` with any updated version.  
The mobile CSS overrides are injected automatically at runtime.

### Change app name
Edit `app/src/main/res/values/strings.xml` → `app_name`

### Change colors
Edit `app/src/main/res/values/colors.xml`

### Add a real logo image
Place `gsfcu_logo.png` in `app/src/main/res/drawable/`  
Then update `activity_splash.xml` to use `@drawable/gsfcu_logo`

---

## 📋 Login Credentials (Demo)

| Level | Role | Login ID | Password |
|-------|------|----------|----------|
| 1 | Student | STU001 | 1234 |
| 2 | Sub-Zonal Head | SZH_F1 … SZH_F8 | 1234 |
| 3 | Zonal Head | ZH_Z1 … ZH_Z8 | 1234 |
| 4 | Core Committee | ADMIN_CHAIR, ADMIN_PROVOST, ADMIN_DEAN, ADMIN_CONV | 1234 |

---

## 🔒 Permissions Used

| Permission | Reason |
|-----------|--------|
| `INTERNET` | Load Google Fonts & FontAwesome CDN |
| `CAMERA` | Photo capture for complaints |
| `READ_MEDIA_IMAGES` | Gallery access (Android 13+) |
| `READ_EXTERNAL_STORAGE` | Gallery access (Android 12 and below) |
| `ACCESS_NETWORK_STATE` | Check connectivity |

---

## 🚀 Publishing to Play Store

1. Generate a signed APK: Build → Generate Signed Bundle/APK
2. Create a keystore file when prompted
3. Upload the AAB/APK to Google Play Console
4. Fill in store listing details
5. Submit for review

---

*GSFC University — Education Re-Envisioned*  
*6S Monitor v1.0 — Campus Compliance Management System*
