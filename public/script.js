// ============================
// KICKZ — Main Script
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // NAVBAR — scroll behavior
  // ============================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ============================
  // HAMBURGER MENU
  // ============================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    // Close on nav link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ============================
  // FAQ ACCORDION
  // ============================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      faqItems.forEach(other => {
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.classList.remove('open');
      });

      // Toggle current
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  // ============================
  // REVIEWS CAROUSEL
  // ============================
  const track = document.getElementById('reviewsTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');

  if (track && dotsContainer && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.review-card');
    const total = cards.length;
    let current = 0;
    let autoTimer;

    // How many cards are visible depends on viewport
    const getVisible = () => {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    };

    // Build dots
    const buildDots = () => {
      dotsContainer.innerHTML = '';
      const pages = Math.ceil(total / getVisible());
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Page ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    };

    const goTo = (index) => {
      const visible = getVisible();
      const pages = Math.ceil(total / visible);
      current = ((index % pages) + pages) % pages;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 24;
      const offset = current * visible * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      // Update dots
      dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    };

    prevBtn.addEventListener('click', () => {
      clearTimeout(autoTimer);
      goTo(current - 1);
      scheduleAuto();
    });

    nextBtn.addEventListener('click', () => {
      clearTimeout(autoTimer);
      goTo(current + 1);
      scheduleAuto();
    });

    const scheduleAuto = () => {
      autoTimer = setTimeout(() => {
        goTo(current + 1);
        scheduleAuto();
      }, 5000);
    };

    buildDots();
    scheduleAuto();

    window.addEventListener('resize', () => {
      buildDots();
      goTo(0);
    }, { passive: true });
  }

  // ============================
  // NEWSLETTER FORM
  // ============================
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('✅ Merci ! Vous êtes bien inscrit(e) à notre newsletter.');
        input.value = '';
      }
    });
  }

  // ============================
  // TOAST NOTIFICATION
  // ============================
  const toastEl = document.getElementById('toast');

  function showToast(msg, duration = 3500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  // ============================
  // CART COUNT (cosmetic)
  // ============================
  const cartCount = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  let count = parseInt(localStorage.getItem('kickz_cart') || '0');

  const updateCartUI = () => {
    if (cartCount) {
      cartCount.textContent = count;
      cartCount.style.display = count === 0 ? 'none' : 'flex';
    }
  };
  updateCartUI();

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (count > 0) {
        showToast(`🛒 Vous avez ${count} article${count > 1 ? 's' : ''} en attente de commande.`);
      } else {
        showToast('🛒 Votre panier est vide. Découvrez nos produits !');
      }
    });
  }

  // Track "Acheter" button clicks (cosmetic — Stripe handles actual payment)
  document.querySelectorAll('.btn-red, .btn-dark').forEach(btn => {
    if (btn.closest('.product-info') || btn.closest('.product-overlay')) {
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href');
        if (!href || href.startsWith('STRIPE_LINK')) {
          e.preventDefault();
          showToast('⚠️ Le lien de paiement n\'est pas encore configuré.');
          return;
        }
        // Count cart only for valid links
        count++;
        localStorage.setItem('kickz_cart', count.toString());
        updateCartUI();
      });
    }
  });

  // ============================
  // SMOOTH SCROLL on anchor links
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || '68') +
          parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--ticker-h') || '38');
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ============================
  // ANIMATE SECTIONS on scroll
  // ============================
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const animatables = document.querySelectorAll(
      '.product-card, .category-card, .trust-badge, .review-card, .faq-item'
    );
    animatables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
      observer.observe(el);
    });
  }

});

// ============================
// TRACKING PAGE
// ============================
function trackOrder() {
  const input = document.getElementById('trackingInput');
  if (!input) return;
  const num = input.value.trim().replace(/\s+/g, '');
  if (!num) {
    alert('Veuillez entrer un numéro de suivi.');
    return;
  }
  const url = `https://www.17track.net/fr/track#nums=${encodeURIComponent(num)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

const trackInput = document.getElementById('trackingInput');
if (trackInput) {
  trackInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') trackOrder();
  });
}
