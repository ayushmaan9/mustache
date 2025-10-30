// Loader JavaScript - Simple fade loader
(function() {
    'use strict';
    
    const loader = document.querySelector('.page-loader');
    
    if (!loader) return;
    
    // Hide loader when page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            
            // Remove loader from DOM after animation
            setTimeout(() => {
                loader.remove();
            }, 400);
        }, 500); // Minimum display time
    });
    
    // Fallback: Hide loader after max time
    setTimeout(() => {
        if (loader && !loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 400);
        }
    }, 3000);
    
})();