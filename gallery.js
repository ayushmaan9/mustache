// Gallery JavaScript - Horizontal scroll and swipe support
(function() {
    'use strict';
    
    const gallery = document.querySelector('.portfolio-gallery');
    const galleryContainer = document.querySelector('.gallery-container');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    if (!gallery || !galleryContainer) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let rafId;
    
    // Touch/Mouse events for swipe
    const handleStart = (e) => {
        isDown = true;
        galleryContainer.classList.add('active');
        startX = (e.pageX || e.touches[0].pageX) - galleryContainer.offsetLeft;
        scrollLeft = galleryContainer.scrollLeft;
        cancelAnimationFrame(rafId);
    };
    
    const handleMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - galleryContainer.offsetLeft;
        const walk = (x - startX) * 2;
        const newScrollLeft = scrollLeft - walk;
        velocity = newScrollLeft - galleryContainer.scrollLeft;
        galleryContainer.scrollLeft = newScrollLeft;
    };
    
    const handleEnd = () => {
        isDown = false;
        galleryContainer.classList.remove('active');
        
        // Momentum scrolling
        const decelerate = () => {
            if (Math.abs(velocity) > 0.5) {
                galleryContainer.scrollLeft += velocity;
                velocity *= 0.95;
                rafId = requestAnimationFrame(decelerate);
            }
        };
        decelerate();
    };
    
    // Mouse events
    galleryContainer.addEventListener('mousedown', handleStart);
    galleryContainer.addEventListener('mousemove', handleMove);
    galleryContainer.addEventListener('mouseup', handleEnd);
    galleryContainer.addEventListener('mouseleave', handleEnd);
    
    // Touch events
    galleryContainer.addEventListener('touchstart', handleStart, { passive: true });
    galleryContainer.addEventListener('touchmove', handleMove, { passive: false });
    galleryContainer.addEventListener('touchend', handleEnd);
    
    // Navigation buttons
    if (prevBtn && nextBtn) {
        const scrollAmount = () => {
            const containerWidth = galleryContainer.offsetWidth;
            return containerWidth * 0.8;
        };
        
        prevBtn.addEventListener('click', () => {
            galleryContainer.scrollBy({
                left: -scrollAmount(),
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', () => {
            galleryContainer.scrollBy({
                left: scrollAmount(),
                behavior: 'smooth'
            });
        });
        
        // Update button states
        const updateButtons = () => {
            const maxScroll = galleryContainer.scrollWidth - galleryContainer.offsetWidth;
            prevBtn.disabled = galleryContainer.scrollLeft <= 0;
            nextBtn.disabled = galleryContainer.scrollLeft >= maxScroll;
        };
        
        galleryContainer.addEventListener('scroll', updateButtons);
        updateButtons();
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!gallery.contains(document.activeElement)) return;
        
        if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });
    
    // Gallery item interactions
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add lightbox functionality if needed
            const img = this.querySelector('img');
            if (img) {
                openLightbox(img.src, img.alt);
            }
        });
    });
    
    // Lightbox
    function openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img src="${src}" alt="${alt}">
            </div>
        `;
        
        // Styles
        Object.assign(lightbox.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
            animation: 'fadeIn 0.3s ease-out'
        });
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Close events
        const close = () => {
            lightbox.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                lightbox.remove();
                document.body.style.overflow = '';
            }, 300);
        };
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', close);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });
        
        // ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
})();