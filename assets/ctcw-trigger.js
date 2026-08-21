(function () {
  "use strict";

  var FRAME_ID = "ctcw-frame-11";
  var WIDGET_ID = "11";
  var TRIGGER_CLASS = "js-ctcw-waf2";

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

  function clickFloatingWaf2() {
    var iframe = getFrame();
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      type: "ctcw:open",
      id: WIDGET_ID,
      sourceUrl: window.location.href
    }, "*");
  }

  function handleClick(event) {
    var trigger = event.target.closest && event.target.closest(
      "." + TRIGGER_CLASS + ", [data-hz-whatsapp-cta], [data-hz-whatsapp-open]"
    );
    if (!trigger) return;
    event.preventDefault();
    clickFloatingWaf2();
  }

  document.addEventListener("click", handleClick);
}());
