document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'élément footer
    const footer = document.querySelector('footer');
    
    if (footer) {
        // Préparer le HTML pour le footer
        const footerHTML = `
        <div class="container">
            <p>&copy; 2025 Nexten - Tous droits réservés</p>
        </div>
        `;
        
        // Remplacer le contenu du footer
        footer.innerHTML = footerHTML;
    }
});
