(function () {
  "use strict";

  var FRAME_ID = "ctcw-frame-11";
  var WIDGET_ID = "11";
  var CTC = {
    widgetId: 11,
    publicKey: "793738b628145012fdfbfc6f2d3a194e3c9fef124c336566",
    resolveUrl: "https://ctc.chatfromforms.com/resolve-widget-destination.php",
    siteName: "PreMarketGuide",
    message: "Hi, I'd like to join the free {site_name} daily market analysis group."
  };

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

  function clickFrameLauncher() {
    var iframe = getFrame();
    if (!iframe || !iframe.contentWindow) return false;

    try {
      iframe.contentWindow.postMessage({
        type: "ctcw:open",
        id: WIDGET_ID,
        sourceUrl: window.location.href
      }, "*");
      return true;
    } catch (err) {
      return false;
    }
  }

  function buildWhatsAppUrl(phone) {
    var text = CTC.message.replace(/\{site_name\}/g, CTC.siteName);
    var digits = String(phone).replace(/\D+/g, "");
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
  }

  function resolveWhatsAppUrl() {
    return fetch(CTC.resolveUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widget_id: CTC.widgetId,
        public_key: CTC.publicKey,
        source_url: window.location.href
      })
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      if (!data || !data.success || !data.full_number) {
        throw new Error((data && data.message) || "Unable to resolve WhatsApp destination");
      }
      return buildWhatsAppUrl(data.full_number);
    });
  }

  function navigatePendingTab(url) {
    if (pendingTab && !pendingTab.closed) {
      pendingTab.location.href = url;
      try { pendingTab.opener = null; } catch (err) {}
      pendingTab = null;
      return;
    }
    window.open(url, "_blank");
    pendingTab = null;
  }

  function openWidget11WhatsApp() {
    pendingTab = window.open("about:blank", "_blank");
    return resolveWhatsAppUrl().then(navigatePendingTab).catch(function () {
      if (pendingTab && !pendingTab.closed) pendingTab.close();
      pendingTab = null;
      clickFrameLauncher();
    });
  }

  function handleSticky(event) {
    var trigger = event.target.closest && event.target.closest("[data-ctcw-trigger]");
    if (!trigger) return;
    openWidget11WhatsApp();
  }

  document.addEventListener("click", handleSticky);
}());
