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
