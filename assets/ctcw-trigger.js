(function () {
  "use strict";

  var FRAME_ID = "ctcw-frame-11";
  var WIDGET_ID = "11";
  var TRIGGER_SELECTOR = ".js-ctcw-waf2, [data-hz-whatsapp-cta], [data-hz-whatsapp-open]";
  var pendingTab = null;

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

  function closeFormPopup() {
    var backdrop = document.querySelector("[data-hz-whatsapp-backdrop]");
    if (backdrop) backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hz-whatsapp-modal-open");
  }

  function clickFloatingWaf2() {
    var iframe = getFrame();
    pendingTab = window.open("about:blank", "_blank");
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      type: "ctcw:open",
      id: WIDGET_ID,
      sourceUrl: window.location.href
    }, "*");
  }

  function handleClick(event) {
    var trigger = event.target.closest && event.target.closest(TRIGGER_SELECTOR);
    if (!trigger) return;
    event.preventDefault();
    closeFormPopup();
    clickFloatingWaf2();
    window.setTimeout(closeFormPopup, 0);
    window.setTimeout(closeFormPopup, 50);
  }

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "ctcw:destination") return;
    if (String(event.data.id) !== WIDGET_ID) return;
    if (!event.data.url) return;

    if (pendingTab && !pendingTab.closed) {
      pendingTab.location.href = event.data.url;
      try { pendingTab.opener = null; } catch (err) {}
      pendingTab = null;
      return;
    }

    window.open(event.data.url, "_blank");
    pendingTab = null;
  });

  document.addEventListener("click", handleClick, true);
}());
