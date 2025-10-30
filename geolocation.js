// Geolocation & Personalization
(function() {
    'use strict';
    
    // Office Locations
    const OFFICES = [
        {
            id: 'mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            phone: '+91-22-12345678',
            email: 'mumbai@rayvaanah.com',
            address: '123 Business District, Mumbai, Maharashtra 400001',
            lat: 19.0760,
            lng: 72.8777,
            projects: ['Mumbai Coastal Road', 'Worli Sea Link', 'Mumbai Metro']
        },
        {
            id: 'delhi',
            city: 'Delhi',
            state: 'Delhi',
            phone: '+91-120-1234567',
            email: 'delhi@rayvaanah.com',
            address: 'Sector 18, Noida, Delhi NCR 201301',
            lat: 28.5355,
            lng: 77.3910,
            projects: ['Delhi Metro Phase IV', 'Eastern Peripheral Expressway']
        },
        {
            id: 'bangalore',
            city: 'Bangalore',
            state: 'Karnataka',
            phone: '+91-80-12345678',
            email: 'bangalore@rayvaanah.com',
            address: 'Whitefield Tech Park, Bangalore, Karnataka 560066',
            lat: 12.9716,
            lng: 77.5946,
            projects: ['Bangalore Metro', 'NICE Road Expansion']
        },
        {
            id: 'chennai',
            city: 'Chennai',
            state: 'Tamil Nadu',
            phone: '+91-44-12345678',
            email: 'chennai@rayvaanah.com',
            address: 'OMR IT Corridor, Chennai, Tamil Nadu 600097',
            lat: 13.0827,
            lng: 80.2707,
            projects: ['Chennai Metro Phase II', 'Chennai Outer Ring Road']
        }
    ];
    
    // Initialize geolocation
    async function initGeolocation() {
        try {
            // Try IP-based geolocation first
            const userLocation = await getUserLocation();
            
            if (userLocation) {
                personalizeContent(userLocation);
                showLocalProjects(userLocation);
                updateContactInfo(userLocation);
                trackUserLocation(userLocation);
            }
        } catch (error) {
            console.log('Geolocation not available:', error);
            // Fall back to default content
        }
    }
    
    // Get User Location via IP
    async function getUserLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('Geolocation API failed');
            
            const data = await response.json();
            
            return {
                city: data.city,
                state: data.region,
                country: data.country_name,
                countryCode: data.country_code,
                lat: data.latitude,
                lng: data.longitude,
                timezone: data.timezone,
                postal: data.postal
            };
        } catch (error) {
            console.error('IP Geolocation failed:', error);
            
            // Try browser geolocation as fallback
            return await getBrowserLocation();
        }
    }
    
    // Browser Geolocation Fallback
    function getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Browser geolocation not supported');
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Reverse geocode to get city/state
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // You would use a reverse geocoding API here
                        // For now, resolve with coordinates
                        resolve({
                            lat: latitude,
                            lng: longitude,
                            city: 'Unknown',
                            state: 'Unknown',
                            country: 'India'
                        });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => reject(error),
                { timeout: 5000 }
            );
        });
    }
    
    // Personalize Content Based on Location
    function personalizeContent(userLocation) {
        // Find nearest office
        const nearestOffice = findNearestOffice(userLocation.lat, userLocation.lng);
        
        if (nearestOffice) {
            // Update hero subtitle
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle && userLocation.city !== 'Unknown') {
                heroSubtitle.textContent = `Serving ${userLocation.city} and surrounding areas | 25 Years of Excellence | 500+ Projects Completed`;
            }
            
            // Update phone numbers to local office
            updatePhoneNumbers(nearestOffice.phone);
            
            // Update email links
            updateEmailLinks(nearestOffice.email);
            
            // Show nearest office info
            showNearestOfficeInfo(nearestOffice);
        }
        
        // Add location-based meta tag
        const metaTag = document.createElement('meta');
        metaTag.name = 'user-location';
        metaTag.content = `${userLocation.city}, ${userLocation.state}`;
        document.head.appendChild(metaTag);
    }
    
    // Find Nearest Office
    function findNearestOffice(userLat, userLng) {
        if (!userLat || !userLng) return OFFICES[0]; // Default to Mumbai
        
        let nearest = OFFICES[0];
        let minDistance = Infinity;
        
        OFFICES.forEach(office => {
            const distance = calculateDistance(userLat, userLng, office.lat, office.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = office;
            }
        });
        
        return nearest;
    }
    
    // Calculate Distance (Haversine formula)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    function toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Update Phone Numbers
    function updatePhoneNumbers(phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            // Keep main numbers, only update certain sections
            if (link.closest('.hero-content') || link.closest('.mobile-contact-strip')) {
                link.href = `tel:${phone.replace(/\D/g, '')}`;
                link.textContent = phone;
            }
        });
    }
    
    // Update Email Links
    function updateEmailLinks(email) {
        // Update secondary email links (not main contact)
        document.querySelectorAll('a[href^="mailto:"]:not([href*="info@"])').forEach(link => {
            if (link.closest('.nearest-office-info')) {
                link.href = `mailto:${email}`;
                link.textContent = email;
            }
        });
    }
    
    // Show Nearest Office Info
    function showNearestOfficeInfo(office) {
        const container = document.querySelector('.hero-content') || document.querySelector('.container');
        if (!container) return;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'nearest-office-info';
        infoDiv.innerHTML = `
            <div class="office-badge">
                <span class="badge-icon">📍</span>
                <span>Nearest Office: <strong>${office.city}</strong></span>
                <a href="tel:${office.phone.replace(/\D/g, '')}">${office.phone}</a>
            </div>
        `;
        
        // Insert after hero CTA group
        const ctaGroup = container.querySelector('.hero-cta-group');
        if (ctaGroup) {
            ctaGroup.after(infoDiv);
        }
    }
    
    // Show Local Projects
    function showLocalProjects(userLocation) {
        const nearestOffice = findNearestOffice(userLocation.lat, userLocation.lng);
        
        if (nearestOffice && nearestOffice.projects.length > 0) {
            const banner = document.getElementById('localProjectsBanner');
            const cityName = document.getElementById('localCityName');
            const projectCount = document.getElementById('localProjectCount');
            
            if (banner && cityName && projectCount) {
                cityName.textContent = nearestOffice.city;
                projectCount.textContent = nearestOffice.projects.length;
                banner.style.display = 'block';
                
                // Create local projects section
                createLocalProjectsSection(nearestOffice);
            }
        }
    }
    
    // Create Local Projects Section
    function createLocalProjectsSection(office) {
        const heroSection = document.querySelector('.hero-fullscreen');
        if (!heroSection) return;
        
        const section = document.createElement('section');
        section.className = 'section-local-projects';
        section.id = 'local-projects';
        section.innerHTML = `
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Our Projects in ${office.city}</h2>
                    <p class="section-subtitle">Infrastructure excellence in your region</p>
                </div>
                <div class="local-projects-grid">
                    ${office.projects.map(project => `
                        <div class="local-project-card">
                            <span class="project-icon">🏗️</span>
                            <h3>${project}</h3>
                            <a href="portfolio.html" class="project-link">View Details →</a>
                        </div>
                    `).join('')}
                </div>
                <div class="section-cta">
                    <p>Need similar infrastructure in ${office.city}?</p>
                    <a href="#contact-form" class="btn-primary">Request Consultation</a>
                </div>
            </div>
        `;
        
        heroSection.after(section);
    }
    
    // Update Contact Form Location
    function updateContactInfo(userLocation) {
        const locationInput = document.getElementById('projectLocation');
        if (locationInput && !locationInput.value && userLocation.city !== 'Unknown') {
            locationInput.placeholder = `e.g., ${userLocation.city}, ${userLocation.state}`;
        }
        
        // Pre-fill location in forms if empty
        document.querySelectorAll('input[name="projectLocation"], input[name="location"]').forEach(input => {
            if (!input.value && userLocation.city !== 'Unknown') {
                input.value = `${userLocation.city}, ${userLocation.state}`;
            }
        });
    }
    
    // Track User Location
    function trackUserLocation(userLocation) {
        gtag('event', 'user_location_detected', {
            'city': userLocation.city,
            'state': userLocation.state,
            'country': userLocation.country
        });
        
        // Set user property
        gtag('set', 'user_properties', {
            'user_city': userLocation.city,
            'user_state': userLocation.state
        });
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('setUserProperties', {
                city: userLocation.city,
                state: userLocation.state,
                country: userLocation.country
            });
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGeolocation);
    } else {
        initGeolocation();
    }
    
    console.log('🌍 Geolocation Module Initialized');
    
})();