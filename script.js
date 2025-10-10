// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navActions.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Instrument rotation - NO LABELS OR ICONS
// Just let the CSS animations handle the image rotation
// No JavaScript needed for labels since they're removed

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

// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add slide animations to section elements
// Feature sections - alternate left/right
const featureSections = document.querySelectorAll('.feature-section');
featureSections.forEach((section, index) => {
    const textContent = section.querySelector('.feature-text');
    const imageContent = section.querySelector('.feature-image');
    
    if (textContent) {
        textContent.classList.add(index % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        observer.observe(textContent);
    }
    
    if (imageContent) {
        imageContent.classList.add(index % 2 === 0 ? 'slide-in-right' : 'slide-in-left');
        observer.observe(imageContent);
    }
});

// Testimonials - slide up with enhanced animation
const testimonialCards = document.querySelectorAll('.testimonial-card');
testimonialCards.forEach(card => {
    card.classList.add('slide-in-up');
    observer.observe(card);
});

// Trusted by section - scale in
const trustedByLogos = document.querySelector('.logo-grid');
if (trustedByLogos) {
    trustedByLogos.classList.add('scale-in');
    observer.observe(trustedByLogos);
}

// Migration steps - stagger slide up
const migrationSteps = document.querySelectorAll('.migration-step');
migrationSteps.forEach((step, index) => {
    step.classList.add('slide-in-up');
    step.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(step);
});

// Review cards - slide up with stagger
const reviewCards = document.querySelectorAll('.review-card');
reviewCards.forEach((card, index) => {
    card.classList.add('slide-in-up');
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// CTA section - slide up
const ctaContent = document.querySelector('.cta-content');
if (ctaContent) {
    ctaContent.classList.add('slide-in-up');
    observer.observe(ctaContent);
}

// Stats cards - stagger slide up
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach((card, index) => {
    card.classList.add('slide-in-up');
    card.style.transitionDelay = `${index * 0.15}s`;
    observer.observe(card);
});

// Hero images - CSS animations handle the crossfade naturally
// No JavaScript initialization needed

// Counter Animation for Stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    updateCounter();
}

// Observe stats section for counter animation
const statsSection = document.querySelector('.stats-section');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(statNumber => {
                const target = parseInt(statNumber.getAttribute('data-target'));
                animateCounter(statNumber, target, 2000);
            });
        }
    });
}, { threshold: 0.3 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

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

// Add hover effect to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect disabled to prevent section overlap issues
// window.addEventListener('scroll', () => {
//     const scrolled = window.pageYOffset;
//     const hero = document.querySelector('.hero');
//     
//     if (hero && scrolled < hero.offsetHeight) {
//         const parallaxSpeed = 0.5;
//         hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
//     }
// });

// Lazy loading for images (if any are added)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Add stagger animation to feature lists
const featureLists = document.querySelectorAll('.feature-list li, .benefit-list li, .problem-list .problem-item');
featureLists.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
});

// Button click feedback
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 20px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        gap: 16px;
    }
    
    .nav-actions.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: calc(100% + 200px);
        left: 0;
        right: 0;
        background: white;
        padding: 20px;
        gap: 12px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
`;
document.head.appendChild(style);

// Add progressive loading for sections
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    const heroElements = document.querySelectorAll('.hero-text > *');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, index * 100);
    });
});

// Scroll progress indicator (optional, can be enabled)
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #14B8A6, #3B82F6);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Uncomment to enable scroll progress
// createScrollProgress();

// Handle form submissions (if forms are added later)
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add form submission logic here
        console.log('Form submitted');
    });
});

// Add subtle parallax to profile card in hero
const profileCard = document.querySelector('.profile-card');
if (profileCard) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < 800) {
            profileCard.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    });
}

// Animate chart on scroll
const pieChart = document.querySelector('.pie-chart');
if (pieChart) {
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pieChart.style.animation = 'spin 1s ease-out';
                chartObserver.unobserve(pieChart);
            }
        });
    }, { threshold: 0.5 });
    
    chartObserver.observe(pieChart);
    
    // Add spin animation
    const chartStyle = document.createElement('style');
    chartStyle.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(chartStyle);
}

// Performance optimization: Debounce scroll events
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handlers
const debouncedScrollHandler = debounce(() => {
    // Scroll handling logic here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or menus
        navMenu.classList.remove('active');
        navActions.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
});

// Add focus styles for accessibility
const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
focusableElements.forEach(el => {
    el.addEventListener('focus', function() {
        // Check if it's the WhatsApp button
        if (this.classList.contains('btn-whatsapp')) {
            this.style.outline = '2px solid #25D366';
            this.style.boxShadow = '0 0 0 4px rgba(37, 211, 102, 0.2)';
        } else {
            this.style.outline = '2px solid #14B8A6';
        }
        this.style.outlineOffset = '2px';
    });
    
    el.addEventListener('blur', function() {
        this.style.outline = 'none';
        this.style.boxShadow = '';
    });
});

// Store Open/Closed Status
function checkStoreStatus() {
    // Get current time in Turkish timezone
    const now = new Date();
    const options = { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', weekday: 'long', hour12: false };
    const turkishTime = new Intl.DateTimeFormat('tr-TR', options).formatToParts(now);
    
    // Extract day and time
    const dayName = turkishTime.find(part => part.type === 'weekday').value;
    const hour = parseInt(turkishTime.find(part => part.type === 'hour').value);
    const minute = parseInt(turkishTime.find(part => part.type === 'minute').value);
    const currentTimeMinutes = hour * 60 + minute;
    
    // Store hours: 09:30 - 19:00 (570 minutes - 1140 minutes from midnight)
    const openTime = 9 * 60 + 30; // 09:30 = 570 minutes
    const closeTime = 19 * 60; // 19:00 = 1140 minutes
    
    // Check if Sunday (Pazar) - closed
    const isSunday = dayName.toLowerCase() === 'pazar';
    
    // Check if currently open
    const isOpen = !isSunday && currentTimeMinutes >= openTime && currentTimeMinutes < closeTime;
    
    // Update all location badges
    const locationElements = document.querySelectorAll('.store-location, .nav-location');
    
    locationElements.forEach(element => {
        // Remove existing status badge if any
        const existingBadge = element.querySelector('.store-status');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Create status badge
        const statusBadge = document.createElement('span');
        statusBadge.className = 'store-status';
        
        if (isOpen) {
            statusBadge.textContent = 'AÇIK';
            statusBadge.style.cssText = `
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                background: #10B981;
                color: white;
                font-size: 11px;
                font-weight: 700;
                border-radius: 6px;
                margin-left: 8px;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
            `;
        } else {
            statusBadge.textContent = 'KAPALI';
            statusBadge.style.cssText = `
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                background: #EF4444;
                color: white;
                font-size: 11px;
                font-weight: 700;
                border-radius: 6px;
                margin-left: 8px;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
            `;
        }
        
        // Add status badge to the location element
        element.appendChild(statusBadge);
    });
}

// Run on page load
checkStoreStatus();

// Update every minute
setInterval(checkStoreStatus, 60000);

console.log('🍰 Cake Equity Platform - Ready!');

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    
    // Scroll reveal: add .reveal to targets and observe
    if (!prefersReduced && 'IntersectionObserver' in window) {
        const revealTargets = document.querySelectorAll(
            '.pas-column, .testimonial-card, .value-section .value-content, .step-card, .contact-card, .trusted-brands .brand-item'
        );
        // assign varied directions
        const variants = ['reveal-up','reveal-left','reveal-right','reveal-scale'];
        const pick = (idx) => variants[idx % variants.length];
        
        // group selectors for staggered delays
        const groups = [
            document.querySelectorAll('.pas-content > *'),
            document.querySelectorAll('.testimonial-grid > *'),
            document.querySelectorAll('.value-section .value-content'),
            document.querySelectorAll('.steps-container > *'),
            document.querySelectorAll('.contact-cards > *'),
            document.querySelectorAll('.trusted-brands .brands-grid > *')
        ];
        
        // assign class + stagger per group (top-level groups)
        groups.forEach((nodes, gi) => {
            nodes.forEach((el, i) => {
                el.classList.add('reveal', pick(i + gi));
                el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
            });
        });

        // simplified: no deep sub-group staggers to avoid excessive motion
        // include any remaining targets not in groups
        revealTargets.forEach((el) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal', pick(Math.floor(Math.random()*4)));
            }
        });
        
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    }
    
    // Counter-up for hero social proof
    const counterEls = document.querySelectorAll('.hero-social-proof .customers, .hero-social-proof .years, .hero-social-proof .rating');
    let countersStarted = false;
    if (counterEls.length && 'IntersectionObserver' in window && !prefersReduced) {
        const parseNum = (txt) => parseFloat(String(txt).replace(/[^0-9.]/g, ''));
        const formatFn = (el, v) => {
            if (el.classList.contains('customers')) return Math.floor(v).toLocaleString() + '+';
            if (el.classList.contains('years')) return Math.floor(v) + '+';
            if (el.classList.contains('rating')) return v.toFixed(1);
            return String(Math.floor(v));
        };
        const animate = (el, target, dur=1200) => {
            const t0 = performance.now();
            const start = 0;
            const step = (t) => {
                const p = Math.min(1, (t - t0) / dur);
                const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                el.textContent = formatFn(el, start + (target - start) * eased);
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        const startCounters = () => {
            if (countersStarted) return;
            countersStarted = true;
            counterEls.forEach(el => animate(el, parseNum(el.textContent)));
        };
        const countersObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => { if (entry.isIntersecting) { startCounters(); obs.disconnect(); } });
        }, { threshold: 0.25 });
        countersObserver.observe(document.querySelector('.hero'));
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
    
    // Parallax effect for guitar
    const guitar = document.querySelector('.hero-instrument-image');
    if (guitar) {
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.06;
            const translateY = scrolled * parallaxSpeed;
            
            // Set CSS custom property
            document.documentElement.style.setProperty('--scroll', scrolled);
            
            guitar.style.transform = `translateY(${translateY}px) rotate(-3deg)`;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
});

