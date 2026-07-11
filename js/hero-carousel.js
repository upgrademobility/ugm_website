document.addEventListener('alpine:init', () => {
  Alpine.data('heroCarousel', () => ({
    active: 0,
    autorotate: true,
    autorotateTiming: 2500,
    items: [
        {
            "img": "2024-11-30-inner-6.jpg",
            "alt": "Participants at the third UpGrade Mobility Winter School"
        },
        {
            "img": "2022-30-11-inner-1.jpg",
            "alt": "Participants at the UpGrade Mobility Winter School"
        },
        {
            "img": "2022-30-11-inner-2.jpg",
            "alt": "Workshop session during the UpGrade Mobility Winter School"
        },
        {
            "img": "2024-04-18-inner-1.jpg",
            "alt": "Doctoral researchers networking at an UpGrade Mobility event"
        },
        {
            "img": "2024-04-18-inner-2.jpg",
            "alt": "Group discussion at an UpGrade Mobility graduate school event"
        },
        {
            "img": "2024-04-18-inner-3.jpg",
            "alt": "Members collaborating at an UpGrade Mobility workshop"
        },
        {
            "img": "2024-04-18-inner-4.jpg",
            "alt": "Presentation at an UpGrade Mobility graduate school event"
        },
        {
            "img": "2024-04-18-inner-6.jpg",
            "alt": "Social gathering of UpGrade Mobility doctoral researchers"
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
