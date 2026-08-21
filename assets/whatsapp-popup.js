(function () {
  "use strict";

  document.querySelectorAll("[data-hz-whatsapp-cta], [data-hz-whatsapp-open]").forEach(function (button) {
    button.classList.add("js-ctcw-waf2");
    button.removeAttribute("aria-haspopup");
  });
}());
