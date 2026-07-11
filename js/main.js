const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  AOS.init({
    once: true,
    disable: 'phone',
    duration: 600,
    easing: 'ease-out-sine',
  });
} else {
  document.querySelectorAll('[data-aos]').forEach((el) => el.removeAttribute('data-aos'));
}

function loadSwiper() {
  if (typeof Swiper !== 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/js/vendors/swiper-bundle.min.js';
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

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

function prepareNewsCarousel() {
  loadSwiper()
    .then(() => requestAnimationFrame(initNewsCarousel))
    .catch(() => {});
}

const newsCarousel = document.querySelector('.carousel.swiper-container');
if (newsCarousel) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          obs.disconnect();
          prepareNewsCarousel();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(newsCarousel);
  } else {
    prepareNewsCarousel();
  }
}
