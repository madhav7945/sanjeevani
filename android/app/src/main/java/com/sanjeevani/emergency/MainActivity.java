package com.sanjeevani.emergency;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private static final String USB_LOCAL_URL = "http://localhost:3000";
    private static final String WIFI_LAN_URL = "http://192.168.100.242:3000";
    private static final int PERMISSION_REQ_CODE = 101;

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout errorLayout;
    private TextView errorText;
    private Button retryButton;

    private String currentTargetUrl = USB_LOCAL_URL;
    private boolean triedFallback = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        errorLayout = findViewById(R.id.errorLayout);
        errorText = findViewById(R.id.errorText);
        retryButton = findViewById(R.id.retryButton);

        requestAppPermissions();
        setupWebView();

        swipeRefresh.setOnRefreshListener(() -> {
            errorLayout.setVisibility(View.GONE);
            webView.reload();
        });

        retryButton.setOnClickListener(v -> {
            errorLayout.setVisibility(View.GONE);
            triedFallback = false;
            currentTargetUrl = USB_LOCAL_URL;
            loadAppUrl(currentTargetUrl);
        });

        if (getIntent() != null && getIntent().getData() != null) {
            currentTargetUrl = getIntent().getData().toString();
        }

        loadAppUrl(currentTargetUrl);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getData() != null) {
            currentTargetUrl = intent.getData().toString();
            loadAppUrl(currentTargetUrl);
        }
    }

    private void requestAppPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    },
                    PERMISSION_REQ_CODE);
        }
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    Uri uri = request.getUrl();
                    return handleExternalUri(uri);
                }
                return false;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                return handleExternalUri(uri);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                errorLayout.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && request.isForMainFrame()) {
                    handleConnectionFailure();
                }
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                handleConnectionFailure();
            }
        });
    }

    private boolean handleExternalUri(Uri uri) {
        String scheme = uri.getScheme();
        if (scheme == null) return false;

        // Native SMS integration: opens default Android messaging app with distress message
        if (scheme.equalsIgnoreCase("sms") || scheme.equalsIgnoreCase("smsto")) {
            try {
                Intent smsIntent = new Intent(Intent.ACTION_SENDTO, uri);
                startActivity(smsIntent);
                return true;
            } catch (Exception e) {
                Toast.makeText(this, "SMS App not found: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                return true;
            }
        }

        // Phone call integration
        if (scheme.equalsIgnoreCase("tel")) {
            try {
                Intent dialIntent = new Intent(Intent.ACTION_DIAL, uri);
                startActivity(dialIntent);
                return true;
            } catch (Exception e) {
                return true;
            }
        }

        // Keep local application navigation inside the webview
        String host = uri.getHost();
        if (host != null && (host.equals("localhost") || host.equals("127.0.0.1") || host.startsWith("192.168."))) {
            return false;
        }

        // Open external links in external browser
        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(browserIntent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void handleConnectionFailure() {
        if (!triedFallback) {
            triedFallback = true;
            currentTargetUrl = WIFI_LAN_URL;
            webView.post(() -> loadAppUrl(currentTargetUrl));
        } else {
            swipeRefresh.setRefreshing(false);
            progressBar.setVisibility(View.GONE);
            errorLayout.setVisibility(View.VISIBLE);

            // Auto-heal: periodically retry USB tunnel connection so app recovers seamlessly
            webView.postDelayed(() -> {
                if (errorLayout.getVisibility() == View.VISIBLE) {
                    errorLayout.setVisibility(View.GONE);
                    triedFallback = false;
                    currentTargetUrl = USB_LOCAL_URL;
                    loadAppUrl(currentTargetUrl);
                }
            }, 3000);
        }
    }

    private void loadAppUrl(String url) {
        webView.loadUrl(url);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
