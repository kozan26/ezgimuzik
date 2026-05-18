// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navActions = document.querySelector('.nav-actions');

function renderLucideIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

renderLucideIcons();
document.addEventListener('DOMContentLoaded', renderLucideIcons);

const releaseInitialScrollLock = () => {
    document.documentElement.classList.remove('site-loading');
    document.body.classList.remove('site-loading');
};

if (document.readyState === 'complete') {
    releaseInitialScrollLock();
} else {
    window.addEventListener('load', releaseInitialScrollLock, { once: true });
}

const heroVideo = document.querySelector('.hero-background-video');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navActions.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or menus
        navActions.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
});

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Social proof values stay fixed to avoid layout shifts while the hero renders.
    const socialProofBar = document.querySelector('.social-proof-bar');
    if (socialProofBar) {
        const counterElements = socialProofBar.querySelectorAll('[data-target]');
        counterElements.forEach(element => {
            const target = parseFloat(element.getAttribute('data-target'));
            if (element.classList.contains('proof-rating')) {
                element.textContent = target.toFixed(1) + '/5';
            } else if (element.classList.contains('proof-reviews')) {
                element.textContent = `${target} Yorum`;
            } else if (element.classList.contains('proof-number')) {
                element.textContent = `${target.toLocaleString('tr-TR')}+`;
            }
        });
    }

    // Value slider
    const valueSlider = document.querySelector('[data-value-slider]');
    if (valueSlider) {
        const viewport = valueSlider.querySelector('.value-slider-viewport');
        const track = valueSlider.querySelector('.value-slider-track');
        const slides = Array.from(valueSlider.querySelectorAll('.value-slide'));
        const prevBtn = valueSlider.querySelector('.value-slider-prev');
        const nextBtn = valueSlider.querySelector('.value-slider-next');
        const dots = Array.from(document.querySelectorAll('.value-slider-dot'));
        let currentIndex = 0;
        const totalSlides = slides.length;
        let dragStartX = 0;
        let dragCurrentX = 0;
        let dragPointerId = null;
        let isDragging = false;

        const updateSlider = (index) => {
            if (!totalSlides) return;
            currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
                dot.setAttribute('aria-selected', dotIndex === currentIndex ? 'true' : 'false');
            });
        };


        const finishDrag = () => {
            if (!isDragging) return;

            const deltaX = dragCurrentX - dragStartX;
            const swipeThreshold = Math.min(90, Math.max(42, window.innerWidth * 0.12));

            isDragging = false;
            dragPointerId = null;
            viewport?.classList.remove('is-dragging');

            if (Math.abs(deltaX) >= swipeThreshold) {
                updateSlider(currentIndex + (deltaX < 0 ? 1 : -1));
            } else {
                updateSlider(currentIndex);
            }
        };

        if (viewport && window.PointerEvent) {
            viewport.addEventListener('pointerdown', (event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return;

                dragStartX = event.clientX;
                dragCurrentX = event.clientX;
                dragPointerId = event.pointerId;
                isDragging = true;
                viewport.classList.add('is-dragging');
                viewport.setPointerCapture(event.pointerId);
            });

            viewport.addEventListener('pointermove', (event) => {
                if (!isDragging || event.pointerId !== dragPointerId) return;
                dragCurrentX = event.clientX;
            });

            viewport.addEventListener('pointerup', finishDrag);
            viewport.addEventListener('pointercancel', finishDrag);
            viewport.addEventListener('lostpointercapture', finishDrag);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => updateSlider(currentIndex - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => updateSlider(currentIndex + 1));
        }
        dots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => updateSlider(dotIndex));
        });

        updateSlider(0);
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const toggleBtn = () => {
            const show = window.scrollY > 600;
            backToTop.style.display = show ? 'flex' : 'none';
            backToTop.classList.toggle('visible', show);
        };
        toggleBtn();
        window.addEventListener('scroll', toggleBtn, { passive: true });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Slight section transition on scroll
    const sections = Array.from(document.querySelectorAll('main > section'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (sections.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('section-transitions-enabled');

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.14,
            rootMargin: '0px 0px -8% 0px'
        });

        sections.forEach((section) => sectionObserver.observe(section));
    } else {
        sections.forEach((section) => section.classList.add('is-visible'));
    }
});

