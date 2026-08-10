(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile nav toggle ------------------------------------------------ */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      mainNav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  /* ---- Scroll reveal ----------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Portfolio filter ---------------------------------------------------- */
  var filterBar = document.querySelector('.filter-bar');
  var projectCards = document.querySelectorAll('.project-card');
  var emptyState = document.querySelector('.results-empty');

  if (filterBar && projectCards.length) {
    filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;

      filterBar.querySelectorAll('.filter-chip').forEach(function (c) {
        c.setAttribute('aria-pressed', 'false');
      });
      chip.setAttribute('aria-pressed', 'true');

      var category = chip.getAttribute('data-filter');
      var visibleCount = 0;

      projectCards.forEach(function (card) {
        var match = category === 'all' || card.getAttribute('data-category') === category;
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    });
  }

  /* ---- Lightbox / carousel --------------------------------------------------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lightboxCaption = lightbox.querySelector('figcaption');
    var lightboxFigure = lightbox.querySelector('figure');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var dotsWrap = lightbox.querySelector('.lightbox-dots');
    var lastFocused = null;

    var state = { images: [], alt: '', captionBase: '', index: 0 };

    function resolveImages(btn) {
      var folder = btn.getAttribute('data-lightbox-folder');
      var fromManifest = folder && window.GALLERY_MANIFEST && window.GALLERY_MANIFEST[folder];
      if (fromManifest && fromManifest.length) return fromManifest;
      var fallback = btn.getAttribute('data-lightbox-fallback');
      return fallback ? [fallback] : [];
    }

    function render(i) {
    var len = state.images.length;
    state.index = ((i % len) + len) % len;

    var src = state.images[state.index];

    // Remove previous media
    lightboxFigure.querySelectorAll("img,video,iframe").forEach(function (el) {
        if (el.tagName === "VIDEO") {
            el.pause();
            el.removeAttribute("src");
            el.load();
        }
        el.remove();
    });

    // ---------- YouTube ----------
    if (src.includes("youtube.com") || src.includes("youtu.be")) {

        var videoId = "";

        if (src.includes("youtu.be/")) {
            videoId = src.split("youtu.be/")[1].split("?")[0];
        } else {
            videoId = new URL(src).searchParams.get("v");
        }

        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
        iframe.width = "960";
        iframe.height = "540";
        iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.style.width = "100%";
        iframe.style.maxWidth = "1000px";
        iframe.style.aspectRatio = "16 / 9";
        iframe.style.border = "0";

        lightboxCaption.before(iframe);
    }

    // ---------- Local video ----------
    else if (/\.(mp4|webm|ogg)$/i.test(src)) {

        var video = document.createElement("video");
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.maxWidth = "100%";
        video.style.maxHeight = "80vh";

        var source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";

        video.appendChild(source);

        lightboxCaption.before(video);
    }

    // ---------- Image ----------
    else {

        var img = document.createElement("img");
        img.src = src;
        img.alt = state.alt || "";

        lightboxCaption.before(img);
    }

    // Caption
    lightboxCaption.textContent =
        len > 1
            ? state.captionBase + " (" + (state.index + 1) + " / " + len + ")"
            : state.captionBase;

    // Dots
    if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (dot, di) {
            dot.setAttribute("aria-current", di === state.index ? "true" : "false");
        });
    }
}

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      state.images.forEach(function (src, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
        dot.addEventListener('click', function () { render(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function openLightbox(images, alt, caption) {
      if (!images.length) return;
      lastFocused = document.activeElement;
      state.images = images;
      state.alt = alt;
      state.captionBase = caption || '';
      lightbox.classList.toggle('has-multiple', images.length > 1);
      buildDots();
      render(0);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');

      lightboxFigure.querySelectorAll("video").forEach(function(video) {
          video.pause();
          video.removeAttribute("src");
          video.load();
      });

      lightboxFigure.querySelectorAll("img,video").forEach(function(el) {
          el.remove();
      });

      document.body.style.overflow = '';

      if (lastFocused) lastFocused.focus();
    }

    function showPrev() { render(state.index - 1); }
    function showNext() { render(state.index + 1); }

    document.querySelectorAll('[data-lightbox-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openLightbox(
          resolveImages(btn),
          btn.getAttribute('data-lightbox-alt'),
          btn.getAttribute('data-lightbox-caption')
        );
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    if (lightboxFigure) {
      var touchStartX = null;
      lightboxFigure.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      lightboxFigure.addEventListener('touchend', function (e) {
        if (touchStartX === null) return;
        var delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) {
          if (delta > 0) showPrev(); else showNext();
        }
        touchStartX = null;
      }, { passive: true });
    }

    /* Photo-count badges on cards with more than one image */
    document.querySelectorAll('[data-lightbox-trigger]').forEach(function (btn) {
      var count = resolveImages(btn).length;
      if (count < 2) return;
      var figure = btn.closest('.project-card').querySelector('figure');
      if (!figure) return;
      var badge = document.createElement('span');
      badge.className = 'photo-count-badge';
      badge.textContent = count + ' photos';
      figure.appendChild(badge);
    });
  }

  /* ---- Contact form (no backend: mailto fallback) --------------------------- */
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.elements['name'].value.trim();
      var email = contactForm.elements['email'].value.trim();
      var message = contactForm.elements['message'].value.trim();
      var status = contactForm.querySelector('.form-status');

      var subject = encodeURIComponent('Enquiry from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      var mailto = 'mailto:office@skygrace.in?subject=' + subject + '&body=' + body;

      if (status) {
        status.textContent = 'Opening your email client to send this message…';
      }
      window.location.href = mailto;
    });
  }
})();
