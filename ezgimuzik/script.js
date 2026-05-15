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
    window.setTimeout(releaseInitialScrollLock, 900);
}

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
});

