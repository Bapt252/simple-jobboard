// Données des offres d'emploi (normalement chargées depuis une API ou une base de données)
const mockJobs = [
    {
        id: 1,
        title: "Développeur Frontend",
        company: "TechInnovate",
        location: "Paris",
        type: "CDI",
        category: "tech",
        tags: ["JavaScript", "React", "CSS"],
        date: "2025-02-28",
        logo: "https://placehold.co/100x100?text=TI"
    },
    {
        id: 2,
        title: "UX/UI Designer",
        company: "DesignPro",
        location: "Lyon",
        type: "CDI",
        category: "design",
        tags: ["Figma", "Adobe XD", "Sketch"],
        date: "2025-02-25",
        logo: "https://placehold.co/100x100?text=DP"
    },
    {
        id: 3,
        title: "Chef de Projet Marketing",
        company: "MarketSphere",
        location: "Bordeaux",
        type: "CDI",
        category: "marketing",
        tags: ["Gestion de projet", "Marketing digital", "SEO"],
        date: "2025-02-20",
        logo: "https://placehold.co/100x100?text=MS"
    },
    {
        id: 4,
        title: "Développeur Backend",
        company: "ServerSolutions",
        location: "Paris",
        type: "CDI",
        category: "tech",
        tags: ["Java", "Spring", "SQL"],
        date: "2025-02-18",
        logo: "https://placehold.co/100x100?text=SS"
    },
    {
        id: 5,
        title: "Responsable Commercial",
        company: "SalesForce",
        location: "Nantes",
        type: "CDI",
        category: "sales",
        tags: ["Négociation", "Développement commercial", "CRM"],
        date: "2025-02-15",
        logo: "https://placehold.co/100x100?text=SF"
    },
    {
        id: 6,
        title: "Data Scientist",
        company: "DataMind",
        location: "Toulouse",
        type: "CDI",
        category: "tech",
        tags: ["Python", "Machine Learning", "Data Analysis"],
        date: "2025-02-10",
        logo: "https://placehold.co/100x100?text=DM"
    }
];

// Fonction pour formater la date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Fonction pour créer une carte d'offre d'emploi
function createJobCard(job) {
    return `
    <div class="job-card">
        <div class="job-company-logo">
            <img src="${job.logo}" alt="${job.company} logo">
        </div>
        <h3 class="job-title">${job.title}</h3>
        <p class="job-company">${job.company}</p>
        <div class="job-tags">
            ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
        </div>
        <div class="job-footer">
            <span class="job-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
            <span class="job-date">Publié le ${formatDate(job.date)}</span>
        </div>
        <a href="pages/job-details.html?id=${job.id}" class="btn btn-primary mt-3 w-full">Voir l'offre</a>
    </div>
    `;
}

// Fonction pour afficher les offres d'emploi
function displayJobs(jobs) {
    const jobsContainer = document.getElementById('jobs-container');
    if (!jobsContainer) return;
    
    jobsContainer.innerHTML = '';
    
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<p class="text-center">Aucune offre ne correspond à votre recherche.</p>';
        return;
    }
    
    jobs.forEach(job => {
        jobsContainer.innerHTML += createJobCard(job);
    });
}

// Fonction pour filtrer les offres d'emploi
function filterJobs() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filteredJobs = [...mockJobs];
    
    // Filtrer par recherche textuelle
    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtrer par catégorie
    if (categoryFilter) {
        filteredJobs = filteredJobs.filter(job => job.category === categoryFilter);
    }
    
    displayJobs(filteredJobs);
}

// Gestion du menu mobile
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (!mobileMenuToggle) return;
    
    mobileMenuToggle.addEventListener('click', () => {
        document.querySelector('header').classList.toggle('mobile-menu-open');
    });
}

// Fonction d'initialisation
function init() {
    // Afficher les offres d'emploi
    displayJobs(mockJobs);
    
    // Configurer les écouteurs d'événements pour la recherche
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchButton) {
        searchButton.addEventListener('click', filterJobs);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', event => {
            if (event.key === 'Enter') {
                filterJobs();
            }
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterJobs);
    }
    
    // Configurer le menu mobile
    setupMobileMenu();
    
    // Gestion du bouton "Voir plus d'offres"
    const loadMoreButton = document.getElementById('load-more');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            // Normalement, on chargerait plus d'offres depuis une API
            // Pour cet exemple, on simule l'absence d'offres supplémentaires
            loadMoreButton.textContent = 'Pas plus d\'offres disponibles';
            loadMoreButton.disabled = true;
        });
    }
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);