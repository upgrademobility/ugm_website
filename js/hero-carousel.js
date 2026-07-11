document.addEventListener('alpine:init', () => {
  Alpine.data('heroCarousel', () => ({
    active: 0,
    autorotate: true,
    autorotateTiming: 2500,
    items: [
        {
            "img": "2024-11-30-inner-6.jpg",
            "alt": ""
        },
        {
            "img": "2022-30-11-inner-1.jpg",
            "alt": ""
        },
        {
            "img": "2022-30-11-inner-2.jpg",
            "alt": ""
        },
        {
            "img": "2024-04-18-inner-1.jpg",
            "alt": ""
        },
        {
            "img": "2024-04-18-inner-2.jpg",
            "alt": ""
        },
        {
            "img": "2024-04-18-inner-3.jpg",
            "alt": ""
        },
        {
            "img": "2024-04-18-inner-4.jpg",
            "alt": ""
        },
        {
            "img": "2024-04-18-inner-6.jpg",
            "alt": ""
        }
    ],
    init() {
      if (this.autorotate) {
        this.autorotateInterval = setInterval(() => {
          this.active = this.active + 1 === this.items.length ? 0 : this.active + 1;
        }, this.autorotateTiming);
      }
    },
    stopAutorotate() {
      clearInterval(this.autorotateInterval);
      this.autorotateInterval = null;
    },
  }));
});
