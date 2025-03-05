document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.getElementById('job-form');
    
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
        
        // Simuler une requête réseau
        const submitButton = document.querySelector('.btn-submit');
        submitButton.textContent = "Envoi en cours...";
        submitButton.disabled = true;
        
        setTimeout(() => {
            // Afficher un message de succès
            alert("Votre offre d'emploi a été publiée avec succès !");
            
            // Réinitialiser le formulaire
            jobForm.reset();
            
            // Restaurer le bouton
            submitButton.textContent = "Publier l'offre";
            submitButton.disabled = false;
            
            // Rediriger vers la page d'accueil (en situation réelle)
            window.location.href = "index.html";
        }, 1500);
    });
});