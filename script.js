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
        navMenu.classList.remove('active');
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
    
    // Social Proof Counter Animation
    const socialProofBar = document.querySelector('.social-proof-bar');
    if (socialProofBar) {
        const counterElements = socialProofBar.querySelectorAll('[data-target]');
        let countersStarted = false;
        
        const animateCounter = (element, target, duration = 2000) => {
            const start = 0;
            const increment = target / (duration / 16); // 60 FPS
            let current = start;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    if (element.classList.contains('proof-rating')) {
                        element.textContent = current.toFixed(1);
                    } else if (element.classList.contains('proof-reviews')) {
                        element.textContent = Math.floor(current) + ' Yorum';
                    } else {
                        element.textContent = Math.floor(current).toLocaleString();
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    if (element.classList.contains('proof-rating')) {
                        element.textContent = target.toFixed(1);
                    } else if (element.classList.contains('proof-reviews')) {
                        element.textContent = target + ' Yorum';
                    } else {
                        element.textContent = target.toLocaleString();
                    }
                }
            };
            
            updateCounter();
        };
        
        const startCounters = () => {
            if (countersStarted) return;
            countersStarted = true;
            
            counterElements.forEach(element => {
                const target = parseFloat(element.getAttribute('data-target'));
                animateCounter(element, target, 2000);
            });
        };
        
        const countersObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounters();
                    countersObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        countersObserver.observe(socialProofBar);
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

