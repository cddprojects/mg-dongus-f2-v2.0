/**
 * Paste this into widget 11 Head or Body custom code only.
 * Do not paste this into widget 10 — that widget must keep id "10".
 * Origin is not enough: both widgets trust premarketguide.com.
 */
(function () {
  "use strict";

  var THIS_WIDGET_ID = "11";
  var FLOATING_BTN_ID = "waf2";
  var MAX_TRIES = 20;
  var TRUSTED_ORIGINS = [
    "https://www.premarketguide.com",
    "https://premarketguide.com",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
  ];

  function isTrustedOrigin(origin) {
    if (!origin || origin === "null") return true;
    if (TRUSTED_ORIGINS.indexOf(origin) !== -1) return true;
    if (/^https:\/\/([a-z0-9-]+\.)?premarketguide\.com$/i.test(origin)) return true;
    return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);
  }

  function tagFloatingButton() {
    var button = document.querySelector("[data-widget-button]")
      || document.querySelector(".ctcw-cta-button");
    if (!button) return false;
    button.id = FLOATING_BTN_ID;
    return button;
  }

  function tryTag(attempt) {
    if (tagFloatingButton()) return;
    if (attempt >= MAX_TRIES) return;
    window.setTimeout(function () { tryTag(attempt + 1); }, 100);
  }

  function openLauncher() {
    var button = tagFloatingButton();
    if (!button) return false;
    button.click();
    return true;
  }

  function handleOpenMessage(event) {
    if (!event || !event.data || event.data.type !== "ctcw:open") return;
    if (String(event.data.id) !== THIS_WIDGET_ID) return;
    if (!isTrustedOrigin(event.origin)) return;

    if (!openLauncher()) {
      document.addEventListener("DOMContentLoaded", openLauncher, { once: true });
      window.addEventListener("load", openLauncher, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { tryTag(0); });
  } else {
    tryTag(0);
  }

  window.addEventListener("message", handleOpenMessage);
}());
