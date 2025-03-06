/**
 * Script pour ajouter un bouton "Accéder au questionnaire" 
 * lorsque le parsing du CV atteint 100%
 */

document.addEventListener('DOMContentLoaded', function() {
    // Observer les changements dans le texte du pourcentage de progression
    const progressObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.textContent === '100%') {
                console.log('Parsing complété à 100%!');
                addQuestionnaireButton();
            }
        });
    });
    
    // Fonction pour ajouter le bouton "Accéder au questionnaire"
    function addQuestionnaireButton() {
        // Vérifier si le bouton existe déjà
        if (!document.getElementById('accessQuestionnaireBtn')) {
            // Créer le conteneur du bouton
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'text-center';
            buttonContainer.style.marginTop = '20px';
            
            // Créer le bouton
            const accessBtn = document.createElement('a');
            accessBtn.id = 'accessQuestionnaireBtn';
            accessBtn.href = 'candidate-questionnaire.html';
            accessBtn.className = 'btn btn-primary btn-lg';
            accessBtn.textContent = 'Accéder au questionnaire';
            accessBtn.style.backgroundColor = '#6c63ff';
            accessBtn.style.color = 'white';
            accessBtn.style.border = 'none';
            accessBtn.style.borderRadius = '8px';
            accessBtn.style.padding = '12px 24px';
            accessBtn.style.fontSize = '16px';
            accessBtn.style.fontWeight = 'bold';
            accessBtn.style.cursor = 'pointer';
            accessBtn.style.transition = 'all 0.3s ease';
            accessBtn.style.textDecoration = 'none';
            accessBtn.style.display = 'inline-block';
            
            // Ajouter un effet de survol
            accessBtn.onmouseover = function() {
                this.style.backgroundColor = '#5a52d5';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            };
            
            accessBtn.onmouseout = function() {
                this.style.backgroundColor = '#6c63ff';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            };
            
            // Ajouter le gestionnaire de clic
            accessBtn.addEventListener('click', function(e) {
                // Obtenir les données actuelles du CV
                const existingData = JSON.parse(localStorage.getItem('candidateData') || '{}');
                
                // S'assurer que le système sait que nous avons parsé un CV
                existingData.cvUploaded = true;
                existingData.parsedFromCV = true;
                
                // Enregistrer les données mises à jour
                localStorage.setItem('candidateData', JSON.stringify(existingData));
                
                // Mettre à jour l'interface du stepper
                const steps = document.querySelectorAll('.step');
                if (steps.length >= 2) {
                    steps[1].classList.remove('active');
                    steps[1].classList.add('completed');
                    steps[1].querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
                    if (steps.length >= 3) {
                        steps[2].classList.add('active');
                    }
                }
            });
            
            // Ajouter le bouton au conteneur
            buttonContainer.appendChild(accessBtn);
            
            // Trouver où insérer le bouton
            const parsingContainer = document.getElementById('parsingContainer');
            if (parsingContainer) {
                const buttonSection = parsingContainer.querySelector('.d-flex.justify-content-between.mt-4') ||
                                     parsingContainer.querySelector('[style*="justify-content: space-between"]');
                
                if (buttonSection) {
                    buttonSection.insertBefore(buttonContainer, buttonSection.firstChild);
                } else {
                    // Si on ne trouve pas la section des boutons, on ajoute avant le bouton "Compléter le questionnaire"
                    const continueBtn = document.getElementById('continueBtn');
                    if (continueBtn) {
                        continueBtn.parentNode.insertBefore(buttonContainer, continueBtn);
                    } else {
                        // Dernier recours: ajouter à la fin du conteneur de parsing
                        parsingContainer.appendChild(buttonContainer);
                    }
                }
            } else {
                // Fallback: ajouter après le conteneur de progression
                const progressContainer = document.getElementById('progressContainer');
                if (progressContainer) {
                    progressContainer.parentNode.insertBefore(buttonContainer, progressContainer.nextSibling);
                }
            }
            
            console.log('Bouton "Accéder au questionnaire" ajouté avec succès');
        }
    }
    
    // Observer les changements dans le texte de progression
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressObserver.observe(progressText, { characterData: true, childList: true, subtree: true });
        console.log('Observateur de progression configuré');
        
        // Vérifier si le parsing est déjà à 100% (par exemple, en cas de rechargement de page)
        if (progressText.textContent === '100%') {
            console.log('Parsing déjà à 100%, ajout immédiat du bouton');
            addQuestionnaireButton();
        }
    }
});

// Script d'adaptation pour la page de questionnaire
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si nous sommes sur la page de questionnaire
    if (window.location.href.includes('candidate-questionnaire.html')) {
        console.log('Page de questionnaire détectée');
        
        // Récupérer les données du CV depuis localStorage
        const candidateData = JSON.parse(localStorage.getItem('candidateData') || '{}');
        
        // Si les données existent et proviennent d'un CV
        if (candidateData && candidateData.parsedFromCV) {
            console.log('Données de CV détectées, pré-remplissage du formulaire');
            
            // Pré-remplir les champs du formulaire
            setTimeout(function() {
                // Remplir les informations personnelles
                const preferredRoleInput = document.getElementById('preferredRole');
                const locationInput = document.getElementById('location');
                
                if (preferredRoleInput && candidateData.experience && candidateData.experience.title) {
                    preferredRoleInput.value = candidateData.experience.title;
                }
                
                if (locationInput && candidateData.personalInfo && candidateData.personalInfo.location) {
                    locationInput.value = candidateData.personalInfo.location;
                }
                
                // Afficher le message de pré-remplissage
                const prefilledMessage = document.getElementById('prefilled-message');
                if (prefilledMessage) {
                    prefilledMessage.style.display = 'block';
                }
            }, 500);
        }
    }
});
