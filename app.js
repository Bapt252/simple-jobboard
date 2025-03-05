// Données d'offres d'emploi (simule une base de données)
const jobsData = [
    {
        id: 1,
        title: "Développeur Frontend",
        company: "TechSolutions",
        location: "Paris, France",
        type: "full-time",
        category: "tech",
        salary: "45 000 € - 60 000 € / an",
        description: "Nous recherchons un développeur frontend passionné pour rejoindre notre équipe et participer à la création d'interfaces utilisateur modernes et réactives.",
        requirements: "HTML, CSS, JavaScript, React, Expérience de 2+ ans",
        posted: "2025-03-01",
        applicationEmail: "jobs@techsolutions.com",
        applicationUrl: "https://techsolutions.com/careers"
    },
    {
        id: 2,
        title: "UX Designer",
        company: "DesignCraft",
        location: "Lyon, France",
        type: "full-time",
        category: "design",
        salary: "40 000 € - 55 000 € / an",
        description: "DesignCraft recherche un UX Designer talentueux pour concevoir des expériences utilisateur exceptionnelles pour nos clients.",
        requirements: "Figma, Adobe XD, Sketch, Expérience de 3+ ans, Portfolio solide",
        posted: "2025-03-02",
        applicationEmail: "careers@designcraft.fr",
        applicationUrl: ""
    },
    {
        id: 3,
        title: "Développeur Backend",
        company: "DataTech",
        location: "Nantes, France",
        type: "full-time",
        category: "tech",
        salary: "50 000 € - 65 000 € / an",
        description: "Rejoignez notre équipe backend pour développer des API performantes et des services robustes pour nos applications critiques.",
        requirements: "Python, Django, PostgreSQL, AWS, Expérience de 4+ ans",
        posted: "2025-03-03",
        applicationEmail: "hr@datatech.io",
        applicationUrl: "https://datatech.io/jobs"
    },
    {
        id: 4,
        title: "Responsable Marketing Digital",
        company: "GrowthGenius",
        location: "Bordeaux, France",
        type: "full-time",
        category: "marketing",
        salary: "45 000 € - 60 000 € / an",
        description: "Dirigez notre stratégie de marketing digital pour accroître notre présence en ligne et générer des leads qualifiés.",
        requirements: "SEO/SEM, Réseaux sociaux, Email marketing, Analytics, Expérience de 5+ ans",
        posted: "2025-03-04",
        applicationEmail: "careers@growthgenius.com",
        applicationUrl: ""
    },
    {
        id: 5,
        title: "Développeur Full Stack",
        company: "WebWizards",
        location: "Remote",
        type: "remote",
        category: "tech",
        salary: "55 000 € - 70 000 € / an",
        description: "Nous cherchons un développeur full stack expérimenté capable de travailler sur l'ensemble de notre stack technique en télétravail complet.",
        requirements: "JavaScript, React, Node.js, MongoDB, AWS, Expérience de 3+ ans",
        posted: "2025-03-05",
        applicationEmail: "jobs@webwizards.dev",
        applicationUrl: "https://webwizards.dev/careers"
    },
    {
        id: 6,
        title: "Chef de Projet Marketing",
        company: "BrandBoost",
        location: "Lille, France",
        type: "full-time",
        category: "marketing",
        salary: "40 000 € - 50 000 € / an",
        description: "Gérez des projets marketing de A à Z pour nos clients dans divers secteurs en coordonnant nos équipes créatives et stratégiques.",
        requirements: "Gestion de projet, Expérience en agence, Outils de collaboration, Expérience de 2+ ans",
        posted: "2025-03-05",
        applicationEmail: "hr@brandboost.fr",
        applicationUrl: ""
    },
    {
        id: 7,
        title: "Développeur Mobile iOS",
        company: "AppMasters",
        location: "Toulouse, France",
        type: "full-time",
        category: "tech",
        salary: "48 000 € - 63 000 € / an",
        description: "Développez des applications iOS innovantes pour nos clients internationaux en utilisant les dernières technologies Apple.",
        requirements: "Swift, Objective-C, UIKit, SwiftUI, Expérience de 3+ ans",
        posted: "2025-03-06",
        applicationEmail: "jobs@appmasters.tech",
        applicationUrl: "https://appmasters.tech/jobs"
    },
    {
        id: 8,
        title: "Graphiste",
        company: "CreativeMinds",
        location: "Marseille, France",
        type: "part-time",
        category: "design",
        salary: "30 000 € - 40 000 € / an (pro rata)",
        description: "Rejoignez notre équipe créative à temps partiel pour concevoir des visuels captivants pour nos clients dans le secteur du luxe et de la mode.",
        requirements: "Adobe Creative Suite, Branding, Print & Digital, Portfolio démontrant une sensibilité esthétique",
        posted: "2025-03-07",
        applicationEmail: "talent@creativeminds.fr",
        applicationUrl: ""
    }
];

// Fonction pour formater la date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Fonction pour calculer le temps écoulé depuis la publication
function getTimeAgo(dateString) {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Publié hier";
    if (diffDays < 7) return `Publié il y a ${diffDays} jours`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Publié il y a ${weeks} ${weeks === 1 ? 'semaine' : 'semaines'}`;
    }
    return `Publié le ${formatDate(dateString)}`;
}

// Fonction pour afficher le type de poste en français
function getJobTypeText(type) {
    const types = {
        'full-time': 'CDI',
        'part-time': 'CDD',
        'contract': 'Freelance',
        'internship': 'Stage',
        'remote': 'Télétravail'
    };
    return types[type] || type;
}

// Fonction pour créer une carte d'offre d'emploi
function createJobCard(job) {
    return `
    <div class="job-card" data-id="${job.id}" data-category="${job.category}">
        <div class="job-card-header">
            <div class="job-card-title">
                <h3>${job.title}</h3>
                <div class="job-card-company">${job.company}</div>
                <div class="job-card-location"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
            </div>
            <div class="job-card-type">${getJobTypeText(job.type)}</div>
        </div>
        <div class="job-card-body">
            <div class="job-card-description">${job.description}</div>
            ${job.salary ? `<div class="job-card-salary"><i class="fas fa-money-bill-wave"></i> ${job.salary}</div>` : ''}
        </div>
        <div class="job-card-footer">
            <div class="job-card-tags">
                ${job.requirements.split(',').map(tag => `<span class="job-card-tag">${tag.trim()}</span>`).join('')}
            </div>
            <div class="job-card-posted">${getTimeAgo(job.posted)}</div>
        </div>
        <button class="apply-btn" data-id="${job.id}">Postuler maintenant</button>
    </div>
    `;
}

// Fonction pour afficher les offres d'emploi
function displayJobs(jobs) {
    const jobsContainer = document.getElementById('jobs-container');
    
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<div class="no-jobs">Aucune offre d\'emploi ne correspond à votre recherche.</div>';
        return;
    }
    
    jobsContainer.innerHTML = '';
    jobs.forEach(job => {
        jobsContainer.innerHTML += createJobCard(job);
    });
    
    // Ajouter des gestionnaires d'événements pour les boutons de candidature
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const jobId = parseInt(this.getAttribute('data-id'));
            const job = jobsData.find(j => j.id === jobId);
            
            if (job.applicationUrl) {
                window.open(job.applicationUrl, '_blank');
            } else {
                window.location.href = `mailto:${job.applicationEmail}?subject=Candidature pour le poste de ${job.title} chez ${job.company}&body=Bonjour,%0D%0A%0D%0AJe souhaite postuler pour le poste de ${job.title} chez ${job.company}.%0D%0A%0D%0AMerci de trouver ci-joint mon CV et ma lettre de motivation.%0D%0A%0D%0ACordialement,%0D%0A[Votre nom]`;
            }
        });
    });
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Afficher toutes les offres d'emploi au chargement
    displayJobs(jobsData);
    
    // Gérer la recherche et le filtrage
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const searchButton = document.getElementById('search-button');
    
    function filterJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryValue = categoryFilter.value;
        
        const filteredJobs = jobsData.filter(job => {
            const matchesSearch = 
                job.title.toLowerCase().includes(searchTerm) ||
                job.company.toLowerCase().includes(searchTerm) ||
                job.requirements.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm);
                
            const matchesCategory = categoryValue === '' || job.category === categoryValue;
            
            return matchesSearch && matchesCategory;
        });
        
        displayJobs(filteredJobs);
    }
    
    searchButton.addEventListener('click', filterJobs);
    
    // Permettre la recherche en appuyant sur Entrée
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterJobs();
        }
    });
    
    // Filtrer lorsque la catégorie change
    categoryFilter.addEventListener('change', filterJobs);
    
    // Simuler le chargement de plus d'offres
    const loadMoreButton = document.getElementById('load-more');
    let clickCount = 0;
    
    loadMoreButton.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount === 1) {
            // Ajouter un message après le premier clic
            this.textContent = "Chargement en cours...";
            setTimeout(() => {
                this.textContent = "Aucune offre supplémentaire disponible";
                this.disabled = true;
                this.style.backgroundColor = "#95a5a6";
            }, 1500);
        }
    });
});