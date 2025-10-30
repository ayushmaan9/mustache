// Main JavaScript - Enhanced for Lead Generation
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        NAVBAR_SCROLL_THRESHOLD: 50,
        NAVBAR_HEIGHT: 80,
        SCROLL_HIDE_THRESHOLD: 100,
        NOTIFICATION_DURATION: 5000,
        COUNTER_DURATION: 2000,
        EXIT_INTENT_DELAY: 3000,
        EXIT_INTENT_THRESHOLD: 50
    };
    
    // DOM Elements
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.nav-primary');
    
    // Mobile Navigation Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
            this.classList.toggle('active');
            
            // Track mobile menu interaction
            gtag('event', 'mobile_menu_toggle', {
                'action': !isExpanded ? 'open' : 'close'
            });
        });
    }
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Enhanced Navbar scroll effect
    let lastScroll = 0;
    let ticking = false;
    
    function updateNavbar() {
        const currentScroll = window.pageYOffset;
        
        // Add background on scroll
        if (currentScroll > CONFIG.NAVBAR_SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show on scroll (desktop only)
        if (window.innerWidth > 768) {
            if (currentScroll > lastScroll && currentScroll > CONFIG.SCROLL_HIDE_THRESHOLD) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
    
    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            try {
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.NAVBAR_HEIGHT;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Track anchor click
                    gtag('event', 'anchor_click', {
                        'target_id': href
                    });
                }
            } catch (error) {
                console.warn('Invalid selector:', href);
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.animate-on-scroll, .stagger-container, .expertise-card, .project-feature, .review-card').forEach(el => {
        observer.observe(el);
    });
    
    // Counter Animation with easing
    const counters = document.querySelectorAll('[data-count]');
    
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.count);
                    const startTime = performance.now();
                    
                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / CONFIG.COUNTER_DURATION, 1);
                        
                        // Easing function (ease-out cubic)
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        
                        const currentValue = Math.floor(target * easeProgress);
                        counter.textContent = currentValue.toLocaleString();
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => counterObserver.observe(counter));
    }
    
    // Phone Click Tracking
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            const phoneNumber = this.href.replace('tel:', '');
            gtag('event', 'phone_click', {
                'phone_number': phoneNumber,
                'link_text': this.textContent.trim()
            });
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Contact');
            }
        });
    });
    
    // Email Click Tracking
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            gtag('event', 'email_click', {
                'email': this.href.replace('mailto:', '')
            });
        });
    });
    
    // CTA Button Tracking
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-ghost').forEach(btn => {
        btn.addEventListener('click', function() {
            gtag('event', 'cta_click', {
                'button_text': this.textContent.trim(),
                'button_class': this.className,
                'page_location': window.location.pathname
            });
        });
    });
    
    // Scroll Depth Tracking
    let scrollDepth = 0;
    let scrollTimeout;
    
    function trackScrollDepth() {
        const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (depth > scrollDepth && depth % 25 === 0) {
            scrollDepth = depth;
            gtag('event', 'scroll_depth', {
                'depth': depth + '%',
                'page': window.location.pathname
            });
        }
    }
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(trackScrollDepth, 150);
    });
    
    // Video Play Tracking
    document.querySelectorAll('video').forEach(video => {
        let tracked = false;
        
        video.addEventListener('play', function() {
            if (!tracked) {
                gtag('event', 'video_play', {
                    'video_url': this.src || 'hero_video'
                });
                tracked = true;
            }
        });
    });
    
    // FAQ Accordion
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('.faq-icon');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQs
            faqToggles.forEach(otherToggle => {
                if (otherToggle !== this) {
                    otherToggle.setAttribute('aria-expanded', 'false');
                    otherToggle.querySelector('.faq-icon').textContent = '+';
                    otherToggle.closest('.faq-item').querySelector('.faq-answer').hidden = true;
                }
            });
            
            // Toggle current FAQ
            this.setAttribute('aria-expanded', !isExpanded);
            answer.hidden = isExpanded;
            icon.textContent = isExpanded ? '+' : '−';
            
            // Track FAQ interaction
            gtag('event', 'faq_click', {
                'question': this.textContent.trim(),
                'action': isExpanded ? 'close' : 'open'
            });
        });
    });
    
    // Cost Calculator
    const costCalculator = document.getElementById('costCalculator');
    const calculatorResult = document.getElementById('calculatorResult');
    
    if (costCalculator) {
        const projectTypeSelect = document.getElementById('projectType');
        const projectSizeInput = document.getElementById('projectSize');
        const unitLabel = document.querySelector('.unit-label');
        
        // Update unit label based on project type
        projectTypeSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const unitMap = {
                'highway': 'kilometers',
                'bridge': 'meters',
                'water': 'MLD capacity',
                'building': 'square feet',
                'urban': 'acres'
            };
            
            if (unitLabel && this.value) {
                unitLabel.textContent = unitMap[this.value] || 'units';
            }
        });
        
        costCalculator.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const projectType = projectTypeSelect.value;
            const projectSize = parseFloat(projectSizeInput.value);
            const location = document.getElementById('projectLocation').value;
            
            if (!projectType || !projectSize || !location) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            // Get rate from data attribute
            const selectedOption = projectTypeSelect.options[projectTypeSelect.selectedIndex];
            const baseRate = parseFloat(selectedOption.dataset.rate);
            
            // Calculate cost range (in crores)
            const minCost = ((projectSize * baseRate * 0.8) / 10000000).toFixed(2);
            const maxCost = ((projectSize * baseRate * 1.2) / 10000000).toFixed(2);
            
            // Display results
            document.getElementById('minCost').textContent = minCost;
            document.getElementById('maxCost').textContent = maxCost;
            calculatorResult.hidden = false;
            
            // Smooth scroll to result
            calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Track calculator usage
            gtag('event', 'calculator_used', {
                'project_type': projectType,
                'project_size': projectSize,
                'location': location,
                'estimated_cost': `${minCost}-${maxCost} Cr`
            });
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'ViewContent', {
                    content_name: 'Cost Calculator',
                    content_category: projectType
                });
            }
        });
    }
    
    // Exit Intent Detection
    let exitIntentShown = false;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseY = e.clientY;
    });
    
    document.addEventListener('mouseout', (e) => {
        if (!exitIntentShown && 
            mouseY < CONFIG.EXIT_INTENT_THRESHOLD && 
            e.clientY < CONFIG.EXIT_INTENT_THRESHOLD &&
            !e.relatedTarget &&
            performance.now() > CONFIG.EXIT_INTENT_DELAY) {
            
            showExitIntentModal();
            exitIntentShown = true;
            
            gtag('event', 'exit_intent_triggered');
        }
    });
    
    function showExitIntentModal() {
        const modal = document.getElementById('exitIntentModal');
        if (modal) {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    // Time on Page Tracking
    let timeOnPage = 0;
    const timeInterval = setInterval(() => {
        timeOnPage += 10;
        
        // Track milestones
        if (timeOnPage === 30) {
            gtag('event', 'time_on_page', { 'duration': '30_seconds' });
        } else if (timeOnPage === 60) {
            gtag('event', 'time_on_page', { 'duration': '1_minute' });
        } else if (timeOnPage === 180) {
            gtag('event', 'time_on_page', { 'duration': '3_minutes' });
        }
    }, 10000);
    
    // Clear interval on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(timeInterval);
        
        // Track final time on page
        gtag('event', 'time_on_page_final', {
            'duration_seconds': timeOnPage
        });
    });
    
    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.NOTIFICATION_DURATION);
    }
    
    // Make notification function globally available
    window.showNotification = showNotification;
    
    // Page Load Performance Tracking
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const connectTime = perfData.responseEnd - perfData.requestStart;
            const renderTime = perfData.domComplete - perfData.domLoading;
            
            gtag('event', 'page_performance', {
                'page_load_time': pageLoadTime,
                'connect_time': connectTime,
                'render_time': renderTime
            });
        }
    });
    
    // Error Tracking
    window.addEventListener('error', (e) => {
        gtag('event', 'javascript_error', {
            'error_message': e.message,
            'error_file': e.filename,
            'error_line': e.lineno
        });
    });
    
    // Utility function for debouncing
    function debounce(func, wait) {
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
    
    // Utility function to get URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // Make utility functions globally available
    window.debounce = debounce;
    window.getUrlParameter = getUrlParameter;
    
    console.log('🚀 Rayvaanah Realtors - Main JS Loaded');
    
})();