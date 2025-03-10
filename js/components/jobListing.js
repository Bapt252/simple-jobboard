// Composant pour l'affichage et la gestion des listes d'offres d'emploi
document.addEventListener('DOMContentLoaded', function() {
    // Animation des cartes d'offres d'emploi au scroll
    const animateJobCards = () => {
        const jobCards = document.querySelectorAll('.job-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        jobCards.forEach(card => {
            observer.observe(card);
        });
    };
    
    // Fonction pour ajouter le comportement de partage
    const setupShareButtons = () => {
        const shareButtons = document.querySelectorAll('.share-job-btn');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const jobTitle = this.dataset.title;
                const jobUrl = window.location.href;
                
                // Si l'API Web Share est disponible (appareils mobiles principalement)
                if (navigator.share) {
                    navigator.share({
                        title: jobTitle,
                        text: `Découvrez cette offre sur Nexten: ${jobTitle}`,
                        url: jobUrl
                    }).catch(err => {
                        console.error('Erreur lors du partage:', err);
                    });
                } else {
                    // Copier l'URL dans le presse-papier
                    navigator.clipboard.writeText(jobUrl).then(() => {
                        // Afficher une confirmation temporaire
                        const tooltip = document.createElement('div');
                        tooltip.className = 'tooltip';
                        tooltip.textContent = 'URL copiée dans le presse-papier';
                        document.body.appendChild(tooltip);
                        
                        setTimeout(() => {
                            tooltip.remove();
                        }, 2000);
                    });
                }
            });
        });
    };
    
    // Fonction pour gérer les favoris
    const setupFavoriteButtons = () => {
        const favoriteButtons = document.querySelectorAll('.favorite-job-btn');
        
        // Récupérer les favoris existants du localStorage
        let favorites = JSON.parse(localStorage.getItem('favoriteJobs')) || [];
        
        favoriteButtons.forEach(button => {
            const jobId = button.dataset.jobId;
            
            // Mettre à jour l'apparence si déjà en favori
            if (favorites.includes(jobId)) {
                button.classList.add('favorited');
                button.querySelector('i').classList.remove('far');
                button.querySelector('i').classList.add('fas');
            }
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (favorites.includes(jobId)) {
                    // Retirer des favoris
                    favorites = favorites.filter(id => id !== jobId);
                    button.classList.remove('favorited');
                    button.querySelector('i').classList.remove('fas');
                    button.querySelector('i').classList.add('far');
                } else {
                    // Ajouter aux favoris
                    favorites.push(jobId);
                    button.classList.add('favorited');
                    button.querySelector('i').classList.remove('far');
                    button.querySelector('i').classList.add('fas');
                }
                
                // Sauvegarder dans localStorage
                localStorage.setItem('favoriteJobs', JSON.stringify(favorites));
            });
        });
    };
    
    // Initialisation
    const init = () => {
        // Appliquer les animations si les éléments existent
        if (document.querySelector('.job-card')) {
            animateJobCards();
        }
        
        // Configurer les boutons si présents
        if (document.querySelector('.share-job-btn')) {
            setupShareButtons();
        }
        
        if (document.querySelector('.favorite-job-btn')) {
            setupFavoriteButtons();
        }
    };
    
    // Démarrer
    init();
});
