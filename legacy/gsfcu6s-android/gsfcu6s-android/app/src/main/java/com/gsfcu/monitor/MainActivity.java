package com.gsfcu.monitor;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private View loadingView;
    private View errorView;

    // File upload
    private ValueCallback<Uri[]> fileUploadCallback;
    private Uri cameraImageUri;
    private static final int REQUEST_SELECT_FILE = 100;
    private static final int REQUEST_CAMERA = 101;
    private static final int PERMISSION_REQUEST_CODE = 200;

    @SuppressLint({"SetJavaScriptEnabled", "WrongViewCast"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar color matching maroon brand
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(Color.parseColor("#4D0D19"));

        setContentView(R.layout.activity_main);

        webView    = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        loadingView  = findViewById(R.id.loadingView);
        errorView    = findViewById(R.id.errorView);

        setupWebView();
        setupSwipeRefresh();

        // Request permissions
        requestPermissions();

        // Load app
        loadApp();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Core
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

        // File access
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        }

        // Display
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setTextZoom(100);

        // Media
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // User agent — identify as Android app
        settings.setUserAgentString(
            settings.getUserAgentString() + " GSFCU6SMonitor/1.0 Android"
        );

        // JavaScript bridge
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidApp");

        // WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                showLoading(true);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                showLoading(false);
                swipeRefresh.setRefreshing(false);
                errorView.setVisibility(View.GONE);

                // Inject mobile CSS overrides
                injectMobileCSS();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request,
                                        WebResourceError error) {
                if (request.isForMainFrame()) {
                    showLoading(false);
                    swipeRefresh.setRefreshing(false);
                    errorView.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Keep internal navigation in WebView
                if (url.startsWith("file://") || url.startsWith("about:")) {
                    return false;
                }
                // Open external links in browser
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(browserIntent);
                    return true;
                }
                return false;
            }
        });

        // WebChromeClient — handles file uploads, camera, JS dialogs
        webView.setWebChromeClient(new WebChromeClient() {

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;
                showFileChooserDialog();
                return true;
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                                                           GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                // Suppress console noise in production
                return true;
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message,
                                     android.webkit.JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("GSFCU 6S Monitor")
                    .setMessage(message)
                    .setPositiveButton("OK", (d, w) -> result.confirm())
                    .setCancelable(false)
                    .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message,
                                       android.webkit.JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Confirm")
                    .setMessage(message)
                    .setPositiveButton("Yes", (d, w) -> result.confirm())
                    .setNegativeButton("No", (d, w) -> result.cancel())
                    .setCancelable(false)
                    .show();
                return true;
            }
        });

        webView.setBackgroundColor(Color.parseColor("#FBF7F2"));
    }

    private void setupSwipeRefresh() {
        swipeRefresh.setColorSchemeColors(
            Color.parseColor("#8C1B2F"),
            Color.parseColor("#C4933F")
        );
        swipeRefresh.setProgressBackgroundColorSchemeColor(Color.WHITE);
        swipeRefresh.setOnRefreshListener(() -> webView.reload());
    }

    private void loadApp() {
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void showLoading(boolean show) {
        loadingView.setVisibility(show ? View.VISIBLE : View.GONE);
        webView.setVisibility(show ? View.INVISIBLE : View.VISIBLE);
    }

    /** Inject CSS to make the web app feel native on mobile */
    private void injectMobileCSS() {
        String css =
            // Remove desktop sidebar, use bottom nav on mobile
            ".sidebar { display: none !important; }" +
            ".app-layout { flex-direction: column !important; }" +
            ".main-area { width: 100% !important; }" +
            // Ensure no horizontal overflow
            "body { overflow-x: hidden !important; }" +
            // Make login single column
            ".login-left { display: none !important; }" +
            ".login-outer { width: 100% !important; border-radius: 0 !important; max-width:100% !important; min-height:100vh !important; }" +
            ".login-right { padding: 48px 24px !important; }" +
            // Collapse grids to single column
            ".grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }" +
            // Comfortable page padding
            ".pg { padding: 16px !important; }" +
            // Make top-bar shorter
            ".top-bar { padding: 0 16px !important; height: 52px !important; }" +
            // Bottom nav bar
            "#mobileNav { display: flex !important; }" +
            // Touch-friendly tap targets
            ".btn-p, .btn-login, .btn-gold, .btn-logout { min-height: 48px !important; font-size: 16px !important; }" +
            ".cl-item { min-height: 52px !important; }" +
            ".tbl td, .tbl th { padding: 12px 10px !important; font-size: 12px !important; }" +
            // Toast position for mobile
            ".toast { bottom: 80px !important; right: 16px !important; left: 16px !important; max-width: none !important; text-align: center !important; }";

        String js = "var style = document.createElement('style');" +
                    "style.innerHTML = '" + css.replace("'", "\\'") + "';" +
                    "document.head.appendChild(style);" +
                    // Also inject mobile bottom navigation
                    injectMobileNavJS();

        webView.evaluateJavascript("(function(){" + js + "})()", null);
    }

    private String injectMobileNavJS() {
        return
        // Create bottom nav if not exists
        "if (!document.getElementById('mobileNav')) {" +
        "  var nav = document.createElement('div');" +
        "  nav.id = 'mobileNav';" +
        "  nav.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:64px;" +
        "    background:#4D0D19;display:none;align-items:center;justify-content:space-around;" +
        "    z-index:1000;border-top:1px solid rgba(196,147,63,0.3);padding-bottom:4px;';" +
        "  document.body.appendChild(nav);" +
        "  document.body.style.paddingBottom = '64px';" +
        "}" +

        // Show nav when not on login screen
        "(function checkNav() {" +
        "  var loginActive = document.getElementById('loginScreen') && " +
        "    document.getElementById('loginScreen').classList.contains('active');" +
        "  var nav = document.getElementById('mobileNav');" +
        "  if (nav) nav.style.display = loginActive ? 'none' : 'flex';" +
        "  setTimeout(checkNav, 500);" +
        "})();";
    }

    // ── File Chooser ──────────────────────────────────────────────────────────

    private void showFileChooserDialog() {
        String[] options = {"Take Photo with Camera", "Choose from Gallery"};
        new AlertDialog.Builder(this)
            .setTitle("Attach Photo")
            .setItems(options, (dialog, which) -> {
                if (which == 0) openCamera();
                else openGallery();
            })
            .setNegativeButton("Cancel", (d, w) -> {
                if (fileUploadCallback != null) fileUploadCallback.onReceiveValue(null);
                fileUploadCallback = null;
            })
            .show();
    }

    private void openCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.CAMERA}, PERMISSION_REQUEST_CODE);
            return;
        }
        Intent takePicture = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePicture.resolveActivity(getPackageManager()) != null) {
            File photoFile = createImageFile();
            if (photoFile != null) {
                cameraImageUri = FileProvider.getUriForFile(this,
                    getApplicationContext().getPackageName() + ".fileprovider", photoFile);
                takePicture.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
                startActivityForResult(takePicture, REQUEST_CAMERA);
            }
        }
    }

    private void openGallery() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        startActivityForResult(Intent.createChooser(intent, "Select Image"), REQUEST_SELECT_FILE);
    }

    private File createImageFile() {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
            .format(new Date());
        String imageFileName = "GSFCU_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        try {
            return File.createTempFile(imageFileName, ".jpg", storageDir);
        } catch (IOException e) {
            return null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (fileUploadCallback == null) return;

        Uri[] results = null;

        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == REQUEST_CAMERA && cameraImageUri != null) {
                results = new Uri[]{cameraImageUri};
            } else if (requestCode == REQUEST_SELECT_FILE && data != null) {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
            }
        }

        fileUploadCallback.onReceiveValue(results);
        fileUploadCallback = null;
    }

    // ── Permissions ───────────────────────────────────────────────────────────

    private void requestPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                Manifest.permission.CAMERA,
                Manifest.permission.READ_MEDIA_IMAGES
            };
        } else {
            permissions = new String[]{
                Manifest.permission.CAMERA,
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            };
        }

        boolean allGranted = true;
        for (String p : permissions) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }
        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        // Permissions handled silently — features degrade gracefully
    }

    // ── Back navigation ───────────────────────────────────────────────────────

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            // First try JS back (app screen navigation)
            webView.evaluateJavascript(
                "(function(){ " +
                "  var screens = document.querySelectorAll('.screen.active');" +
                "  var loginActive = document.getElementById('loginScreen')?.classList.contains('active');" +
                "  return loginActive ? 'login' : 'app';" +
                "})()",
                value -> {
                    if ("\"login\"".equals(value)) {
                        // On login screen — show exit dialog
                        runOnUiThread(this::showExitDialog);
                    } else {
                        // Trigger logout / back in app
                        webView.evaluateJavascript("if(typeof logout==='function'){logout();}", null);
                    }
                }
            );
        } else {
            showExitDialog();
        }
    }

    private void showExitDialog() {
        new AlertDialog.Builder(this)
            .setTitle("Exit App")
            .setMessage("Are you sure you want to exit GSFCU 6S Monitor?")
            .setPositiveButton("Exit", (d, w) -> finish())
            .setNegativeButton("Stay", null)
            .show();
    }

    // ── JavaScript Bridge ─────────────────────────────────────────────────────

    public class AndroidBridge {

        @JavascriptInterface
        public void showNativeToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public String getDeviceInfo() {
            return "Android " + Build.VERSION.RELEASE + " | " + Build.MODEL;
        }

        @JavascriptInterface
        public boolean isOnline() {
            ConnectivityManager cm = (ConnectivityManager)
                getSystemService(CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            NetworkInfo ni = cm.getActiveNetworkInfo();
            return ni != null && ni.isConnected();
        }

        @JavascriptInterface
        public void openCamera() {
            runOnUiThread(() -> MainActivity.this.openCamera());
        }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
    }
}
