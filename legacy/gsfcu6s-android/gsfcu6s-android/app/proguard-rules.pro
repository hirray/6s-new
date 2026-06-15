# GSFCU 6S Monitor ProGuard Rules

# Keep WebView JavaScript interface
-keepclassmembers class com.gsfcu.monitor.MainActivity$AndroidBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all activities
-keep class com.gsfcu.monitor.** { *; }

# AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**

# Material Components
-keep class com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# General Android
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
