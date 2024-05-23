/**
 * La clase main.js incluye todas las funciones auxiliares que se usan en la página web y que venían con la 
 * platilla de Yummy. Se ha editado muy poco este JavaScript. Los cambios principales han sido:
 *  1- El DOM content loaded ahora carga los teatros, obras, mapa y contador.
 *  2- Se han separado del antigo DOM content loaded las sentencias escritas y se han itroducido en varias funciones
 *  3- Las funciones serviran para poder recargar las funcionalidades de las librerias
 * 
* Template Name: Yummy
* Updated: Jan 30 2024 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/yummy-bootstrap-restaurant-website-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
document.addEventListener('DOMContentLoaded', () => {
  "use strict";
    /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }
  reloadAll();
  mostraTeatres();
  mostraObres();
  mostraMapa();
  contador();
});

/**
 * Recarga la librería que se encarga de presentar en formato de slides tanto obras, actores y reviews
 */
function reloadSwiper(){
  /**
   * Init swiper slider with 1 slide at once in desktop view
   */
  new Swiper('.slides-1', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });
  /**
    * Init swiper slider with 3 slides at once in desktop view
  */
  new Swiper('.slides-3', {
    speed: 600,
    loop: true,
    autoplay: {
    delay: 5000,
    disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true
    },
    navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      320: {
      slidesPerView: 1,
      spaceBetween: 40
      },

      1200: {
      slidesPerView: 3,
      spaceBetween: 1
      }
    }
  });
  new Swiper('.slides-3-no-auto', {
    speed: 600,
    loop: false,
    autoplay: {
    delay: 5000,
    disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true
    },
    navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      320: {
      slidesPerView: 1,
      spaceBetween: 40
      },

      1200: {
      slidesPerView: 3,
      spaceBetween: 1
      }
    }
  });
  /**
   * Gallery Slider
   */
  new Swiper('.gallery-slider', {
    speed: 400,
    loop: true,
    centeredSlides: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },
      640: {
        slidesPerView: 3,
        spaceBetween: 20
      },
      992: {
        slidesPerView: 5,
        spaceBetween: 20
      }
    }
  });
}

/**
 * Función encargada de la animación del contador
 */
function reloadCounter(){
  new PureCounter();
}

/**
 * Función encargada de usar glightbox para el video
 */
function reloadVideo(){
  const glightbox = GLightbox({
    selector: '.glightbox'
  });
}

/**
 * Recarga de todas la librerias que se usan para el navbar, el header y scroll botton
 */
function reloadAll(){

  /**
   * Sticky header on scroll
   */
  const selectHeader = document.querySelector('#header');
  if (selectHeader) {
    document.addEventListener('scroll', () => {
      window.scrollY > 100 ? selectHeader.classList.add('sticked') : selectHeader.classList.remove('sticked');
    });
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = document.querySelectorAll('#navbar a');

  function navbarlinksActive() {
    navbarlinks.forEach(navbarlink => {

      if (!navbarlink.hash) return;

      let section = document.querySelector(navbarlink.hash);
      if (!section) return;

      let position = window.scrollY + 200;

      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navbarlinksActive);
  document.addEventListener('scroll', navbarlinksActive);

  /**
   * Mobile nav toggle
   */
  const mobileNavShow = document.querySelector('.mobile-nav-show');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');

  document.querySelectorAll('.mobile-nav-toggle').forEach(el => {
    el.addEventListener('click', function(event) {
      event.preventDefault();
      mobileNavToogle();
    })
  });

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavShow.classList.toggle('d-none');
    mobileNavHide.classList.toggle('d-none');
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navbar a').forEach(navbarlink => {

    if (!navbarlink.hash) return;

    let section = document.querySelector(navbarlink.hash);
    if (!section) return;

    navbarlink.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');

  navDropdowns.forEach(el => {
    el.addEventListener('click', function(event) {
      if (document.querySelector('.mobile-nav-active')) {
        event.preventDefault();
        this.classList.toggle('active');
        this.nextElementSibling.classList.toggle('dropdown-active');

        let dropDownIndicator = this.querySelector('.dropdown-indicator');
        dropDownIndicator.classList.toggle('bi-chevron-up');
        dropDownIndicator.classList.toggle('bi-chevron-down');
      }
    })
  });

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const togglescrollTop = function() {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
    window.addEventListener('load', togglescrollTop);
    document.addEventListener('scroll', togglescrollTop);
    scrollTop.addEventListener('click', window.scrollTo({
      top: 0,
      behavior: 'smooth'
    }));
  }
  /**
   * Initiate glightbox
   */
  reloadVideo();

  /**
   * Initiate pURE cOUNTER
   */
  reloadCounter();

}