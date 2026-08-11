/**
 * Paste this into the CTC widget Head or Body custom code field.
 * Replace any previous ctcw:open listener with this version.
 */
(function () {
  "use strict";

  var FLOATING_BTN_ID = "m-floating-btn";
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
    var button = document.querySelector("[data-widget-button]");
    if (button) button.id = FLOATING_BTN_ID;
    return button;
  }

  function openLauncher() {
    var button = tagFloatingButton();
    if (!button) return false;

    button.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));

    return true;
  }

  function handleOpenMessage(event) {
    if (!event || !event.data || event.data.type !== "ctcw:open") return;
    if (String(event.data.id) !== String(window.CTCW_WIDGET_ID || "10")) return;
    if (!isTrustedOrigin(event.origin)) return;

    if (!openLauncher()) {
      document.addEventListener("DOMContentLoaded", openLauncher, { once: true });
      window.addEventListener("load", openLauncher, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tagFloatingButton);
  } else {
    tagFloatingButton();
  }

  window.addEventListener("message", handleOpenMessage);
}());
