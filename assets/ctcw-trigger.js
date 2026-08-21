(function () {
  "use strict";

  var FRAME_ID = "ctcw-frame-11";
  var WIDGET_ID = "11";
  var MOBILE_QUERY = "(max-width: 900px)";
  var ICON_SIZE = 68;

  var savedFrameStyle = null;
  var covering = false;

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

  function hideForeignWidgets() {
    var frames = document.querySelectorAll('iframe[id^="ctcw-frame-"]');
    for (var i = 0; i < frames.length; i++) {
      if (frameBelongsToThisWidget(frames[i])) continue;
      frames[i].setAttribute("hidden", "");
      frames[i].style.setProperty("display", "none", "important");
      frames[i].style.setProperty("visibility", "hidden", "important");
      frames[i].style.setProperty("pointer-events", "none", "important");
    }
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

  function restoreFrame(iframe) {
    if (!iframe || savedFrameStyle === null) return;
    iframe.setAttribute("style", savedFrameStyle);
    covering = false;
  }

  function coverStickyWithFloatingButton() {
    var iframe = getFrame();
    var button = getStickyButton();
    if (!iframe || !button || !isStickyVisible()) {
      if (iframe && covering) restoreFrame(iframe);
      return;
    }

    if (!covering) {
      savedFrameStyle = iframe.getAttribute("style") || "";
      covering = true;
    }

    var rect = button.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;

    var scaleX = rect.width / ICON_SIZE;
    var scaleY = rect.height / ICON_SIZE;

    iframe.style.setProperty("position", "fixed", "important");
    iframe.style.setProperty("right", "auto", "important");
    iframe.style.setProperty("bottom", "auto", "important");
    iframe.style.setProperty("left", rect.left + "px", "important");
    iframe.style.setProperty("top", rect.top + "px", "important");
    iframe.style.setProperty("width", ICON_SIZE + "px", "important");
    iframe.style.setProperty("height", ICON_SIZE + "px", "important");
    iframe.style.setProperty("max-width", "none", "important");
    iframe.style.setProperty("max-height", "none", "important");
    iframe.style.setProperty("transform", "scale(" + scaleX + ", " + scaleY + ")", "important");
    iframe.style.setProperty("transform-origin", "top left", "important");
    iframe.style.setProperty("opacity", "0.01", "important");
    iframe.style.setProperty("z-index", "2147483646", "important");
    iframe.style.setProperty("pointer-events", "auto", "important");
    iframe.style.setProperty("display", "block", "important");
    iframe.style.setProperty("visibility", "visible", "important");
    iframe.removeAttribute("hidden");

    button.style.pointerEvents = "none";
  }

  function sync() {
    hideForeignWidgets();
    coverStickyWithFloatingButton();
  }

  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", sync);
  window.addEventListener("scroll", sync, true);

  sync();
  window.setInterval(sync, 250);
}());
