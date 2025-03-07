document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.getElementById('job-form');
    
    // Ajouter des styles dynamiques pour les animations
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        .btn-submit.loading {
            position: relative;
            color: transparent;
        }
        
        .btn-submit.loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 25px;
            height: 25px;
            margin: -12.5px 0 0 -12.5px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .form-success {
            background-color: #10b981;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.5s ease;
        }
        
        .form-success.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .form-success i {
            font-size: 2rem;
            margin-bottom: 10px;
            animation: pulse 1.5s infinite;
        }
    `;
    document.head.appendChild(styleElement);
    
    // Focus automatiquement sur le premier champ au chargement
    document.getElementById('job-title').focus();
    
    // Ajouter une validation en temps réel sur l'email
    const emailField = document.getElementById('application-email');
    
    emailField.addEventListener('input', function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (this.value && !emailPattern.test(this.value)) {
            this.style.borderColor = '#ef4444';
            
            // Vérifier si un message d'erreur existe déjà
            let errorMessage = this.parentNode.querySelector('.error-message');
            
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.style.color = '#ef4444';
                errorMessage.style.fontSize = '0.85rem';
                errorMessage.style.marginTop = '5px';
                this.parentNode.appendChild(errorMessage);
            }
            
            errorMessage.textContent = 'Veuillez entrer une adresse email valide';
        } else {
            this.style.borderColor = this.value ? '#10b981' : '#e2e8f0';
            
            // Supprimer le message d'erreur s'il existe
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
    
    // Gérer la soumission du formulaire
    jobForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const jobTitle = document.getElementById('job-title').value;
        const companyName = document.getElementById('company-name').value;
        const location = document.getElementById('location').value;
        const jobType = document.getElementById('job-type').value;
        const category = document.getElementById('category').value;
        const salary = document.getElementById('salary').value;
        const description = document.getElementById('description').value;
        const requirements = document.getElementById('requirements').value;
        const applicationEmail = document.getElementById('application-email').value;
        const applicationUrl = document.getElementById('application-url').value;
        
        // Simuler l'envoi des données (en production, on enverrait à un serveur backend)
        const newJob = {
            id: Date.now(), // Utiliser le timestamp comme ID unique
            title: jobTitle,
            company: companyName,
            location: location,
            type: jobType,
            category: category,
            salary: salary,
            description: description,
            requirements: requirements,
            posted: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
            applicationEmail: applicationEmail,
            applicationUrl: applicationUrl
        };
        
        // Simuler une requête réseau avec animation
        const submitButton = document.querySelector('.btn-submit');
        const originalButtonText = submitButton.textContent;
        
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        // Simuler un délai de traitement
        setTimeout(() => {
            // Afficher un message de succès
            submitButton.classList.remove('loading');
            
            // Créer un élément de confirmation stylisé
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <h3 style="margin-bottom: 10px; font-size: 1.2rem; font-weight: 600;">Offre publiée avec succès !</h3>
                <p>Votre offre d'emploi a été publiée avec succès et est maintenant visible par les candidats.</p>
                <p style="margin-top: 15px; font-size: 0.9rem;">Vous allez être redirigé vers la page d'accueil dans quelques instants...</p>
            `;
            
            // Ajouter le message après le formulaire
            jobForm.parentNode.appendChild(successMessage);
            
            // Animation d'apparition
            setTimeout(() => {
                successMessage.classList.add('show');
            }, 10);
            
            // Réinitialiser le formulaire
            jobForm.reset();
            
            // Rediriger vers la page d'accueil après un délai
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
            
        }, 1500);
    });
});