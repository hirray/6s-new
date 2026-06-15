package com.gsfcu.monitor;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.ScaleAnimation;
import android.view.animation.AnimationSet;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

@SuppressLint("CustomSplashScreen")
public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_DURATION = 2600;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Full screen
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );

        setContentView(R.layout.activity_splash);

        // Animate logo and text
        LinearLayout logoContainer = findViewById(R.id.logoContainer);
        TextView tagline = findViewById(R.id.tagline);

        AnimationSet logoAnim = new AnimationSet(true);
        AlphaAnimation fadeIn = new AlphaAnimation(0f, 1f);
        fadeIn.setDuration(800);
        ScaleAnimation scaleUp = new ScaleAnimation(0.75f, 1f, 0.75f, 1f,
            Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
        scaleUp.setDuration(800);
        logoAnim.addAnimation(fadeIn);
        logoAnim.addAnimation(scaleUp);
        logoAnim.setFillAfter(true);
        logoContainer.startAnimation(logoAnim);

        AlphaAnimation tagAnim = new AlphaAnimation(0f, 1f);
        tagAnim.setDuration(600);
        tagAnim.setStartOffset(600);
        tagAnim.setFillAfter(true);
        tagline.startAnimation(tagAnim);

        // Navigate to MainActivity
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent intent = new Intent(SplashActivity.this, MainActivity.class);
            startActivity(intent);
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            finish();
        }, SPLASH_DURATION);
    }
}
