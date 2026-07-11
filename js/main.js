AOS.init({
  once: true,
  disable: 'phone',
  duration: 600,
  easing: 'ease-out-sine',
});

function initNewsCarousel() {
  const carouselEl = document.querySelector('.carousel.swiper-container');
  if (!carouselEl || carouselEl.dataset.swiperInitialized === 'true' || typeof Swiper === 'undefined') {
    return;
  }

  carouselEl.dataset.swiperInitialized = 'true';

  new Swiper(carouselEl, {
    slidesPerView: 'auto',
    grabCursor: true,
    loop: false,
    centeredSlides: false,
    initialSlide: 0,
    spaceBetween: 24,
    navigation: {
      nextEl: '.carousel-next',
      prevEl: '.carousel-prev',
    },
  });
}

const newsCarousel = document.querySelector('.carousel.swiper-container');
if (newsCarousel) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          obs.disconnect();
          requestAnimationFrame(initNewsCarousel);
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(newsCarousel);
  } else {
    initNewsCarousel();
  }
}
