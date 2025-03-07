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
                    <a href="../pages/index.html">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 50" class="logo-svg">
                          <defs>
                            <linearGradient id="logo-gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stop-color="#3B82F6" />
                              <stop offset="100%" stop-color="#2563EB" />
                            </linearGradient>
                            <linearGradient id="logo-gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stop-color="#3B82F6" />
                              <stop offset="100%" stop-color="#8B5CF6" />
                            </linearGradient>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                              <feOffset dx="0" dy="1" result="offsetblur" />
                              <feComponentTransfer>
                                <feFuncA type="linear" slope="0.2" />
                              </feComponentTransfer>
                              <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          
                          <!-- Symbole "Nexus" stylisé: noeud connecté -->
                          <g filter="url(#shadow)">
                            <path d="M15,25 a15,15 0 1,1 15,15 a15,15 0 0,1 -15,-15 z" fill="white" />
                            <path d="M18,25 a12,12 0 1,1 12,12 a12,12 0 0,1 -12,-12 z" fill="url(#logo-gradient-secondary)" />
                            <path d="M42,25 L30,25" stroke="url(#logo-gradient-primary)" stroke-width="3" stroke-linecap="round" />
                            <path d="M30,25 L24,15" stroke="url(#logo-gradient-primary)" stroke-width="3" stroke-linecap="round" />
                            <path d="M30,25 L24,35" stroke="url(#logo-gradient-primary)" stroke-width="3" stroke-linecap="round" />
                          </g>
                          
                          <!-- Texte "NEXTEN" -->
                          <text x="50" y="32" font-family="Montserrat, sans-serif" font-weight="700" font-size="22" fill="#1E293B" class="logo-text">NEXTEN</text>
                          
                          <!-- Badge "10" -->
                          <g transform="translate(175, 25)">
                            <circle cx="0" cy="0" r="14" fill="url(#logo-gradient-secondary)" />
                            <text x="0" y="5" font-family="Montserrat, sans-serif" font-weight="700" font-size="14" fill="white" text-anchor="middle">10</text>
                          </g>
                        </svg>
                    </a>
                </h1>
                <nav>
                    <ul>
                        <li><a href="../pages/index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Accueil</a></li>
                        <li><a href="../pages/post-job.html" class="${currentPage === 'post-job.html' ? 'active' : ''}">Publier une offre</a></li>
                        <li><a href="../pages/candidate-upload.html" class="${currentPage === 'candidate-upload.html' ? 'active' : ''}">Je suis candidat</a></li>
                        <li><a href="../pages/recruiter-dashboard.html" class="${currentPage === 'recruiter-dashboard.html' ? 'active' : ''}">Je suis recruteur</a></li>
                    </ul>
                </nav>
            </div>
            <div class="auth-buttons">
                <a href="../pages/candidate-login.html" class="btn-auth ${currentPage === 'candidate-login.html' ? 'active' : ''}">Connexion</a>
                <a href="../pages/recruiter-login.html" class="btn-auth btn-auth-primary ${currentPage === 'recruiter-login.html' ? 'active' : ''}">Inscription</a>
            </div>
        </div>
        `;
        
        // Remplacer le contenu du header
        header.innerHTML = headerHTML;
    }
});
