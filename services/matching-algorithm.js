/**
 * Module d'algorithme de matching avancé pour Nexten
 * 
 * Ce module implémente un algorithme sophistiqué pour matcher les candidats avec les offres d'emploi
 * en utilisant plusieurs critères pondérés et normalisés.
 */

class MatchingAlgorithm {
    constructor() {
        // Pondérations des différents critères
        this.weights = {
            skills: 0.35,           // Compétences techniques
            experience: 0.20,       // Expérience professionnelle 
            location: 0.15,         // Localisation géographique
            remotePreference: 0.10, // Préférence de télétravail
            contractType: 0.10,     // Type de contrat
            salary: 0.10,           // Prétentions salariales
        };
        
        // Seuils pour considérer un match comme pertinent
        this.relevanceThreshold = 0.60; // Score minimum pour qu'un match soit pertinent
    }
    
    /**
     * Calcule un score de matching entre un candidat et une offre d'emploi
     * @param {Object} candidate - Données du candidat
     * @param {Object} jobOffer - Données de l'offre d'emploi
     * @returns {Object} - Score global et scores détaillés par critère
     */
    calculateMatchingScore(candidate, jobOffer) {
        // Vérifier que les données d'entrée sont valides
        if (!candidate || !jobOffer) {
            console.error('Données de candidat ou d\'offre manquantes');
            return {
                totalScore: 0,
                details: {},
                isRelevant: false
            };
        }
        
        try {
            // Calculer les scores individuels pour chaque critère
            const skillsScore = this.calculateSkillsScore(candidate, jobOffer);
            const experienceScore = this.calculateExperienceScore(candidate, jobOffer);
            const locationScore = this.calculateLocationScore(candidate, jobOffer);
            const remoteScore = this.calculateRemoteScore(candidate, jobOffer);
            const contractScore = this.calculateContractScore(candidate, jobOffer);
            const salaryScore = this.calculateSalaryScore(candidate, jobOffer);
            
            // Calculer le score global pondéré
            const totalScore = (
                this.weights.skills * skillsScore +
                this.weights.experience * experienceScore +
                this.weights.location * locationScore +
                this.weights.remotePreference * remoteScore +
                this.weights.contractType * contractScore +
                this.weights.salary * salaryScore
            );
            
            // Normaliser le score entre 0 et 100
            const normalizedScore = Math.round(totalScore * 100);
            
            // Détails des scores pour l'explication
            const details = {
                skills: {
                    score: Math.round(skillsScore * 100),
                    weight: this.weights.skills * 100,
                    contribution: Math.round(this.weights.skills * skillsScore * 100),
                    matchedSkills: this.getMatchedSkills(candidate, jobOffer),
                    missingSkills: this.getMissingSkills(candidate, jobOffer)
                },
                experience: {
                    score: Math.round(experienceScore * 100),
                    weight: this.weights.experience * 100,
                    contribution: Math.round(this.weights.experience * experienceScore * 100)
                },
                location: {
                    score: Math.round(locationScore * 100),
                    weight: this.weights.location * 100,
                    contribution: Math.round(this.weights.location * locationScore * 100),
                    distance: this.calculateDistance(candidate, jobOffer)
                },
                remotePreference: {
                    score: Math.round(remoteScore * 100),
                    weight: this.weights.remotePreference * 100,
                    contribution: Math.round(this.weights.remotePreference * remoteScore * 100)
                },
                contractType: {
                    score: Math.round(contractScore * 100),
                    weight: this.weights.contractType * 100,
                    contribution: Math.round(this.weights.contractType * contractScore * 100)
                },
                salary: {
                    score: Math.round(salaryScore * 100),
                    weight: this.weights.salary * 100,
                    contribution: Math.round(this.weights.salary * salaryScore * 100),
                    candidateSalary: this.extractSalaryRange(candidate),
                    offerSalary: this.extractSalaryRange(jobOffer)
                }
            };
            
            // Déterminer si le match est pertinent
            const isRelevant = totalScore >= this.relevanceThreshold;
            
            // Générer des explications textuelles pour le score
            const explanations = this.generateExplanations(details, isRelevant);
            
            return {
                totalScore: normalizedScore,
                details: details,
                isRelevant: isRelevant,
                explanations: explanations
            };
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de matching:', error);
            return {
                totalScore: 0,
                details: {},
                isRelevant: false
            };
        }
    }
    
    /**
     * Calcule le score de correspondance des compétences
     */
    calculateSkillsScore(candidate, jobOffer) {
        try {
            // Extraire les compétences du candidat
            const candidateSkills = this.extractCandidateSkills(candidate);
            if (!candidateSkills || candidateSkills.length === 0) {
                return 0;
            }
            
            // Extraire les compétences requises pour l'offre
            const requiredSkills = this.extractJobSkills(jobOffer);
            if (!requiredSkills || requiredSkills.length === 0) {
                return 0.5; // Score moyen si aucune compétence requise
            }
            
            // Normaliser les compétences pour la comparaison
            const normalizedCandidateSkills = candidateSkills.map(skill => this.normalizeSkill(skill));
            const normalizedRequiredSkills = requiredSkills.map(skill => this.normalizeSkill(skill));
            
            // Compter les compétences correspondantes
            let matchedCount = 0;
            let weightedMatch = 0;
            
            // Parcourir les compétences requises
            for (const reqSkill of normalizedRequiredSkills) {
                const candidateSkill = normalizedCandidateSkills.find(
                    candSkill => candSkill.name === reqSkill.name
                );
                
                if (candidateSkill) {
                    matchedCount++;
                    
                    // Bonus si le niveau du candidat est égal ou supérieur au niveau requis
                    if (this.getSkillLevel(candidateSkill.level) >= this.getSkillLevel(reqSkill.level)) {
                        weightedMatch += 1;
                    } else {
                        // Score partiel si le niveau est inférieur
                        const levelDiff = this.getSkillLevel(reqSkill.level) - this.getSkillLevel(candidateSkill.level);
                        weightedMatch += Math.max(0.3, 1 - (levelDiff * 0.3));
                    }
                }
            }
            
            // Calculer le score final de compétences
            if (normalizedRequiredSkills.length === 0) {
                return 0.5;
            }
            
            // Si toutes les compétences essentielles sont requises
            const matchRatio = weightedMatch / normalizedRequiredSkills.length;
            
            // Bonus pour les compétences supplémentaires pertinentes
            const relevantExtraSkills = this.countRelevantExtraSkills(normalizedCandidateSkills, normalizedRequiredSkills);
            const extraSkillsBonus = Math.min(0.2, relevantExtraSkills * 0.05);
            
            return Math.min(1, matchRatio + extraSkillsBonus);
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de compétences:', error);
            return 0.1; // Score minimal en cas d'erreur
        }
    }
    
    /**
     * Extrait les compétences du candidat à partir des données
     */
    extractCandidateSkills(candidate) {
        if (!candidate) return [];
        
        // Essayer d'abord les données parsées
        if (candidate.parsedData && 
            candidate.parsedData.skills && 
            candidate.parsedData.skills.normalized && 
            candidate.parsedData.skills.normalized.technicalSkills) {
            return candidate.parsedData.skills.normalized.technicalSkills.map(skill => ({
                name: skill,
                level: candidate.parsedData.skills.normalized.technicalSkillLevels[skill]?.level || 'Intermédiaire'
            }));
        }
        
        // Ensuite essayer les données du questionnaire
        if (candidate.questionnaire && 
            candidate.questionnaire.skills && 
            candidate.questionnaire.skills.technicalSkills) {
            
            const skills = candidate.questionnaire.skills.technicalSkills;
            const levels = candidate.questionnaire.skills.technicalSkillLevels || {};
            
            return skills.map(skill => ({
                name: skill,
                level: levels[skill] || 'Intermédiaire'
            }));
        }
        
        // Fallback sur les compétences brutes
        if (candidate.skills) {
            if (Array.isArray(candidate.skills)) {
                return candidate.skills.map(skill => {
                    if (typeof skill === 'string') {
                        return { name: skill, level: 'Intermédiaire' };
                    }
                    return skill;
                });
            }
        }
        
        return [];
    }
    
    /**
     * Extrait les compétences requises de l'offre d'emploi
     */
    extractJobSkills(jobOffer) {
        if (!jobOffer) return [];
        
        // Essayer d'abord les compétences techniques structurées
        if (jobOffer.requiredSkills && Array.isArray(jobOffer.requiredSkills)) {
            return jobOffer.requiredSkills.map(skill => {
                if (typeof skill === 'string') {
                    return { name: skill, level: 'Intermédiaire' };
                }
                return skill;
            });
        }
        
        // Extraire depuis requirements s'ils existent
        if (jobOffer.requirements) {
            if (typeof jobOffer.requirements === 'string') {
                // Tokenizer le texte
                const tokens = jobOffer.requirements.split(/,|;/).map(t => t.trim());
                return tokens.map(token => ({ name: token, level: 'Intermédiaire' }));
            }
        }
        
        return [];
    }
    
    /**
     * Normalise une compétence pour la comparaison
     */
    normalizeSkill(skill) {
        if (typeof skill === 'string') {
            return { 
                name: this.normalizeSkillName(skill), 
                level: 'Intermédiaire' 
            };
        }
        
        return {
            name: this.normalizeSkillName(skill.name),
            level: skill.level || 'Intermédiaire'
        };
    }
    
    /**
     * Normalise le nom d'une compétence
     */
    normalizeSkillName(name) {
        if (!name) return '';
        
        // Table de correspondance pour les alias courants
        const aliases = {
            'js': 'javascript',
            'ts': 'typescript',
            'reactjs': 'react',
            'react.js': 'react',
            'react js': 'react',
            'node': 'node.js',
            'nodejs': 'node.js',
            'node js': 'node.js',
            'vue': 'vue.js',
            'vuejs': 'vue.js',
            'angular': 'angular.js',
            'angularjs': 'angular.js',
            'py': 'python',
            'golang': 'go',
            'c#': 'csharp',
            '.net': 'dotnet',
            'aws': 'amazon web services',
            'azure': 'microsoft azure',
            'gcp': 'google cloud platform',
            'postgre': 'postgresql',
            'mongo': 'mongodb',
            'html': 'html5',
            'css': 'css3',
            'ui': 'user interface',
            'ux': 'user experience'
        };
        
        // Convertir en minuscules et supprimer la ponctuation
        const normalized = name.toLowerCase().trim()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ');
        
        // Retourner l'alias si disponible, sinon le nom normalisé
        return aliases[normalized] || normalized;
    }
    
    /**
     * Convertit un niveau de compétence en valeur numérique
     */
    getSkillLevel(level) {
        if (!level) return 2; // Niveau intermédiaire par défaut
        
        if (typeof level === 'object' && level.value) {
            return level.value;
        }
        
        const levelMap = {
            'débutant': 1,
            'junior': 1,
            'notions': 1,
            'basique': 1,
            'intermédiaire': 2,
            'moyen': 2,
            'confirmé': 3,
            'avancé': 3,
            'senior': 3,
            'expert': 4,
            'maître': 4
        };
        
        const normalizedLevel = String(level).toLowerCase().trim();
        return levelMap[normalizedLevel] || 2;
    }
    
    /**
     * Compte les compétences supplémentaires pertinentes du candidat
     */
    countRelevantExtraSkills(candidateSkills, requiredSkills) {
        const requiredSkillNames = requiredSkills.map(skill => skill.name);
        const relatedTech = this.getRelatedTechnologies(requiredSkillNames);
        
        let count = 0;
        for (const candSkill of candidateSkills) {
            // Ne compter que si la compétence n'est pas déjà requise
            if (!requiredSkillNames.includes(candSkill.name)) {
                // Vérifier si la compétence est liée aux technologies requises
                if (relatedTech.includes(candSkill.name)) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Obtient une liste de technologies liées aux compétences requises
     */
    getRelatedTechnologies(requiredSkillNames) {
        // Map des technologies liées
        const techMap = {
            'javascript': ['typescript', 'react', 'angular.js', 'vue.js', 'node.js', 'express', 'jquery', 'webpack', 'babel'],
            'typescript': ['javascript', 'react', 'angular.js', 'node.js'],
            'react': ['javascript', 'typescript', 'redux', 'next.js', 'gatsby'],
            'angular.js': ['javascript', 'typescript', 'rxjs'],
            'vue.js': ['javascript', 'vuex', 'nuxt.js'],
            'node.js': ['javascript', 'typescript', 'express', 'mongodb', 'sql', 'rest api'],
            'html5': ['css3', 'javascript', 'responsive design'],
            'css3': ['html5', 'sass', 'less', 'bootstrap', 'tailwind'],
            'python': ['django', 'flask', 'fastapi', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'],
            'java': ['spring', 'hibernate', 'maven', 'gradle', 'junit'],
            'csharp': ['dotnet', 'asp.net', 'entity framework', 'linq', 'xamarin'],
            'php': ['laravel', 'symfony', 'wordpress', 'mysql'],
            'ruby': ['rails', 'sinatra'],
            'sql': ['mysql', 'postgresql', 'oracle', 'sql server'],
            'nosql': ['mongodb', 'cassandra', 'redis', 'elasticsearch']
        };
        
        // Collecter toutes les technologies liées
        const relatedTech = new Set();
        for (const skill of requiredSkillNames) {
            const related = techMap[skill] || [];
            related.forEach(tech => relatedTech.add(tech));
        }
        
        return Array.from(relatedTech);
    }
    
    /**
     * Retourne les compétences correspondantes entre le candidat et l'offre
     */
    getMatchedSkills(candidate, jobOffer) {
        const candidateSkills = this.extractCandidateSkills(candidate);
        const requiredSkills = this.extractJobSkills(jobOffer);
        
        const normalizedCandidateSkills = candidateSkills.map(skill => this.normalizeSkill(skill));
        const normalizedRequiredSkills = requiredSkills.map(skill => this.normalizeSkill(skill));
        
        return normalizedRequiredSkills
            .filter(reqSkill => normalizedCandidateSkills.some(
                candSkill => candSkill.name === reqSkill.name
            ))
            .map(skill => skill.name);
    }
    
    /**
     * Retourne les compétences manquantes du candidat par rapport à l'offre
     */
    getMissingSkills(candidate, jobOffer) {
        const candidateSkills = this.extractCandidateSkills(candidate);
        const requiredSkills = this.extractJobSkills(jobOffer);
        
        const normalizedCandidateSkills = candidateSkills.map(skill => this.normalizeSkill(skill));
        const normalizedRequiredSkills = requiredSkills.map(skill => this.normalizeSkill(skill));
        
        const candidateSkillNames = normalizedCandidateSkills.map(skill => skill.name);
        
        return normalizedRequiredSkills
            .filter(reqSkill => !candidateSkillNames.includes(reqSkill.name))
            .map(skill => skill.name);
    }
    
    /**
     * Calcule le score de correspondance de l'expérience
     */
    calculateExperienceScore(candidate, jobOffer) {
        try {
            // Extraire les années d'expérience du candidat
            const candidateExperience = this.extractCandidateExperience(candidate);
            if (candidateExperience === null) {
                return 0.5; // Score moyen si l'expérience n'est pas spécifiée
            }
            
            // Extraire les années d'expérience requises
            const requiredExperience = this.extractRequiredExperience(jobOffer);
            if (requiredExperience === null) {
                return 0.5; // Score moyen si l'expérience requise n'est pas spécifiée
            }
            
            // Calculer le ratio d'expérience
            // Si le candidat a plus d'expérience que requis, c'est parfait
            if (candidateExperience >= requiredExperience) {
                // Pénaliser légèrement les candidats trop expérimentés pour les postes junior
                if (requiredExperience < 2 && candidateExperience > 5) {
                    return 0.8; // Possible surqualification
                }
                return 1.0;
            }
            
            // Si le candidat a moins d'expérience
            const experienceRatio = candidateExperience / requiredExperience;
            
            // Une expérience légèrement inférieure peut être acceptable
            if (experienceRatio >= 0.8) {
                return 0.9; // Presque parfait
            }
            
            if (experienceRatio >= 0.6) {
                return 0.7; // Acceptable avec formation
            }
            
            // Expérience insuffisante
            return Math.max(0.1, experienceRatio);
            
        } catch (error) {
            console.error('Erreur lors du calcul du score d\'expérience:', error);
            return 0.3; // Score faible en cas d'erreur
        }
    }
    
    /**
     * Extrait l'expérience du candidat en années
     */
    extractCandidateExperience(candidate) {
        if (!candidate) return null;
        
        // Essayer d'extraire à partir des données parsées
        if (candidate.parsedData && 
            candidate.parsedData.experience && 
            candidate.parsedData.experience.years) {
            return parseFloat(candidate.parsedData.experience.years);
        }
        
        // Essayer d'extraire à partir du questionnaire
        if (candidate.questionnaire && 
            candidate.questionnaire.experience && 
            candidate.questionnaire.experience.years) {
            return parseFloat(candidate.questionnaire.experience.years);
        }
        
        // Extraire à partir de la propriété expérience directe
        if (candidate.experience) {
            if (typeof candidate.experience === 'number') {
                return candidate.experience;
            }
            if (typeof candidate.experience === 'string') {
                // Essayer de parser le nombre d'années
                const match = candidate.experience.match(/(\d+)(?:\s*-\s*\d+)?\s*(?:ans|an|années|année|years|year)/i);
                if (match) {
                    return parseFloat(match[1]);
                }
            }
            if (candidate.experience.years) {
                return parseFloat(candidate.experience.years);
            }
        }
        
        return 2; // Valeur par défaut
    }
    
    /**
     * Extrait l'expérience requise pour l'offre d'emploi en années
     */
    extractRequiredExperience(jobOffer) {
        if (!jobOffer) return null;
        
        // Essayer d'extraire à partir de la propriété expérience directe
        if (jobOffer.experience) {
            if (typeof jobOffer.experience === 'number') {
                return jobOffer.experience;
            }
            if (typeof jobOffer.experience === 'string') {
                // Gérer les plages (ex: "2-5 ans")
                const range = jobOffer.experience.match(/(\d+)\s*-\s*(\d+)/);
                if (range) {
                    // Utiliser la valeur minimale pour le matching
                    return parseFloat(range[1]);
                }
                
                // Essayer de parser le nombre d'années
                const match = jobOffer.experience.match(/(\d+)\s*(?:ans|an|années|année|years|year)/i);
                if (match) {
                    return parseFloat(match[1]);
                }
                
                // Gérer les expressions
                if (/débutant|junior/i.test(jobOffer.experience)) {
                    return 1;
                }
                if (/confirmé|intermédiaire|mid/i.test(jobOffer.experience)) {
                    return 3;
                }
                if (/senior|expérimenté/i.test(jobOffer.experience)) {
                    return 5;
                }
                if (/expert/i.test(jobOffer.experience)) {
                    return 8;
                }
            }
        }
        
        return 2; // Valeur par défaut
    }
    
    /**
     * Calcule le score de correspondance de la localisation
     */
    calculateLocationScore(candidate, jobOffer) {
        try {
            // Extraire les informations de localisation
            const candidateLocation = this.extractLocation(candidate);
            const jobLocation = this.extractLocation(jobOffer);
            
            // Si l'une des localisations n'est pas spécifiée
            if (!candidateLocation || !jobLocation) {
                return 0.5; // Score moyen par défaut
            }
            
            // Si l'offre est en télétravail complet, la localisation importe moins
            const isRemoteJob = this.isRemoteJob(jobOffer);
            if (isRemoteJob) {
                return 0.9; // Score élevé pour les postes en télétravail
            }
            
            // Vérifier si le candidat est mobile et disposé à déménager
            const isWillingToRelocate = this.isWillingToRelocate(candidate);
            
            // Si les localisations sont identiques
            if (this.areSameLocations(candidateLocation, jobLocation)) {
                return 1.0; // Score parfait pour une correspondance exacte
            }
            
            // Calculer la distance approximative
            const distance = this.calculateDistance(candidateLocation, jobLocation);
            
            // Déterminer le score basé sur la distance
            if (distance <= 10) {
                return 0.95; // Très proche
            } else if (distance <= 30) {
                return 0.8; // Distance raisonnable
            } else if (distance <= 50) {
                return 0.6; // Distance acceptable
            } else if (distance <= 100) {
                return 0.4; // Distance significative
            } else {
                // Pour les longues distances
                if (isWillingToRelocate) {
                    return 0.7; // Score élevé si prêt à déménager
                }
                return 0.2; // Score faible si pas prêt à déménager
            }
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de localisation:', error);
            return 0.5; // Score moyen en cas d'erreur
        }
    }
    
    /**
     * Extrait les informations de localisation
     */
    extractLocation(data) {
        if (!data) return null;
        
        // Coordonnées précises (préférence)
        if (data.locationCoordinates) {
            return data.locationCoordinates;
        }
        
        // Essayer d'obtenir les coordonnées des données parsées
        if (data.parsedData && data.parsedData.location && data.parsedData.location.coordinates) {
            return data.parsedData.location.coordinates;
        }
        
        // Essayer d'obtenir depuis le questionnaire
        if (data.questionnaire && 
            data.questionnaire.jobPreferences && 
            data.questionnaire.jobPreferences.locationCoordinates) {
            return data.questionnaire.jobPreferences.locationCoordinates;
        }
        
        // Utiliser la localisation par nom (moins précis)
        if (data.location) {
            // Convertir en coordonnées approximatives basées sur les grandes villes
            return this.getCityCoordinates(data.location);
        }
        
        return null;
    }
    
    /**
     * Obtient des coordonnées approximatives pour les grandes villes françaises
     */
    getCityCoordinates(locationName) {
        if (!locationName) return null;
        
        const normalizedLocation = locationName.toLowerCase().trim();
        
        // Coordonnées approximatives des grandes villes françaises
        const cityCoordinates = {
            'paris': { lat: 48.8566, lng: 2.3522 },
            'lyon': { lat: 45.7578, lng: 4.8320 },
            'marseille': { lat: 43.2965, lng: 5.3698 },
            'toulouse': { lat: 43.6047, lng: 1.4442 },
            'nice': { lat: 43.7102, lng: 7.2620 },
            'nantes': { lat: 47.2184, lng: -1.5536 },
            'strasbourg': { lat: 48.5734, lng: 7.7521 },
            'montpellier': { lat: 43.6108, lng: 3.8767 },
            'bordeaux': { lat: 44.8378, lng: -0.5792 },
            'lille': { lat: 50.6292, lng: 3.0573 },
            'rennes': { lat: 48.1173, lng: -1.6778 },
            'reims': { lat: 49.2583, lng: 4.0317 },
            'saint-etienne': { lat: 45.4397, lng: 4.3872 },
            'toulon': { lat: 43.1242, lng: 5.9280 },
            'grenoble': { lat: 45.1885, lng: 5.7245 },
            'angers': { lat: 47.4784, lng: -0.5632 },
            'dijon': { lat: 47.3220, lng: 5.0415 },
            'nîmes': { lat: 43.8367, lng: 4.3601 },
            'le mans': { lat: 48.0061, lng: 0.1996 }
        };
        
        // Chercher les correspondances dans les noms de villes
        for (const [city, coords] of Object.entries(cityCoordinates)) {
            if (normalizedLocation.includes(city)) {
                return coords;
            }
        }
        
        // Valeur par défaut (Paris)
        return { lat: 48.8566, lng: 2.3522 };
    }
    
    /**
     * Détermine si les localisations sont identiques
     */
    areSameLocations(loc1, loc2) {
        if (!loc1 || !loc2) return false;
        
        // Si les deux ont des coordonnées exactes
        if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
            // Tolérance de 0.01 degré (environ 1km)
            return Math.abs(loc1.lat - loc2.lat) < 0.01 && 
                   Math.abs(loc1.lng - loc2.lng) < 0.01;
        }
        
        return false;
    }
    
    /**
     * Calcule la distance approximative entre deux points (formule de Haversine)
     */
    calculateDistance(loc1, loc2) {
        if (!loc1 || !loc2 || !loc1.lat || !loc1.lng || !loc2.lat || !loc2.lng) {
            return 9999; // Distance arbitrairement grande
        }
        
        // Rayon de la Terre en km
        const R = 6371;
        
        // Convertir en radians
        const lat1 = this.toRadians(loc1.lat);
        const lng1 = this.toRadians(loc1.lng);
        const lat2 = this.toRadians(loc2.lat);
        const lng2 = this.toRadians(loc2.lng);
        
        // Différences
        const dlat = lat2 - lat1;
        const dlng = lng2 - lng1;
        
        // Formule de Haversine
        const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(dlng/2) * Math.sin(dlng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }
    
    /**
     * Convertit des degrés en radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * Détermine si le candidat est prêt à déménager
     */
    isWillingToRelocate(candidate) {
        if (!candidate) return false;
        
        // Essayer d'extraire des données parsées
        if (candidate.parsedData && 
            candidate.parsedData.availability && 
            candidate.parsedData.availability.normalized) {
            return candidate.parsedData.availability.normalized.relocateWilling === true;
        }
        
        // Essayer d'extraire du questionnaire
        if (candidate.questionnaire && 
            candidate.questionnaire.availability) {
            return candidate.questionnaire.availability.relocateWilling === true;
        }
        
        return false; // Par défaut
    }
    
    /**
     * Détermine si l'offre est en télétravail complet
     */
    isRemoteJob(jobOffer) {
        if (!jobOffer) return false;
        
        // Vérifier le type spécifié
        if (jobOffer.type === 'remote' || jobOffer.type === 'télétravail') {
            return true;
        }
        
        // Vérifier dans le titre ou la description
        if (jobOffer.title && /télétravail|remote|à distance/i.test(jobOffer.title)) {
            return true;
        }
        
        if (jobOffer.description && /100%\s*télétravail|full\s*remote|entièrement à distance/i.test(jobOffer.description)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Calcule le score de correspondance de la préférence de télétravail
     */
    calculateRemoteScore(candidate, jobOffer) {
        try {
            // Extraire les préférences de télétravail
            const candidatePreference = this.extractRemotePreference(candidate);
            const jobRemotePolicy = this.extractRemotePolicy(jobOffer);
            
            // Si les préférences ne sont pas spécifiées
            if (!candidatePreference || !jobRemotePolicy) {
                return 0.7; // Score moyen par défaut
            }
            
            // Matrice de compatibilité télétravail
            const compatibilityMatrix = {
                '100% télétravail': {
                    '100% télétravail': 1.0,
                    'hybride': 0.7,
                    'sur site': 0.3
                },
                'hybride': {
                    '100% télétravail': 0.8,
                    'hybride': 1.0,
                    'sur site': 0.7
                },
                'sur site': {
                    '100% télétravail': 0.4,
                    'hybride': 0.7,
                    'sur site': 1.0
                },
                'peu importe': {
                    '100% télétravail': 0.9,
                    'hybride': 0.9,
                    'sur site': 0.9
                }
            };
            
            // Déterminer le score à partir de la matrice
            if (compatibilityMatrix[candidatePreference] && 
                compatibilityMatrix[candidatePreference][jobRemotePolicy]) {
                return compatibilityMatrix[candidatePreference][jobRemotePolicy];
            }
            
            return 0.7; // Score moyen en cas d'absence dans la matrice
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de télétravail:', error);
            return 0.7; // Score moyen en cas d'erreur
        }
    }
    
    /**
     * Extrait la préférence de télétravail du candidat
     */
    extractRemotePreference(candidate) {
        if (!candidate) return null;
        
        // Essayer d'extraire des données parsées
        if (candidate.parsedData && 
            candidate.parsedData.jobPreferences && 
            candidate.parsedData.jobPreferences.normalized && 
            candidate.parsedData.jobPreferences.normalized.remotePreference) {
            return this.normalizeRemotePreference(candidate.parsedData.jobPreferences.normalized.remotePreference);
        }
        
        // Essayer d'extraire du questionnaire
        if (candidate.questionnaire && 
            candidate.questionnaire.jobPreferences && 
            candidate.questionnaire.jobPreferences.remotePreference) {
            return this.normalizeRemotePreference(candidate.questionnaire.jobPreferences.remotePreference);
        }
        
        // Extraction directe
        if (candidate.remotePreference) {
            return this.normalizeRemotePreference(candidate.remotePreference);
        }
        
        return 'peu importe'; // Valeur par défaut
    }
    
    /**
     * Extrait la politique de télétravail de l'offre
     */
    extractRemotePolicy(jobOffer) {
        if (!jobOffer) return null;
        
        // Vérifier le type spécifié
        if (jobOffer.type === 'remote' || jobOffer.type === 'télétravail') {
            return '100% télétravail';
        }
        
        // Vérifier dans les propriétés spécifiques
        if (jobOffer.remotePolicy) {
            return this.normalizeRemotePreference(jobOffer.remotePolicy);
        }
        
        // Vérifier dans le titre ou la description
        if (jobOffer.title) {
            if (/télétravail|remote|à distance/i.test(jobOffer.title)) {
                return '100% télétravail';
            }
            if (/hybride|hybrid/i.test(jobOffer.title)) {
                return 'hybride';
            }
        }
        
        if (jobOffer.description) {
            if (/100%\s*télétravail|full\s*remote|entièrement à distance/i.test(jobOffer.description)) {
                return '100% télétravail';
            }
            if (/hybride|hybrid|télétravail partiel|jours? de télétravail/i.test(jobOffer.description)) {
                return 'hybride';
            }
            if (/sur site|on site|présentiel complet/i.test(jobOffer.description)) {
                return 'sur site';
            }
        }
        
        return 'sur site'; // Valeur par défaut
    }
    
    /**
     * Normalise les préférences de télétravail
     */
    normalizeRemotePreference(preference) {
        if (!preference) return 'peu importe';
        
        const normalized = String(preference).toLowerCase().trim();
        
        if (/100%|full|complet|total/i.test(normalized) && /télétravail|remote|à distance/i.test(normalized)) {
            return '100% télétravail';
        }
        
        if (/hybride|hybrid|mixte|partiel/i.test(normalized)) {
            return 'hybride';
        }
        
        if (/sur site|on site|présentiel/i.test(normalized)) {
            return 'sur site';
        }
        
        if (/peu importe|indifférent|flexible|flexible|pas de préférence/i.test(normalized)) {
            return 'peu importe';
        }
        
        return 'peu importe'; // Valeur par défaut
    }
    
    /**
     * Calcule le score de correspondance du type de contrat
     */
    calculateContractScore(candidate, jobOffer) {
        try {
            // Extraire les types de contrat
            const candidateContract = this.extractContractType(candidate);
            const jobContract = this.extractContractType(jobOffer);
            
            // Si les préférences ne sont pas spécifiées
            if (!candidateContract || !jobContract) {
                return 0.7; // Score moyen par défaut
            }
            
            // Correspondance exacte
            if (candidateContract === jobContract) {
                return 1.0;
            }
            
            // Matrice de compatibilité des contrats
            const compatibilityMatrix = {
                'cdi': {
                    'cdi': 1.0,
                    'cdd': 0.6,
                    'freelance': 0.4,
                    'stage': 0.2,
                    'alternance': 0.3,
                    'intérim': 0.3
                },
                'cdd': {
                    'cdi': 0.8,
                    'cdd': 1.0,
                    'freelance': 0.5,
                    'stage': 0.2,
                    'alternance': 0.3,
                    'intérim': 0.7
                },
                'freelance': {
                    'cdi': 0.5,
                    'cdd': 0.6,
                    'freelance': 1.0,
                    'stage': 0.2,
                    'alternance': 0.2,
                    'intérim': 0.7
                },
                'stage': {
                    'cdi': 0.3,
                    'cdd': 0.3,
                    'freelance': 0.2,
                    'stage': 1.0,
                    'alternance': 0.7,
                    'intérim': 0.2
                },
                'alternance': {
                    'cdi': 0.4,
                    'cdd': 0.4,
                    'freelance': 0.2,
                    'stage': 0.7,
                    'alternance': 1.0,
                    'intérim': 0.2
                },
                'intérim': {
                    'cdi': 0.3,
                    'cdd': 0.7,
                    'freelance': 0.6,
                    'stage': 0.2,
                    'alternance': 0.2,
                    'intérim': 1.0
                }
            };
            
            // Déterminer le score à partir de la matrice
            if (compatibilityMatrix[candidateContract] && 
                compatibilityMatrix[candidateContract][jobContract]) {
                return compatibilityMatrix[candidateContract][jobContract];
            }
            
            return 0.5; // Score moyen en cas d'absence dans la matrice
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de type de contrat:', error);
            return 0.5; // Score moyen en cas d'erreur
        }
    }
    
    /**
     * Extrait le type de contrat
     */
    extractContractType(data) {
        if (!data) return null;
        
        // Essayer d'extraire des données parsées
        if (data.parsedData && 
            data.parsedData.jobPreferences && 
            data.parsedData.jobPreferences.normalized && 
            data.parsedData.jobPreferences.normalized.contractType) {
            return this.normalizeContractType(data.parsedData.jobPreferences.normalized.contractType);
        }
        
        // Essayer d'extraire du questionnaire
        if (data.questionnaire && 
            data.questionnaire.jobPreferences && 
            data.questionnaire.jobPreferences.contractType) {
            return this.normalizeContractType(data.questionnaire.jobPreferences.contractType);
        }
        
        // Extraction directe
        if (data.contractType) {
            return this.normalizeContractType(data.contractType);
        }
        
        // Extraire du type pour les offres d'emploi
        if (data.type) {
            return this.normalizeContractType(data.type);
        }
        
        return 'cdi'; // Valeur par défaut
    }
    
    /**
     * Normalise les types de contrat
     */
    normalizeContractType(contractType) {
        if (!contractType) return 'cdi';
        
        const normalized = String(contractType).toLowerCase().trim();
        
        if (/cdi|indéterminée|indeterminee/i.test(normalized)) {
            return 'cdi';
        }
        
        if (/cdd|déterminée|determinee/i.test(normalized)) {
            return 'cdd';
        }
        
        if (/freelance|consultant|indépendant|independant/i.test(normalized)) {
            return 'freelance';
        }
        
        if (/stage|intern/i.test(normalized)) {
            return 'stage';
        }
        
        if (/alternance|apprentissage/i.test(normalized)) {
            return 'alternance';
        }
        
        if (/intérim|interim|temporaire/i.test(normalized)) {
            return 'intérim';
        }
        
        return 'cdi'; // Valeur par défaut
    }
    
    /**
     * Calcule le score de correspondance du salaire
     */
    calculateSalaryScore(candidate, jobOffer) {
        try {
            // Extraire les fourchettes de salaire
            const candidateSalary = this.extractSalaryRange(candidate);
            const jobSalary = this.extractSalaryRange(jobOffer);
            
            // Si les salaires ne sont pas spécifiés
            if (!candidateSalary || !jobSalary) {
                return 0.7; // Score moyen par défaut
            }
            
            // Si les périodes sont différentes, convertir en annuel
            const candidateAnnual = this.convertToAnnual(candidateSalary);
            const jobAnnual = this.convertToAnnual(jobSalary);
            
            // Vérifier si le salaire du candidat correspond à celui de l'offre
            // Si le candidat n'a pas de minimum, supposer qu'il est flexible
            if (candidateAnnual.min === null) {
                return 0.8;
            }
            
            // Si l'offre n'a pas de maximum, considérer qu'elle est négociable en fonction de l'expérience
            if (jobAnnual.max === null) {
                return candidateAnnual.min <= jobAnnual.min * 1.2 ? 0.9 : 0.6;
            }
            
            // Vérifier la compatibilité des fourchettes
            // Cas 1: La demande du candidat est inférieure à ce que propose l'offre
            if (candidateAnnual.min <= jobAnnual.min && 
                (candidateAnnual.max === null || candidateAnnual.max <= jobAnnual.max)) {
                return 1.0; // Match parfait
            }
            
            // Cas 2: La demande du candidat est légèrement supérieure mais dans la marge acceptable
            if (candidateAnnual.min <= jobAnnual.max * 1.1) {
                // Calculer un score basé sur le chevauchement
                if (candidateAnnual.min <= jobAnnual.max) {
                    const overlap = jobAnnual.max - candidateAnnual.min;
                    const candidateRange = (candidateAnnual.max || candidateAnnual.min * 1.2) - candidateAnnual.min;
                    return Math.min(1.0, Math.max(0.6, overlap / candidateRange));
                }
                return 0.7; // Légèrement hors fourchette mais négociable
            }
            
            // Cas 3: La demande du candidat est significativement supérieure à l'offre
            return Math.max(0.3, 1 - ((candidateAnnual.min - jobAnnual.max) / jobAnnual.max));
            
        } catch (error) {
            console.error('Erreur lors du calcul du score de salaire:', error);
            return 0.5; // Score moyen en cas d'erreur
        }
    }
    
    /**
     * Extrait la fourchette de salaire
     */
    extractSalaryRange(data) {
        if (!data) return null;
        
        // Essayer d'extraire des données parsées
        if (data.parsedData && 
            data.parsedData.jobPreferences && 
            data.parsedData.jobPreferences.normalized && 
            data.parsedData.jobPreferences.normalized.salaryExpectation) {
            return data.parsedData.jobPreferences.normalized.salaryExpectation;
        }
        
        // Essayer d'extraire du questionnaire
        if (data.questionnaire && 
            data.questionnaire.jobPreferences && 
            data.questionnaire.jobPreferences.salaryExpectation) {
            
            const salaryText = data.questionnaire.jobPreferences.salaryExpectation;
            return this.parseSalaryText(salaryText);
        }
        
        // Extraction directe d'une propriété salaryExpectation
        if (data.salaryExpectation) {
            return this.parseSalaryText(data.salaryExpectation);
        }
        
        // Extraction directe d'une propriété salary
        if (data.salary) {
            return this.parseSalaryText(data.salary);
        }
        
        return null;
    }
    
    /**
     * Extrait les valeurs numériques d'un texte de salaire
     */
    parseSalaryText(salaryText) {
        if (!salaryText) return null;
        
        const normalized = String(salaryText).toLowerCase().trim();
        
        // Détecter la devise
        let currency = 'EUR';
        if (normalized.includes('$') || normalized.includes('usd')) {
            currency = 'USD';
        } else if (normalized.includes('£') || normalized.includes('gbp')) {
            currency = 'GBP';
        }
        
        // Détecter la période
        let period = 'yearly';
        if (/mois|mensuel|month|monthly/i.test(normalized)) {
            period = 'monthly';
        } else if (/jour|daily|day/i.test(normalized)) {
            period = 'daily';
        } else if (/heure|horaire|hour|hourly/i.test(normalized)) {
            period = 'hourly';
        }
        
        // Extraire les valeurs numériques
        const numbers = normalized.match(/\d+[,.]?\d*/g);
        if (!numbers || numbers.length === 0) {
            return null;
        }
        
        // Convertir les valeurs k€ ou k$
        const values = numbers.map(n => {
            let value = parseFloat(n.replace(',', '.'));
            if (/k|k€|k\$/.test(normalized)) {
                value *= 1000;
            }
            return value;
        });
        
        // Déterminer min et max
        let min = null, max = null;
        
        if (values.length === 1) {
            min = values[0];
        } else if (values.length >= 2) {
            min = Math.min(...values);
            max = Math.max(...values);
        }
        
        return {
            min,
            max,
            currency,
            period
        };
    }
    
    /**
     * Convertit une fourchette de salaire en valeur annuelle
     */
    convertToAnnual(salaryRange) {
        if (!salaryRange) return { min: null, max: null };
        
        const { min, max, currency, period } = salaryRange;
        
        // Facteurs de conversion en valeur annuelle
        const periodFactors = {
            'hourly': 35 * 52, // 35h par semaine, 52 semaines
            'daily': 220,     // 220 jours travaillés par an
            'monthly': 12      // 12 mois par an
        };
        
        // Facteurs de conversion des devises en euros (approximatifs)
        const currencyFactors = {
            'USD': 0.85,
            'GBP': 1.15,
            'EUR': 1.0
        };
        
        // Convertir en valeur annuelle
        const factor = (periodFactors[period] || 1) * (currencyFactors[currency] || 1);
        
        return {
            min: min !== null ? min * factor : null,
            max: max !== null ? max * factor : null
        };
    }
    
    /**
     * Génère des explications textuelles pour le score de matching
     */
    generateExplanations(details, isRelevant) {
        const explanations = [];
        
        // Explication globale
        if (isRelevant) {
            explanations.push({
                type: 'global',
                text: 'Cette offre correspond bien à votre profil, avec une compatibilité particulièrement forte sur certains critères clés.'
            });
        } else {
            explanations.push({
                type: 'global',
                text: 'Cette offre ne correspond que partiellement à votre profil, avec certains écarts sur des critères importants.'
            });
        }
        
        // Explication des compétences
        const skillsDetail = details.skills;
        if (skillsDetail.score >= 80) {
            explanations.push({
                type: 'skills',
                text: `Vos compétences correspondent très bien à celles requises (${skillsDetail.score}%).`,
                matchedSkills: skillsDetail.matchedSkills,
                missingSkills: skillsDetail.missingSkills
            });
        } else if (skillsDetail.score >= 60) {
            explanations.push({
                type: 'skills',
                text: `Vous possédez une bonne partie des compétences requises (${skillsDetail.score}%).`,
                matchedSkills: skillsDetail.matchedSkills,
                missingSkills: skillsDetail.missingSkills
            });
        } else {
            explanations.push({
                type: 'skills',
                text: `Certaines compétences requises pour ce poste semblent manquantes (${skillsDetail.score}%).`,
                matchedSkills: skillsDetail.matchedSkills,
                missingSkills: skillsDetail.missingSkills
            });
        }
        
        // Explication de l'expérience
        const experienceDetail = details.experience;
        if (experienceDetail.score >= 80) {
            explanations.push({
                type: 'experience',
                text: `Votre niveau d'expérience correspond très bien aux attentes (${experienceDetail.score}%).`
            });
        } else if (experienceDetail.score >= 60) {
            explanations.push({
                type: 'experience',
                text: `Votre expérience est proche de ce qui est demandé (${experienceDetail.score}%).`
            });
        } else if (experienceDetail.score >= 40) {
            explanations.push({
                type: 'experience',
                text: `Votre niveau d'expérience est légèrement en-dessous des attentes (${experienceDetail.score}%).`
            });
        } else {
            explanations.push({
                type: 'experience',
                text: `Votre niveau d'expérience semble insuffisant pour ce poste (${experienceDetail.score}%).`
            });
        }
        
        // Explication de la localisation
        const locationDetail = details.location;
        if (locationDetail.score >= 90) {
            explanations.push({
                type: 'location',
                text: `La localisation du poste est idéale par rapport à votre situation.`
            });
        } else if (locationDetail.score >= 70) {
            explanations.push({
                type: 'location',
                text: `La distance domicile-travail est raisonnable (environ ${Math.round(locationDetail.distance)} km).`
            });
        } else if (locationDetail.score >= 50) {
            explanations.push({
                type: 'location',
                text: `La localisation du poste nécessiterait un temps de trajet significatif (environ ${Math.round(locationDetail.distance)} km).`
            });
        } else {
            explanations.push({
                type: 'location',
                text: `La localisation du poste est éloignée de votre position actuelle (environ ${Math.round(locationDetail.distance)} km).`
            });
        }
        
        // Explication du salaire
        const salaryDetail = details.salary;
        const candidateSalary = salaryDetail.candidateSalary;
        const offerSalary = salaryDetail.offerSalary;
        
        if (salaryDetail.score >= 90) {
            explanations.push({
                type: 'salary',
                text: `Les prétentions salariales sont parfaitement alignées.`
            });
        } else if (salaryDetail.score >= 70) {
            explanations.push({
                type: 'salary',
                text: `Le salaire proposé correspond globalement à vos attentes, avec une légère différence.`
            });
        } else if (salaryDetail.score >= 50) {
            explanations.push({
                type: 'salary',
                text: `Il existe un écart modéré entre votre prétention salariale et ce qui est proposé.`
            });
        } else {
            explanations.push({
                type: 'salary',
                text: `Il existe un écart important entre votre prétention salariale et ce qui est proposé.`
            });
        }
        
        return explanations;
    }
    
    /**
     * Filtre les offres pour ne conserver que les 10 meilleures correspondances
     */
    filterTopMatches(candidate, jobOffers, limit = 10) {
        if (!candidate || !jobOffers || !Array.isArray(jobOffers)) {
            return [];
        }
        
        try {
            // Calculer les scores pour toutes les offres
            const scoredOffers = jobOffers.map(offer => {
                const matchResult = this.calculateMatchingScore(candidate, offer);
                return {
                    ...offer,
                    matchingScore: matchResult.totalScore,
                    matchingDetails: matchResult.details,
                    isRelevant: matchResult.isRelevant,
                    explanations: matchResult.explanations
                };
            });
            
            // Filtrer les offres pertinentes
            const relevantOffers = scoredOffers.filter(offer => 
                offer.isRelevant || offer.matchingScore >= this.relevanceThreshold * 100
            );
            
            // Trier par score décroissant
            relevantOffers.sort((a, b) => b.matchingScore - a.matchingScore);
            
            // Limiter au nombre demandé
            return relevantOffers.slice(0, limit);
            
        } catch (error) {
            console.error('Erreur lors du filtrage des offres:', error);
            return [];
        }
    }
}

// Exporter la classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatchingAlgorithm;
} else if (typeof window !== 'undefined') {
    window.MatchingAlgorithm = MatchingAlgorithm;
}