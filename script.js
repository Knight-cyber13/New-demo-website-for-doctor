/**
 * Aarogya Healthcare Clinic Demo - Main JavaScript
 * High Performance Vanilla JS with Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initStatCounters();
  initFaqAccordion();
  initContactDemoForm();
  initClinicStatus();
  initGalleryModal();
  initActiveNavLink();
});

/**
 * 1. Sticky Header & Elevation State
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Mobile Hamburger Navigation Drawer
 */
function initMobileMenu() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!hamburgerBtn || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
    hamburgerBtn.innerHTML = isOpen
      ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  };

  hamburgerBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking navigation items
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu();
    }
  });
}

/**
 * 3. Animated Number Counters on Scroll
 */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1600; // ms
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out expo
          const currentCount = Math.floor((progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)) * target);
          
          counter.textContent = `${prefix}${currentCount.toLocaleString('en-IN')}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = `${prefix}${target.toLocaleString('en-IN')}${suffix}`;
          }
        };

        requestAnimationFrame(updateCounter);
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * 4. FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close other items for single-open accordion behavior
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 5. Interactive Demo Contact & Appointment Form
 */
function initContactDemoForm() {
  const form = document.getElementById('clinicInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('patientName');
    const phoneInput = document.getElementById('patientPhone');
    const serviceInput = document.getElementById('serviceSelect');
    const messageInput = document.getElementById('patientMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const service = serviceInput ? serviceInput.value : 'General Consultation';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !phone) {
      showToast('⚠️ Please enter both your name and phone number.', 'warning');
      return;
    }

    // Format WhatsApp message
    const clinicWhatsApp = '919876543210';
    const textMsg = `Hello Dr. Sharma's Clinic,\n\nI would like to book an appointment.\n👤 Patient Name: ${name}\n📞 Phone: ${phone}\n🩺 Service: ${service}\n💬 Message/Reason: ${message || 'Consultation inquiry'}`;
    const waUrl = `https://wa.me/${clinicWhatsApp}?text=${encodeURIComponent(textMsg)}`;

    showToast('✨ Form submitted! Click here if WhatsApp does not open automatically.', 'success');

    // Attempt direct link navigation
    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      window.location.href = waUrl;
    }

    form.reset();
  });
}

/**
 * 6. Real-Time Clinic Open/Closed Hours Status (IST)
 */
function initClinicStatus() {
  const statusElement = document.getElementById('clinicOpenStatus');
  if (!statusElement) return;

  const checkStatus = () => {
    // Clinic hours in Indian Standard Time (IST = UTC+5:30): Mon-Sat 9:00 AM - 1:00 PM and 5:00 PM - 8:30 PM
    const nowUtc = new Date();
    const utcTime = nowUtc.getTime() + (nowUtc.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (5.5 * 3600000));
    
    const day = istTime.getDay(); // 0 = Sunday
    const hour = istTime.getHours();
    const min = istTime.getMinutes();
    const timeInMinutes = hour * 60 + min;

    // Morning: 9:00 (540) - 13:00 (780)
    // Evening: 17:00 (1020) - 20:30 (1230)
    let isOpen = false;
    let message = 'Closed Now • Opens at 9:00 AM';

    if (day !== 0) { // Monday to Saturday
      if (timeInMinutes >= 540 && timeInMinutes <= 780) {
        isOpen = true;
        message = 'Open Now • Morning Session (until 1:00 PM)';
      } else if (timeInMinutes >= 1020 && timeInMinutes <= 1230) {
        isOpen = true;
        message = 'Open Now • Evening Session (until 8:30 PM)';
      } else if (timeInMinutes < 540) {
        message = 'Closed Now • Morning Session starts at 9:00 AM';
      } else if (timeInMinutes > 780 && timeInMinutes < 1020) {
        message = 'Break • Evening Session starts at 5:00 PM';
      } else {
        message = 'Closed for the Day • Opens at 9:00 AM tomorrow';
      }
    } else {
      message = 'Sunday • Emergency Consultations by Appointment';
    }

    statusElement.innerHTML = `
      <span class="status-dot" style="background-color: ${isOpen ? '#22c55e' : '#f59e0b'}"></span>
      <span>${message}</span>
    `;
  };

  checkStatus();
  setInterval(checkStatus, 60000);
}

/**
 * 7. Clinic Gallery Image Zoom Modal (Interactive Lightbox)
 */
function initGalleryModal() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  // Create lightbox element if not existing
  let lightbox = document.getElementById('galleryLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'galleryLightbox';
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close modal">&times;</button>
        <img class="lightbox-img" src="" alt="Clinic Image" />
        <div class="lightbox-meta">
          <h4 class="lightbox-title"></h4>
          <p class="lightbox-desc"></p>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxDesc = lightbox.querySelector('.lightbox-desc');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption')?.textContent || 'Clinic Facility';
      const sub = item.querySelector('.gallery-sub')?.textContent || 'Aarogya Clinic Bengaluru';

      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = caption;
        if (lightboxTitle) lightboxTitle.textContent = caption;
        if (lightboxDesc) lightboxDesc.textContent = sub;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

/**
 * 8. Active Nav Link on Scroll
 */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-30% 0px -70% 0px' });

  sections.forEach(section => observer.observe(section));
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let borderColor = '#0284c7';
  if (type === 'success') borderColor = '#10b981';
  if (type === 'warning') borderColor = '#f59e0b';
  toast.style.borderLeftColor = borderColor;

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
