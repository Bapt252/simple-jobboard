// Script pour le comportement de l'en-tête
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du scroll pour modifier l'en-tête
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Mise en évidence du lien actif
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentLocation.endsWith(linkPath) || 
            (linkPath === 'index.html' && (currentLocation === '/' || currentLocation.endsWith('/simple-jobboard/')))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
