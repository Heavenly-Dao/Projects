// script.js
document.addEventListener("DOMContentLoaded", function() {
    const backBtn = document.getElementById("backBtn");
    const forwardBtn = document.getElementById("forwardBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const homeBtn = document.getElementById("homeBtn");
    const urlInput = document.getElementById("urlInput");
    const goBtn = document.getElementById("goBtn");
    const webView = document.getElementById("webView");

    backBtn.addEventListener("click", function() {
        webView.contentWindow.history.back();
    });

    forwardBtn.addEventListener("click", function() {
        webView.contentWindow.history.forward();
    });

    refreshBtn.addEventListener("click", function() {
        webView.contentWindow.location.reload();
    });

    homeBtn.addEventListener("click", function() {
        webView.src = "https://www.example.com";
    });

    goBtn.addEventListener("click", function() {
        const url = urlInput.value.trim();
        if (url !== "") {
            webView.src = url;
        }
    });

    urlInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            goBtn.click();
        }
    });
});
