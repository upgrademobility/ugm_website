document.addEventListener('alpine:init', () => {
  Alpine.data('siteHeader', () => ({
    isAtTop: true,
    updateScrollState() {
      this.isAtTop = window.pageYOffset < 10;
    },
    init() {
      this.updateScrollState();
    },
  }));
});

// Point the About mega-menu arrow at the "About" link.
(function () {
  function positionMegaArrows() {
    document.querySelectorAll('.nav-mega').forEach(function (item) {
      var trigger = item.querySelector('.nav-mega-trigger');
      var panel = item.querySelector('.nav-mega-panel');
      var header = item.closest('header');
      if (!trigger || !panel || !header) return;
      var t = trigger.getBoundingClientRect();
      var h = header.getBoundingClientRect();
      panel.style.setProperty('--nav-mega-arrow', t.left + t.width / 2 - h.left + 'px');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', positionMegaArrows);
  } else {
    positionMegaArrows();
  }
  window.addEventListener('load', positionMegaArrows);
  window.addEventListener('resize', positionMegaArrows);
})();
