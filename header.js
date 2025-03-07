document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'élément header
    const header = document.querySelector('header');
    
    if (header) {
        // Déterminer la page active
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Préparer le HTML pour le header
        const headerHTML = `
        <div class="container">
            <div class="header-left">
                <h1 class="logo-container">
                    <a href="index.html">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" class="logo-svg">
                          <defs>
                            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stop-color="#6366F1" />
                              <stop offset="100%" stop-color="#8B5CF6" />
                            </linearGradient>
                          </defs>
                          <path d="M20,10 L30,10 L30,40 L20,40 L20,25 L10,40 L0,40 L0,10 L10,10 L10,25 Z" fill="url(#logo-gradient)"/>
                          <text x="35" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#374151">exten</text>
                          <circle cx="180" cy="15" r="12" fill="url(#logo-gradient)" opacity="0.2"/>
                          <text x="173" y="20" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#6366F1">10</text>
                        </svg>
                    </a>
                </h1>
                <nav>
                    <ul>
                        <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Accueil</a></li>
                        <li><a href="post-job.html" class="${currentPage === 'post-job.html' ? 'active' : ''}">Publier une offre</a></li>
                        <li><a href="candidate-upload.html" class="${currentPage === 'candidate-upload.html' ? 'active' : ''}">Je suis candidat</a></li>
                        <li><a href="recruiter-dashboard.html" class="${currentPage === 'recruiter-dashboard.html' ? 'active' : ''}">Je suis recruteur</a></li>
                    </ul>
                </nav>
            </div>
            <div class="auth-buttons">
                <a href="candidate-login.html" class="btn-auth ${currentPage === 'candidate-login.html' ? 'active' : ''}">Connexion</a>
                <a href="recruiter-login.html" class="btn-auth btn-auth-primary ${currentPage === 'recruiter-login.html' ? 'active' : ''}">Inscription</a>
            </div>
        </div>
        `;
        
        // Remplacer le contenu du header
        header.innerHTML = headerHTML;
    }
});
