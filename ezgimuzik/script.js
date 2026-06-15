// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navActions = document.querySelector('.nav-actions');
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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

if (heroVideo) {
    heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
    });
}

const setMobileMenuOpen = (isOpen) => {
    if (!mobileMenuToggle || !navActions) return;
    navActions.classList.toggle('active', isOpen);
    mobileMenuToggle.classList.toggle('active', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
};

if (mobileMenuToggle && navActions) {
    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        setMobileMenuOpen(!isOpen);
    });
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const hash = this.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth',
            block: 'start'
        });
        window.history.replaceState(null, '', hash);
        setMobileMenuOpen(false);
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or menus
        setMobileMenuOpen(false);
    }
});

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    const brandLogoMap = {
        'YAMAHA': 'yamaha.com',
        'KAWAI': 'kawai-global.com',
        'CASIO': 'casio.com',
        'PEARL RIVER': 'pearlriverpiano.com',
        'IBANEZ': 'ibanez.com',
        'MARSHALL': 'marshall.com',
        'TAKAMINE': 'takamine.com',
        'WASHBURN': 'washburn.com',
        'CÓRDOBA': 'cordobaguitars.com',
        'PRS GUITARS': 'prsguitars.com',
        'SCHECTER': 'schecterguitars.com',
        'BLACKSTAR': 'blackstaramps.com',
        'ORANGE': 'orangeamps.com',
        'GRETSCH': 'gretschguitars.com',
        'AMPEG': 'ampeg.com',
        'FISHMAN': 'fishman.com',
        'ERNIE BALL': 'ernieball.com',
        'DUNLOP': 'jimdunlop.com',
        'ZILDJIAN': 'zildjian.com',
        'TOCA PERCUSSION': 'tocapercussion.com',
        'SONOR': 'sonor.com',
        'HOHNER': 'hohner.com',
        'SUZUKI': 'suzukimusic.com',
        'GODIN': 'godinguitars.com',
        'GUILD': 'guildguitars.com',
        'ZOOM': 'zoomcorp.com',
        'DIGITECH': 'digitech.com',
        /* İkinci marquee — Brandfetch için resmi / güçlü domain */
        'L&G': 'lagguitars.com',
        'RÖSLER': 'roslerpiano.com',
        'R RAIMUNDO': 'guitarrasraimundo.com',
        'ASHTON': 'ashtonmusic.com.au',
        'TOLEDO GUITARRAS': 'guitarrastoledo.com',
        'GIBRALTAR': 'gibraltarhardware.com',
        'SX': 'sx-guitars.com',
        'JP JOHN PACKER': 'johnpacker.co.uk',
        'STENOR': 'stentor-music.com',
    };

    /** Brandfetch Logo API CDN. Client ID: index.html data-brandfetch-cid
     *  Yerel SVG öncelikli olsun derseniz: data-brandfetch-local-logos="true"
     *  @see https://docs.brandfetch.com/logo-api/guidelines */
    const brandfetchCid = document.documentElement.getAttribute('data-brandfetch-cid')?.trim() || '';
    const brandfetchLocalLogosFirst =
        document.documentElement.getAttribute('data-brandfetch-local-logos') === 'true';

    const brandfetchLogoCdnUrls = (hostname) => {
        if (!brandfetchCid || !hostname) return [];
        const d = encodeURIComponent(hostname);
        const c = encodeURIComponent(brandfetchCid);
        return [
            `https://cdn.brandfetch.io/domain/${d}/theme/light/logo.svg?c=${c}`,
            `https://cdn.brandfetch.io/${d}?c=${c}`,
        ];
    };

    /* Yerel logolar — brand-logos-all/light/ (beyaz monochrome, dark theme)
     * Tum markalar PNG fallback ile servis edilir. */
    const brandLocalLogoMap = {
        'YAMAHA':           'yamaha.png',
        'KAWAI':            'kawai.png',
        'CASIO':            'casio.png',
        'PEARL RIVER':      'pearl-river.png',
        'IBANEZ':           'ibanez.png',
        'MARSHALL':         'marshall.png',
        'TAKAMINE':         'takamine.png',
        'WASHBURN':         'washburn.png',
        'CÓRDOBA':          'cordoba.png',
        'PRS GUITARS':      'prs-guitars.png',
        'SCHECTER':         'schecter.png',
        'BLACKSTAR':        'blackstar.png',
        'ORANGE':           'orange.png',
        'GRETSCH':          'gretsch.png',
        'AMPEG':            'ampeg.png',
        'FISHMAN':          'fishman.png',
        'ERNIE BALL':       'ernie-ball.png',
        'DUNLOP':           'dunlop.png',
        'ZILDJIAN':         'zildjian.png',
        'TOCA PERCUSSION':  'toca-percussion.png',
        'SONOR':            'sonor.png',
        'HOHNER':           'hohner.png',
        'SUZUKI':           'suzuki.png',
        'GODIN':            'godin.png',
        'GUILD':            'guild.png',
        'ZOOM':             'zoom.png',
        'DIGITECH':         'digitech.png',
        'L&G':              'l-and-g.png',
        'RÖSLER':           'rosler.png',
        'R RAIMUNDO':       'r-raimundo.png',
        'ASHTON':           'ashton.png',
        'TOLEDO GUITARRAS': 'toledo-guitarras.png',
        'GIBRALTAR':        'gibraltar.png',
        'SX':               'sx.png',
        'JP JOHN PACKER':   'jp-john-packer.png',
        'STENOR':           'stenor.png',
    };

    const domainSlug = (d) => d.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    const domainToRasterPaths = (domain) => {
        const slug = domainSlug(domain);
        return [`brand-logos/${slug}.png`, `brand-logos/${slug}.webp`, `brand-logos/${slug}.jpg`];
    };

    // Process only original (non-duplicate) items; rebuild clones after all loads settle
    const originalBrandEls = [...document.querySelectorAll('.brand-item:not([aria-hidden]) .brand-name')];
    let pendingLoads = originalBrandEls.length;

    const updateBrandMarqueeDistance = (track) => {
        const firstItem = track.querySelector('.brand-item');
        const firstClone = track.querySelector('.brand-item[aria-hidden="true"]');
        if (!firstItem || !firstClone) return;

        const distance = firstClone.offsetLeft - firstItem.offsetLeft;
        if (distance > 0) {
            track.style.setProperty('--marquee-translate', `-${distance}px`);
        }
    };

    const onItemSettled = () => {
        if (--pendingLoads > 0) return;
        // All originals done — rebuild duplicates so both halves are identical
        document.querySelectorAll('.brands-track').forEach(track => {
            // Freeze animation, swap duplicates, restart
            const savedAnim = track.style.animation;
            track.style.animation = 'none';
            track.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
            [...track.children].forEach(orig => {
                const clone = orig.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });
            updateBrandMarqueeDistance(track);
            track.offsetWidth; // force reflow before re-enabling
            track.style.animation = savedAnim;
        });
    };

    window.addEventListener('resize', () => {
        document.querySelectorAll('.brands-track').forEach(updateBrandMarqueeDistance);
    }, { passive: true });

    originalBrandEls.forEach((nameEl) => {
        const brandName = nameEl.textContent.trim().toUpperCase();
        const domain = brandLogoMap[brandName];
        const item = nameEl.closest('.brand-item');
        if (!item) { onItemSettled(); return; }

        const logo = document.createElement('img');
        logo.className = 'brand-logo-img';
        logo.alt = `${brandName} logo`;
        logo.loading = 'eager';
        logo.decoding = 'async';
        logo.fetchPriority = 'low';
        logo.referrerPolicy = 'strict-origin-when-cross-origin';

        const localLogoPath = brandLocalLogoMap[brandName] ? `brand-logos-all/light/${brandLocalLogoMap[brandName]}` : null;
        const cdnPaths = domain ? brandfetchLogoCdnUrls(domain) : [];
        const paths = [];
        if (brandfetchLocalLogosFirst) {
            if (localLogoPath) paths.push(localLogoPath);
            paths.push(...cdnPaths);
        } else {
            paths.push(...cdnPaths);
            if (localLogoPath) paths.push(localLogoPath);
        }
        if (domain) paths.push(...domainToRasterPaths(domain));
        let pathIndex = 0;
        const keepTextFallback = () => {
            item.classList.add('brand-item--text-fallback');
            onItemSettled();
        };
        const loadNext = () => {
            if (pathIndex >= paths.length) {
                keepTextFallback();
                return;
            }
            logo.src = paths[pathIndex++];
        };
        logo.onerror = loadNext;
        logo.onload = () => {
            nameEl.replaceWith(logo);
            onItemSettled();
        };
        loadNext();
    });

    const faqItems = document.querySelectorAll('.faq-item');

    const setExpandedState = (targetItem, isExpanded) => {
        targetItem.classList.toggle('active', isExpanded);
        const targetQuestion = targetItem.querySelector('.faq-question');
        if (targetQuestion) {
            targetQuestion.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
    };

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const willExpand = !item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    setExpandedState(otherItem, false);
                }
            });

            setExpandedState(item, willExpand);
        });
    });
    
    // Social proof values stay fixed to avoid layout shifts while the hero renders.
    const socialProofBar = document.querySelector('.social-proof-bar');
    if (socialProofBar) {
        const counterElements = socialProofBar.querySelectorAll('[data-target]');
        const animationDuration = 1700;
        const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

        const renderValue = (element, value) => {
            if (element.classList.contains('proof-rating')) {
                element.textContent = `${value.toFixed(1)}/5`;
            } else if (element.classList.contains('proof-reviews')) {
                element.textContent = `${Math.round(value).toLocaleString('tr-TR')} Yorum`;
            } else if (element.classList.contains('proof-number')) {
                element.textContent = `${Math.round(value).toLocaleString('tr-TR')}+`;
            }
        };

        const getStartValue = (element, target) => {
            if (element.classList.contains('proof-rating')) {
                return Math.max(0, target - 0.7);
            }
            // Subtle movement: start close to final value.
            return Math.max(0, target * 0.88);
        };

        const animateCounter = (element) => {
            const target = parseFloat(element.getAttribute('data-target') || '0');
            if (!Number.isFinite(target)) return;

            if (prefersReducedMotionQuery.matches) {
                renderValue(element, target);
                return;
            }

            const startValue = getStartValue(element, target);
            const startTime = performance.now();

            const tick = (now) => {
                const progress = Math.min(1, (now - startTime) / animationDuration);
                const eased = easeOutQuint(progress);
                const currentValue = startValue + ((target - startValue) * eased);
                renderValue(element, currentValue);
                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        let hasAnimated = false;
        const triggerAnimation = () => {
            if (hasAnimated) return;
            hasAnimated = true;
            counterElements.forEach(animateCounter);
        };

        if ('IntersectionObserver' in window) {
            const proofObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    triggerAnimation();
                    observer.disconnect();
                });
            }, { threshold: 0.55 });

            proofObserver.observe(socialProofBar);
        } else {
            triggerAnimation();
        }
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

    /** Ana bölüm h2 başlıklarında amber vurgu (<em>); stiller: premium-v2 — .section-header h2 em, .about-section h2 em */
    const headingAccentPairs = [
        ['.about-section > .container > h2', 'fazlası.'],
        ['.pas-section .section-header h2', 'çözümü net sunuyoruz.'],
        ['.love-wall-section .section-header h2', 'tek bir adres.'],
        ['.how-it-works .section-header h2', 'doğru karar.'],
        ['#instrument-guide .section-header h2', 'kendi sahnesinde.'],
        ['.faq-section .section-header h2', 'soru kalmasın.'],
    ];

    const wrapHeadingAccent = (h2, phrase) => {
        if (!h2 || !phrase || h2.querySelector('em')) return;
        const html = h2.innerHTML;
        const idx = html.indexOf(phrase);
        if (idx === -1) return;
        h2.innerHTML = `${html.slice(0, idx)}<em>${phrase}</em>${html.slice(idx + phrase.length)}`;
    };

    headingAccentPairs.forEach(([selector, phrase]) => {
        wrapHeadingAccent(document.querySelector(selector), phrase);
    });

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

