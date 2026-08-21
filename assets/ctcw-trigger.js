(function () {
  "use strict";

  var FRAME_ID = "ctcw-frame-11";
  var WIDGET_ID = "11";
  var MOBILE_QUERY = "(max-width: 900px)";
  var ICON_SIZE = 72;

  var wrap = null;
  var savedParent = null;
  var savedNext = null;

  function frameBelongsToThisWidget(iframe) {
    if (!iframe) return false;
    if (iframe.id === FRAME_ID) return true;

    var src = iframe.getAttribute("src") || "";
    try {
      return new URL(src, window.location.href).searchParams.get("id") === WIDGET_ID;
    } catch (err) {
      return new RegExp("[?&]id=" + WIDGET_ID + "(?:&|$)").test(src);
    }
  }

  function getFrame() {
    var byId = document.getElementById(FRAME_ID);
    if (frameBelongsToThisWidget(byId)) return byId;

    var frames = document.querySelectorAll('iframe[id^="ctcw-frame-"], iframe[src*="ctc.chatfromforms.com"]');
    for (var i = 0; i < frames.length; i++) {
      if (frameBelongsToThisWidget(frames[i])) return frames[i];
    }
    return null;
  }

  function getStickyButton() {
    return document.querySelector("#sticky-cta [data-ctcw-trigger], #sticky-cta .btn-primary");
  }

  function isStickyVisible() {
    var sticky = document.getElementById("sticky-cta");
    if (!sticky) return false;
    if (!window.matchMedia(MOBILE_QUERY).matches) return false;
    return window.getComputedStyle(sticky).display !== "none";
  }

  function ensureWrap() {
    if (wrap && document.body.contains(wrap)) return wrap;
    wrap = document.createElement("div");
    wrap.id = "ctcw-sticky-hitbox";
    wrap.setAttribute("aria-hidden", "true");
    document.body.appendChild(wrap);
    return wrap;
  }

  function parkFrame(iframe) {
    if (!iframe || !wrap || iframe.parentNode !== wrap) return;
    if (savedParent) {
      if (savedNext && savedNext.parentNode === savedParent) {
        savedParent.insertBefore(iframe, savedNext);
      } else {
        savedParent.appendChild(iframe);
      }
    } else {
      document.body.appendChild(iframe);
    }
    iframe.style.position = "";
    iframe.style.left = "";
    iframe.style.top = "";
    iframe.style.right = "";
    iframe.style.bottom = "";
    iframe.style.width = "";
    iframe.style.height = "";
    iframe.style.zoom = "";
    iframe.style.transform = "";
    iframe.style.opacity = "";
    iframe.style.pointerEvents = "";
    iframe.style.maxWidth = "";
    iframe.style.maxHeight = "";
    savedParent = null;
    savedNext = null;
  }

  function coverSticky() {
    var iframe = getFrame();
    var button = getStickyButton();
    var host = ensureWrap();

    if (!iframe || !button || !isStickyVisible()) {
      parkFrame(iframe);
      host.style.display = "none";
      if (button) button.style.pointerEvents = "";
      return;
    }

    var rect = button.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;

    if (iframe.parentNode !== host) {
      savedParent = iframe.parentNode;
      savedNext = iframe.nextSibling;
      host.appendChild(iframe);
    }

    host.style.cssText = [
      "position:fixed",
      "left:" + rect.left + "px",
      "top:" + rect.top + "px",
      "width:" + rect.width + "px",
      "height:" + rect.height + "px",
      "overflow:hidden",
      "z-index:2147483647",
      "pointer-events:auto"
    ].join(";");

    var zoom = rect.width / ICON_SIZE;
    iframe.style.setProperty("position", "absolute", "important");
    iframe.style.setProperty("left", "0", "important");
    iframe.style.setProperty("top", "0", "important");
    iframe.style.setProperty("right", "auto", "important");
    iframe.style.setProperty("bottom", "auto", "important");
    iframe.style.setProperty("width", ICON_SIZE + "px", "important");
    iframe.style.setProperty("height", ICON_SIZE + "px", "important");
    iframe.style.setProperty("max-width", "none", "important");
    iframe.style.setProperty("max-height", "none", "important");
    iframe.style.setProperty("border", "0", "important");
    iframe.style.setProperty("opacity", "0.01", "important");
    iframe.style.setProperty("pointer-events", "auto", "important");
    iframe.style.setProperty("zoom", String(zoom), "important");
    iframe.style.setProperty("transform", "scale(" + zoom + ", " + (rect.height / ICON_SIZE) + ")", "important");
    iframe.style.setProperty("transform-origin", "top left", "important");
    iframe.removeAttribute("hidden");

    button.style.pointerEvents = "none";
  }

  function loop() {
    coverSticky();
    window.requestAnimationFrame(loop);
  }

  window.addEventListener("resize", coverSticky);
  window.addEventListener("orientationchange", coverSticky);
  window.addEventListener("scroll", coverSticky, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      coverSticky();
      window.requestAnimationFrame(loop);
    });
  } else {
    coverSticky();
    window.requestAnimationFrame(loop);
  }
}());
