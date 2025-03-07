// Fonction pour initialiser l'autocomplete Google Maps
function initAutocomplete() {
    // Cette fonction pourra être utilisée quand on ajoute un champ d'adresse pour le candidat
    console.log("Fonction d'autocomplétion Google Maps initialisée");
    
    // Si on ajoute un champ d'adresse plus tard, l'initialisation se fera ici
    // Exemple:
    // const addressInput = document.getElementById('candidate-address');
    // if (addressInput) {
    //     try {
    //         const autocomplete = new google.maps.places.Autocomplete(addressInput, {
    //             types: ['address'],
    //             componentRestrictions: { country: ['fr'] }
    //         });
    //         
    //         autocomplete.addListener('place_changed', function() {
    //             const place = autocomplete.getPlace();
    //             if (place.geometry) {
    //                 addressInput.dataset.lat = place.geometry.location.lat();
    //                 addressInput.dataset.lng = place.geometry.location.lng();
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Erreur Google Maps:", error);
    //     }
    // }
}

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadOption = document.getElementById('uploadOption');
    const manualOption = document.getElementById('manualOption');
    const skipOption = document.getElementById('skipOption');
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const cvUpload = document.getElementById('cvUpload');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const uploadBtn = document.getElementById('uploadBtn');
    const changeFileBtn = document.getElementById('changeFileBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultContainer = document.getElementById('resultContainer');
    const continueBtn = document.getElementById('continueBtn');
    const stepper = document.querySelector('.stepper');

    // Initialize
    filePreview.style.display = 'none';
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    // Event Listeners
    if (uploadOption) {
        uploadOption.addEventListener('click', function() {
            uploadArea.classList.add('active');
            scrollToElement(uploadArea);
        });
    }

    if (skipOption) {
        skipOption.addEventListener('click', function() {
            // Mise à jour du stepper
            stepper.classList.remove('step1');
            stepper.classList.add('step2');
            document.querySelectorAll('.step')[0].classList.remove('active');
            document.querySelectorAll('.step')[0].classList.add('completed');
            document.querySelectorAll('.step')[1].classList.add('active');
            
            // Enregistrer un objet vide pour indiquer que le CV n'a pas été parsé
            localStorage.setItem('candidateData', JSON.stringify({
                skipped: true,
                personalInfo: {
                    name: "",
                    email: "",
                    phone: "",
                    location: ""
                },
                skills: [],
                experience: {
                    company: "",
                    duration: ""
                },
                education: {
                    degree: "",
                    school: "",
                    year: ""
                }
            }));
            
            // Redirection vers le questionnaire
            setTimeout(() => window.location.href = 'new-candidate-questionnaire.html', 800);
        });
    }
    
    if (manualOption) {
        manualOption.addEventListener('click', function() {
            // Mise à jour du stepper
            stepper.classList.remove('step1');
            stepper.classList.add('step2');
            document.querySelectorAll('.step')[0].classList.remove('active');
            document.querySelectorAll('.step')[0].classList.add('completed');
            document.querySelectorAll('.step')[1].classList.add('active');
            
            // Enregistrer un objet vide pour indiquer que le CV sera rempli manuellement
            localStorage.setItem('candidateData', JSON.stringify({
                manual: true,
                personalInfo: {
                    name: "",
                    email: "",
                    phone: "",
                    location: ""
                },
                skills: [],
                experience: {
                    company: "",
                    duration: ""
                },
                education: {
                    degree: "",
                    school: "",
                    year: ""
                }
            }));
            
            // Redirection vers le questionnaire
            setTimeout(() => window.location.href = 'new-candidate-questionnaire.html', 800);
        });
    }

    if (cvUpload) {
        cvUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert('error', 'Fichier trop volumineux', 'La taille maximale autorisée est de 5 Mo.');
                cvUpload.value = '';
                return;
            }

            // Validate file type
            const fileType = file.type;
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(fileType)) {
                showAlert('error', 'Format non supporté', 'Veuillez télécharger un fichier PDF ou Word (.doc, .docx).');
                cvUpload.value = '';
                return;
            }

            // Update file preview
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size) + ' • ' + getFileExtension(file.name).toUpperCase();
            filePreview.style.display = 'block';

            // Change icon based on file type
            const fileIcon = filePreview.querySelector('.file-icon');
            fileIcon.className = fileType === 'application/pdf' ? 'fas fa-file-pdf file-icon' : 'fas fa-file-word file-icon';
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const file = cvUpload.files[0];
            if (!file) {
                showAlert('warning', 'Aucun fichier sélectionné', 'Veuillez choisir un fichier à télécharger.');
                return;
            }

            // Start upload simulation
            filePreview.style.display = 'none';
            progressContainer.style.display = 'block';
            simulateUpload();
        });
    }

    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', function() {
            cvUpload.value = '';
            filePreview.style.display = 'none';
            setTimeout(() => cvUpload.click(), 100);
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // Update stepper
            stepper.classList.remove('step1');
            stepper.classList.add('step2');
            document.querySelectorAll('.step')[0].classList.remove('active');
            document.querySelectorAll('.step')[0].classList.add('completed');
            document.querySelectorAll('.step')[1].classList.add('active');

            // Redirect to questionnaire page
            setTimeout(() => window.location.href = 'candidate-questionnaire.html', 800);
        });
    }

    // Drag and Drop functionality
    const dropZone = document.querySelector('.file-upload-label');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropZone.classList.add('file-upload-label-highlight');
            dropZone.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
            dropZone.style.borderColor = 'var(--primary)';
        }

        function unhighlight() {
            dropZone.classList.remove('file-upload-label-highlight');
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '';
        }

        dropZone.addEventListener('drop', handleDrop, false);
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            cvUpload.files = files;
            cvUpload.dispatchEvent(new Event('change'));
        }
    }

    // Helper Functions
    function formatFileSize(bytes) {
        return bytes < 1024 ? `${bytes} B` :
               bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` :
               `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileExtension(filename) {
        return filename.split('.').pop();
    }

    function simulateUpload() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    const file = cvUpload.files[0];
                    if (file) {
                        parseCV(file);
                    } else {
                        progressContainer.style.display = 'none';
                        resultContainer.style.display = 'block';
                        scrollToElement(resultContainer);
                        
                        // Fallback to mock data if no file is available (should not happen)
                        saveExtractedData({
                            personalInfo: {
                                name: "John Doe",
                                email: "john@example.com",
                                phone: "0123456789",
                                location: "Paris, France"
                            },
                            skills: ["JavaScript", "HTML", "CSS", "React"],
                            experience: {
                                company: "TechCorp",
                                duration: "3 ans"
                            },
                            education: {
                                degree: "Master Informatique",
                                school: "Université de Paris",
                                year: "2020"
                            }
                        });
                    }
                }, 600);
            }
        }, 100);
    }
    
    function parseCV(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileContent = e.target.result;
            let extractedData = {};
            
            // Basic extraction based on file type
            if (file.type === 'application/pdf') {
                extractedData = extractDataFromPDF(fileContent, file.name);
            } else if (file.type.includes('word')) {
                extractedData = extractDataFromWord(fileContent, file.name);
            }
            
            // Display results
            progressContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            scrollToElement(resultContainer);
            
            // Save the extracted data
            saveExtractedData(extractedData);
            
            // Update the extracted data display in the UI
            updateExtractedDataDisplay(extractedData);
        };
        
        reader.onerror = function() {
            showAlert('error', 'Erreur de lecture', 'Une erreur est survenue lors de la lecture du fichier.');
            progressContainer.style.display = 'none';
        };
        
        // Read the file as text
        if (file.type === 'application/pdf' || file.type.includes('word')) {
            reader.readAsText(file);
        }
    }
    
    function extractDataFromPDF(content, filename) {
        // Simplified extraction from text content
        return extractDataFromText(content, filename);
    }
    
    function extractDataFromWord(content, filename) {
        // Word documents might have XML structure, but we'll simplify for this demo
        return extractDataFromText(content, filename);
    }
    
    function extractDataFromText(content, filename) {
        // Initialize result object
        const result = {
            personalInfo: {
                name: extractName(content, filename),
                email: extractEmail(content),
                phone: extractPhone(content),
                location: extractLocation(content)
            },
            skills: extractSkills(content),
            experience: extractExperience(content),
            education: extractEducation(content)
        };
        
        return result;
    }
    
    function extractName(content, filename) {
        // Try to extract name from content
        const nameRegex = /nom\s*:\s*([A-Za-zÀ-ÖØ-öø-ÿ\s-]+)|([A-Za-zÀ-ÖØ-öø-ÿ\s-]+)\s*CV|CV\s*[de|d']?\s*([A-Za-zÀ-ÖØ-öø-ÿ\s-]+)/i;
        const nameMatch = content.match(nameRegex);
        
        if (nameMatch && (nameMatch[1] || nameMatch[2] || nameMatch[3])) {
            return (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim();
        }
        
        // Fallback: extract from filename
        // Remove extension and common prefixes
        let name = filename.replace(/\.[^/.]+$/, "")
                           .replace(/CV[_\s-]?/, "")
                           .replace(/resume[_\s-]?/i, "")
                           .replace(/_/g, " ");
        
        // Capitalize first letter of each word
        name = name.split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
        
        return name;
    }
    
    function extractEmail(content) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
        const emailMatch = content.match(emailRegex);
        return emailMatch ? emailMatch[1] : "";
    }
    
    function extractPhone(content) {
        // Match formats like: +33 6 12 34 56 78, 06 12 34 56 78, 0612345678
        const phoneRegex = /(?:\+\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}/;
        const phoneMatch = content.match(phoneRegex);
        return phoneMatch ? phoneMatch[0] : "";
    }
    
    function extractLocation(content) {
        // Look for common location patterns
        const locationRegex = /adresse\s*:\s*([^\n,]+(?:,\s*[^\n,]+){0,2})|localisation\s*:\s*([^\n,]+(?:,\s*[^\n,]+){0,2})|lieu\s*:\s*([^\n,]+(?:,\s*[^\n,]+){0,2})|ville\s*:\s*([^\n,]+(?:,\s*[^\n,]+){0,2})|location\s*:\s*([^\n,]+(?:,\s*[^\n,]+){0,2})/i;
        const locationMatch = content.match(locationRegex);
        
        if (locationMatch && (locationMatch[1] || locationMatch[2] || locationMatch[3] || locationMatch[4] || locationMatch[5])) {
            return (locationMatch[1] || locationMatch[2] || locationMatch[3] || locationMatch[4] || locationMatch[5]).trim();
        }
        
        // Try to find a city name with zip code
        const cityRegex = /\b\d{5}\s+[A-Za-zÀ-ÖØ-öø-ÿ\s-]+\b/;
        const cityMatch = content.match(cityRegex);
        
        return cityMatch ? cityMatch[0] : "France";
    }
    
    function extractSkills(content) {
        // Define common technical skills to look for
        const commonSkills = [
            'HTML', 'CSS', 'JavaScript', 'TypeScript',
            'React', 'Angular', 'Vue', 'Node.js',
            'Python', 'Java', 'C#', 'C++', 'PHP',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
            'Git', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'GCP',
            'Agile', 'Scrum', 'Kanban',
            'UI/UX', 'Design', 'Photoshop', 'Illustrator',
            'Marketing', 'SEO', 'SEM', 'Analytics',
            'Excel', 'PowerPoint', 'Word',
            'Project Management', 'Leadership', 'Communication'
        ];
        
        const foundSkills = [];
        
        // Look for skills in the content
        commonSkills.forEach(skill => {
            if (content.includes(skill) || content.toLowerCase().includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });
        
        // Also try to find skills sections and extract items
        const skillsRegex = /compétences|skills|technologies|outils|tools/i;
        if (skillsRegex.test(content)) {
            const skillWords = content.split(/[\s,;:•\n-]+/);
            for (const word of skillWords) {
                if (word.length > 2 && !foundSkills.includes(word) && !commonWords.includes(word.toLowerCase())) {
                    // Check if it might be a skill (capitalized or contains digits or looks like a technology)
                    if (
                        (word[0] === word[0].toUpperCase() && word.length > 3) ||
                        /\d/.test(word) ||
                        /^\w+[.\-_+#]\w+$/.test(word)
                    ) {
                        foundSkills.push(word);
                    }
                }
            }
        }
        
        return foundSkills.slice(0, 10); // Limit to top 10 skills
    }
    
    // Common words to filter out from skills
    const commonWords = [
        'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'car', 'donc',
        'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'in', 'on', 'at',
        'to', 'from', 'by', 'as', 'of'
    ];
    
    function extractExperience(content) {
        // Try to find experience sections
        const experienceRegex = /expérience|experience|professionnel|employment|work history/i;
        
        // Try to extract company name and duration
        const companyRegex = /(?:société|company|entreprise|employeur|employer)\s*:\s*([A-Za-zÀ-ÖØ-öø-ÿ0-9\s&.-]+)|([A-Za-zÀ-ÖØ-öø-ÿ0-9\s&.-]+)\s*\(\d{4}\s*-\s*\d{4}|\(\d{4}\s*-\s*\d{4}\)\s*([A-Za-zÀ-ÖØ-öø-ÿ0-9\s&.-]+)/i;
        const durationRegex = /(\d{1,2})\s*(?:an|ans|année|années|year|years)/i;
        
        let company = "";
        let duration = "";
        
        // If we find an experience section
        if (experienceRegex.test(content)) {
            // Try to extract company
            const companyMatch = content.match(companyRegex);
            if (companyMatch && (companyMatch[1] || companyMatch[2] || companyMatch[3])) {
                company = (companyMatch[1] || companyMatch[2] || companyMatch[3]).trim();
            }
            
            // Try to extract duration
            const durationMatch = content.match(durationRegex);
            if (durationMatch && durationMatch[1]) {
                duration = durationMatch[1] + " ans";
            } else {
                // Try to find dates like 2018-2020 or 2018 - 2020
                const dateRangeRegex = /(\d{4})\s*[-–—]\s*(\d{4}|\w+)/;
                const dateMatch = content.match(dateRangeRegex);
                if (dateMatch && dateMatch[1] && dateMatch[2]) {
                    if (dateMatch[2].match(/\d{4}/)) {
                        // Calculate duration if both are years
                        const years = parseInt(dateMatch[2]) - parseInt(dateMatch[1]);
                        duration = years > 0 ? years + " ans" : "< 1 an";
                    } else {
                        // If second part is not a year (e.g., "present")
                        duration = new Date().getFullYear() - parseInt(dateMatch[1]) + " ans";
                    }
                }
            }
        }
        
        return {
            company: company || "Non spécifié",
            duration: duration || "Non spécifié"
        };
    }
    
    function extractEducation(content) {
        // Try to find education sections
        const educationRegex = /formation|education|studies|études|diplôme|degree|qualification/i;
        
        // Try to extract degree, school and year
        const degreeRegex = /(?:diplôme|degree|formation|qualification)\s*:\s*([A-Za-zÀ-ÖØ-öø-ÿ0-9\s().,-]+)|master|bachelor|licence|doctorat|bts|dut|phd|mba|ingénieur/i;
        const schoolRegex = /(?:école|school|université|university|institution)\s*:\s*([A-Za-zÀ-ÖØ-öø-ÿ0-9\s().,-]+)/i;
        const yearRegex = /(?:année|year|session|promotion)\s*:\s*(\d{4})|diplôme obtenu en (\d{4})|obtenu en (\d{4})|graduated in (\d{4})/i;
        
        let degree = "";
        let school = "";
        let year = "";
        
        // If we find an education section
        if (educationRegex.test(content)) {
            // Try to extract degree
            const degreeMatch = content.match(degreeRegex);
            if (degreeMatch) {
                if (degreeMatch[1]) {
                    degree = degreeMatch[1].trim();
                } else if (degreeMatch[0]) {
                    // If we captured just the degree type
                    const degreeTypeMatches = content.match(new RegExp(degreeMatch[0] + "[\\s:]+([A-Za-zÀ-ÖØ-öø-ÿ0-9\\s().,-]+)", "i"));
                    if (degreeTypeMatches && degreeTypeMatches[1]) {
                        degree = (degreeMatch[0] + " " + degreeTypeMatches[1]).trim();
                    } else {
                        degree = degreeMatch[0].trim();
                    }
                }
            }
            
            // Try to extract school
            const schoolMatch = content.match(schoolRegex);
            if (schoolMatch && schoolMatch[1]) {
                school = schoolMatch[1].trim();
            } else {
                // Try to find university/school names
                const commonSchools = [
                    "Sorbonne", "Paris", "HEC", "ESSEC", "ESCP", "Polytechnique",
                    "Centrale", "ENSAE", "ENSAI", "INSA", "UTC", "Dauphine",
                    "Sciences Po", "IAE", "Université", "University", "École", "School"
                ];
                
                for (const commonSchool of commonSchools) {
                    const pattern = new RegExp(`${commonSchool}[\\s\\w-]*`, "i");
                    const match = content.match(pattern);
                    if (match) {
                        school = match[0].trim();
                        break;
                    }
                }
            }
            
            // Try to extract year
            const yearMatch = content.match(yearRegex);
            if (yearMatch && (yearMatch[1] || yearMatch[2] || yearMatch[3] || yearMatch[4])) {
                year = (yearMatch[1] || yearMatch[2] || yearMatch[3] || yearMatch[4]).trim();
            } else {
                // Look for any 4-digit number that could be a year
                const possibleYearRegex = /\b(19\d{2}|20\d{2})\b/;
                const possibleYearMatch = content.match(possibleYearRegex);
                if (possibleYearMatch && possibleYearMatch[1]) {
                    year = possibleYearMatch[1];
                }
            }
        }
        
        return {
            degree: degree || "Non spécifié",
            school: school || "Non spécifié",
            year: year || "Non spécifié"
        };
    }
    
    function updateExtractedDataDisplay(data) {
        // You can modify this function to update UI elements showing the extracted data
        console.log("Données extraites:", data);
        
        // Example: Update the result container with extracted data details
        const resultDetails = document.getElementById('resultDetails');
        if (resultDetails) {
            resultDetails.innerHTML = `
                <div class="result-item">
                    <div class="result-label">Nom :</div>
                    <div class="result-value">${data.personalInfo.name || 'Non détecté'}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Email :</div>
                    <div class="result-value">${data.personalInfo.email || 'Non détecté'}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Téléphone :</div>
                    <div class="result-value">${data.personalInfo.phone || 'Non détecté'}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Localisation :</div>
                    <div class="result-value">${data.personalInfo.location || 'Non détecté'}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Compétences :</div>
                    <div class="result-value">${data.skills.join(', ') || 'Non détecté'}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Expérience :</div>
                    <div class="result-value">${data.experience.company} (${data.experience.duration})</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Formation :</div>
                    <div class="result-value">${data.education.degree}, ${data.education.school}, ${data.education.year}</div>
                </div>
            `;
        }
    }

    function saveExtractedData(extractedData) {
        try {
            localStorage.setItem('candidateData', JSON.stringify(extractedData));
            console.log('CV data saved:', extractedData);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données:', error);
            showAlert('error', 'Erreur de sauvegarde', 'Une erreur est survenue lors de la sauvegarde des données.');
        }
    }

    function showAlert(type, title, message) {
        const existingAlert = document.querySelector('.alert:not(.alert-info)');
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'check-circle'}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-text">${message}</div>
            </div>
        `;

        const container = document.querySelector('.upload-container');
        const infoAlert = container.querySelector('.alert-info');
        if (infoAlert) container.insertBefore(alert, infoAlert);
        else container.insertBefore(alert, container.firstChild);

        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    function scrollToElement(element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

