package com.mathbrain.game;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Debug;
import android.os.Build;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.content.SharedPreferences;
import android.view.WindowManager;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;

public class MainActivity extends Activity {
    private WebView webView;
    private SharedPreferences prefs;
    // v1.0.2：系统级分屏探测缓存（反射查询较慢，500ms 内复用结果）
    private long lastOtherSplitCheck = 0L;
    private boolean lastOtherSplit = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 保持屏幕常亮，避免答题中途锁屏
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        prefs = getSharedPreferences("mathbrain", MODE_PRIVATE);

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        // 支持大数显示
        settings.setTextZoom(100);
        webView.setWebViewClient(new WebViewClient());

        // 原生存储桥接：跨会话记住历史关卡（file:// 下 localStorage 不可靠）
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public String getHistory(String key) {
                return prefs.getString(key, "[]");
            }
            @JavascriptInterface
            public void setHistory(String key, String value) {
                prefs.edit().putString(key, value).apply();
            }
        }, "AndroidStore");

        // v1.0.0 防外挂桥接：离开时长 / 分屏 / 调试器 / 后台扣血速率
        webView.addJavascriptInterface(new Object() {
            // 记录"进入后台/离开"时刻（onPause 与 JS pagehide 都会调用）
            @JavascriptInterface
            public void markHidden() {
                prefs.edit().putLong("guard.hiddenAt", System.currentTimeMillis()).apply();
            }
            // 消费离开时长（毫秒）并清零，避免重复补扣
            @JavascriptInterface
            public long consumeAway() {
                long h = prefs.getLong("guard.hiddenAt", 0L);
                if (h <= 0L) return 0L;
                prefs.edit().putLong("guard.hiddenAt", 0L).apply();
                long d = System.currentTimeMillis() - h;
                return d > 0L ? d : 0L;
            }
            @JavascriptInterface
            public void clearAway() {
                prefs.edit().putLong("guard.hiddenAt", 0L).apply();
            }
            // 游戏运行中持续上报：模式 + 每秒基础扣血速率；供进程被杀后重启补扣
            @JavascriptInterface
            public void heartbeat(String mode, double rate) {
                prefs.edit()
                    .putString("guard.mode", mode)
                    .putFloat("guard.rate", (float) rate)
                    .putBoolean("guard.active", true)
                    .apply();
            }
            @JavascriptInterface
            public void clearActive() {
                prefs.edit().putBoolean("guard.active", false).apply();
            }
            @JavascriptInterface
            public String escapeState() {
                return "{\"active\":" + prefs.getBoolean("guard.active", false)
                    + ",\"mode\":\"" + prefs.getString("guard.mode", "")
                    + "\",\"rate\":" + prefs.getFloat("guard.rate", 0f) + "}";
            }
            // 分屏 / 多窗口检测（API 24+）
            // v1.0.2：本应用分屏 OR 系统里任意任务处于分屏/自由窗/PiP → 4 倍扣血
            @JavascriptInterface
            public boolean isSplit() {
                if (Build.VERSION.SDK_INT >= 24 && isInMultiWindowMode()) return true;
                long now = System.currentTimeMillis();
                if (now - lastOtherSplitCheck < 500L) return lastOtherSplit;
                lastOtherSplitCheck = now;
                lastOtherSplit = otherAppSplit();
                return lastOtherSplit;
            }
            // JDWP 调试器连接检测（内置脚本/逆向常用）
            @JavascriptInterface
            public boolean isDebugger() {
                return Debug.isDebuggerConnected();
            }
            @JavascriptInterface
            public String version() {
                return "1.1.2";
            }
        }, "AndroidGuard");

        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    // v1.0.2：尽力探测系统里是否存在其它分屏任务。
    // 优先读 ActivityTaskManager 的窗口栈 windowingMode；非 SDK 接口受限时静默降级。
    @SuppressLint("BlockedPrivateApi")
    private boolean otherAppSplit() {
        try {
            Class<?> atmCls = Class.forName("android.app.ActivityTaskManager");
            Method getService = atmCls.getDeclaredMethod("getService");
            getService.setAccessible(true);
            Object atm = getService.invoke(null);
            Method getStackInfos = null;
            try { getStackInfos = atm.getClass().getDeclaredMethod("getStackInfos"); }
            catch (Throwable t1) {
                try { getStackInfos = atm.getClass().getMethod("getStackInfos"); } catch (Throwable t2) {}
            }
            if (getStackInfos == null) return false;
            getStackInfos.setAccessible(true);
            Object result = getStackInfos.invoke(atm);
            if (result instanceof Collection) {
                for (Object info : (Collection<?>) result) {
                    int mode = windowingModeOf(info);
                    if (mode >= 2 && mode <= 5) return true;   // PINNED/SPLIT_PRIMARY/SPLIT_SECONDARY/FREEFORM
                }
            } else if (result != null) {
                int mode = windowingModeOf(result);
                if (mode >= 2 && mode <= 5) return true;
            }
        } catch (Throwable ignored) {}
        return false;
    }
    private int windowingModeOf(Object info) {
        try {
            Method m = info.getClass().getMethod("getWindowingMode");
            Object v = m.invoke(info);
            if (v instanceof Integer) return (Integer) v;
        } catch (Throwable ignored) {}
        try {
            Field f = info.getClass().getField("windowingMode");
            Object v = f.get(info);
            if (v instanceof Integer) return (Integer) v;
        } catch (Throwable ignored) {}
        return 0;
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Activity 失焦（切后台/分屏/锁屏）：打时间戳，JS 回来按离开时长 4 倍补扣
        if (prefs != null) {
            prefs.edit().putLong("guard.hiddenAt", System.currentTimeMillis()).apply();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // 通知页面消费离开时长；若页面尚未加载完毕，JS 初始化时也会主动拿一次
        if (webView != null) {
            webView.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        webView.evaluateJavascript(
                            "try{window.__guardOnResume&&window.__guardOnResume();}catch(e){}", null);
                    } catch (Exception ignored) {}
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        // 游戏内禁用系统返回键误触退出
    }
}
