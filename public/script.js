// ===========================
// SNEAKERS WORLD — Script
// ===========================

// --- Cart helpers ---
function getCart() {
  try { return JSON.parse(localStorage.getItem('sw_cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('sw_cart', JSON.stringify(cart));
}

function addToCart(e, id, name, price, img, size) {
  if (e) e.preventDefault();
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1, size: size || null });
  }
  saveCart(cart);
  updateCartBadge();
  showToast('🛒 ' + name + ' ajouté au panier !');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartBadge').forEach(el => {
    el.textContent = total;
    el.style.display = total === 0 ? 'none' : 'flex';
  });
}

// --- Toast ---
function showToast(msg, duration = 3200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

// --- DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Hamburger / mobile drawer
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const close = document.getElementById('drawerClose');

  const openDrawer = () => {
    drawer && drawer.classList.add('open');
    overlay && overlay.classList.add('open');
  };
  const closeDrawer = () => {
    drawer && drawer.classList.remove('open');
    overlay && overlay.classList.remove('open');
  };

  hamburger && hamburger.addEventListener('click', openDrawer);
  close && close.addEventListener('click', closeDrawer);
  overlay && overlay.addEventListener('click', closeDrawer);

  // Search toggle
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  searchToggle && searchToggle.addEventListener('click', () => {
    searchBar && searchBar.classList.toggle('open');
    if (searchBar && searchBar.classList.contains('open')) {
      setTimeout(() => document.getElementById('searchInput') && document.getElementById('searchInput').focus(), 50);
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = btn.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-q').forEach(b => {
        b.classList.remove('open');
        b.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
      });

      // Open clicked
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 36 + 64 + 10;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

  // Animate cards on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.product-card, .cat-card, .review-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity .4s ease ${i * 0.05}s, transform .4s ease ${i * 0.05}s`;
      io.observe(el);
    });
  }
});
