import re
import json
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional, Union
from concurrent.futures import ThreadPoolExecutor

# Version simplifiée sans dépendance à spaCy pour faciliter le déploiement
class TextNormalizer:
    """Classe pour normaliser les textes et corriger les erreurs courantes"""
    
    # Dictionnaire de corrections pour les erreurs fréquentes
    CORRECTIONS = {
        "js": "JavaScript",
        "react": "React",
        "react.js": "React",
        "reactjs": "React",
        "node": "Node.js",
        "nodejs": "Node.js",
        "node.js": "Node.js",
        "typescript": "TypeScript",
        "ts": "TypeScript",
        "python": "Python",
        "php": "PHP",
        "css": "CSS",
        "css3": "CSS",
        "html": "HTML",
        "html5": "HTML",
        "postgresql": "PostgreSQL",
        "postgre": "PostgreSQL",
        "mysql": "MySQL",
        "mongodb": "MongoDB",
        "mongo": "MongoDB",
        "nosql": "NoSQL",
        "cdi": "CDI",
        "cdd": "CDD",
        "freelance": "Freelance",
        "remote": "Télétravail",
        "teletravail": "Télétravail",
        "télétravail": "Télétravail",
        "onsite": "Sur site",
        "sur site": "Sur site",
        # Corrections pour les options de disponibilité
        "en poste": "oui",
        "actuellement en poste": "oui",
        "sans emploi": "non",
        "au chômage": "non",
        "chomage": "non",
        # Corrections pour les raisons de recherche
        "salaire": "Rémunération trop faible",
        "pas assez payé": "Rémunération trop faible",
        "trop peu payé": "Rémunération trop faible",
        "evolution": "Manque de perspectives d'évolutions",
        "évolution": "Manque de perspectives d'évolutions",
        "pas d'évolution": "Manque de perspectives d'évolutions",
        "loin de chez moi": "Poste trop loin de mon domicile",
        "trop de trajet": "Poste trop loin de mon domicile",
        "temps de trajet": "Poste trop loin de mon domicile",
        "trop de transport": "Poste trop loin de mon domicile",
        # Corrections pour le préavis
        "pas de préavis": "Je n'en ai pas, encore en période d'essai",
        "période d'essai": "Je n'en ai pas, encore en période d'essai",
        "periode essai": "Je n'en ai pas, encore en période d'essai",
        "1 mois": "1 mois",
        "2 mois": "2 mois",
        "3 mois": "3 mois"
    }
    
    @classmethod
    def clean_text(cls, text: str) -> str:
        """Nettoie et normalise le texte"""
        if not text or not isinstance(text, str):
            return ""
        
        # Convertir en minuscule et supprimer les espaces en trop
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)
        return text
    
    @classmethod
    def correct_common_errors(cls, text: str) -> str:
        """Corrige les erreurs courantes et normalise les termes"""
        if not text:
            return ""
        
        cleaned_text = cls.clean_text(text)
        
        # Trouver les correspondances dans le dictionnaire de corrections
        for error, correction in cls.CORRECTIONS.items():
            # Utiliser une regex pour trouver le mot entier
            pattern = r'\b' + re.escape(error) + r'\b'
            cleaned_text = re.sub(pattern, correction, cleaned_text, flags=re.IGNORECASE)
        
        return cleaned_text

    @classmethod
    def extract_key_terms(cls, text: str) -> List[str]:
        """Extrait les termes clés d'un texte en utilisant une approche simple"""
        if not text:
            return []
        
        # Liste de mots vides en français
        stop_words = ["le", "la", "les", "un", "une", "des", "et", "ou", "mais", "donc", 
                      "car", "à", "au", "aux", "ce", "ces", "cette", "cet", "de", "du", 
                      "en", "par", "pour", "sur", "je", "tu", "il", "elle", "nous", "vous", 
                      "ils", "elles", "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", 
                      "ses", "notre", "votre", "leur", "nos", "vos", "leurs"]
        
        clean_text = cls.clean_text(text)
        
        # Tokenisation simple
        tokens = re.findall(r'\b\w+\b', clean_text)
        
        # Filtrer les mots vides et les mots trop courts
        key_terms = [term for term in tokens if len(term) > 2 and term not in stop_words]
        
        return key_terms


class CategoryClassifier:
    """Classe pour classifier les réponses dans des catégories spécifiques"""
    
    # Définition des catégories et termes associés
    CATEGORIES = {
        "experience": [
            "ans", "experience", "expérience", "senior", "junior", "débutant", 
            "confirmé", "expert", "intermédiaire", "avancé", "niveau"
        ],
        "disponibilite": [
            "disponible", "disponibilité", "immédiatement", "immédiate", "préavis", 
            "preavis", "délai", "attente", "commencer", "débuter"
        ],
        "localisation": [
            "ville", "région", "département", "adresse", "localité", "zone", 
            "domicile", "habite", "distance", "kilomètres", "km"
        ],
        "salaire": [
            "salaire", "rémunération", "remuneration", "package", "brut", "net", 
            "annuel", "mensuel", "k€", "keur", "ke", "euros", "€", "prétention"
        ],
        "competences_techniques": [
            "compétence", "competence", "technique", "langage", "framework", 
            "outil", "technologie", "logiciel", "maîtrise", "maitrise", "niveau"
        ],
        "competences_humaines": [
            "soft skill", "softskill", "qualité", "qualite", "humaine", "communication", 
            "équipe", "equipe", "collaboration", "autonomie", "adaptabilité"
        ],
    }
    
    @classmethod
    def classify_response(cls, response: str) -> List[str]:
        """Classifie une réponse dans une ou plusieurs catégories"""
        if not response:
            return []
        
        clean_response = TextNormalizer.clean_text(response)
        categories = []
        
        # Vérifier chaque catégorie
        for category, terms in cls.CATEGORIES.items():
            for term in terms:
                if term in clean_response:
                    categories.append(category)
                    break
        
        return list(set(categories))
    
    @classmethod
    def get_confidence_scores(cls, response: str) -> Dict[str, float]:
        """Retourne un score de confiance pour chaque catégorie"""
        if not response:
            return {category: 0.0 for category in cls.CATEGORIES}
        
        clean_response = TextNormalizer.clean_text(response)
        scores = {}
        
        # Vectoriser les termes et la réponse
        for category, terms in cls.CATEGORIES.items():
            # Calculer le nombre de correspondances
            matches = sum(1 for term in terms if term in clean_response)
            # Score normalisé entre 0 et 1
            scores[category] = min(matches / max(len(terms) * 0.3, 1), 1.0)
        
        return scores


class ResponseParser:
    """Classe principale pour analyser les réponses du questionnaire"""
    
    def __init__(self):
        self.normalizer = TextNormalizer
        self.classifier = CategoryClassifier
        
    def parse_candidate_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et structure les réponses d'un candidat"""
        if not response_data:
            return {}
        
        # Traiter les différentes sections en parallèle pour améliorer les performances
        with ThreadPoolExecutor(max_workers=4) as executor:
            # Lancer le traitement en parallèle pour chaque section
            job_prefs_future = executor.submit(self._parse_job_preferences, 
                                               response_data.get('jobPreferences', {}))
            skills_future = executor.submit(self._parse_skills, 
                                            response_data.get('skills', {}))
            availability_future = executor.submit(self._parse_availability, 
                                                 response_data.get('availability', {}))
            additional_future = executor.submit(self._parse_additional, 
                                               response_data.get('additional', {}))
            
            # Récupérer les résultats
            parsed_job_prefs = job_prefs_future.result()
            parsed_skills = skills_future.result()
            parsed_availability = availability_future.result()
            parsed_additional = additional_future.result()
        
        # Assembler le résultat final
        parsed_data = {
            'jobPreferences': parsed_job_prefs,
            'skills': parsed_skills,
            'availability': parsed_availability,
            'additional': parsed_additional,
            'metadata': {
                'parsedDate': pd.Timestamp.now().isoformat(),
                'dataQuality': self._calculate_data_quality(parsed_job_prefs, 
                                                           parsed_skills, 
                                                           parsed_availability, 
                                                           parsed_additional)
            }
        }
        
        # Vérification de cohérence
        inconsistencies = self._check_data_consistency(parsed_data)
        if inconsistencies:
            parsed_data['metadata']['inconsistencies'] = inconsistencies
        
        # Tags pour faciliter le matching
        parsed_data['tags'] = self._generate_matching_tags(parsed_data)
        
        return parsed_data
        
    def _parse_job_preferences(self, job_prefs: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et structure les préférences professionnelles"""
        if not job_prefs:
            return {
                'preferredRole': None,
                'contractType': None,
                'location': None,
                'remotePreference': None,
                'salaryExpectation': None,
                'normalized': {}
            }
        
        # Normaliser les valeurs
        normalized = {
            'preferredRole': self.normalizer.clean_text(job_prefs.get('preferredRole', '')),
            'contractType': self.normalizer.correct_common_errors(job_prefs.get('contractType', '')),
            'location': self.normalizer.clean_text(job_prefs.get('location', '')),
            'remotePreference': self.normalizer.correct_common_errors(job_prefs.get('remotePreference', '')),
            'salaryExpectation': self._normalize_salary(job_prefs.get('salaryExpectation', ''))
        }
        
        # Structurer le résultat
        result = {
            'preferredRole': job_prefs.get('preferredRole'),
            'contractType': job_prefs.get('contractType'),
            'location': job_prefs.get('location'),
            'formattedLocation': job_prefs.get('formattedLocation'),
            'locationCoordinates': job_prefs.get('locationCoordinates'),
            'remotePreference': job_prefs.get('remotePreference'),
            'salaryExpectation': job_prefs.get('salaryExpectation'),
            'startDate': job_prefs.get('startDate'),
            'normalized': normalized
        }
        
        return result
    
    def _normalize_salary(self, salary_text: str) -> Dict[str, Any]:
        """Normalise et structure les informations de salaire"""
        if not salary_text:
            return {'min': None, 'max': None, 'currency': 'EUR', 'period': 'yearly'}
        
        # Nettoyer le texte
        salary_text = self.normalizer.clean_text(salary_text)
        
        # Extraire les valeurs numériques
        numbers = re.findall(r'\d+[.,]?\d*', salary_text)
        
        # Déterminer la devise
        currency = 'EUR'
        if '€' in salary_text or 'eur' in salary_text:
            currency = 'EUR'
        elif '$' in salary_text or 'usd' in salary_text:
            currency = 'USD'
        elif '£' in salary_text or 'gbp' in salary_text:
            currency = 'GBP'
        
        # Déterminer la période
        period = 'yearly'
        if 'mois' in salary_text or 'mensuel' in salary_text:
            period = 'monthly'
        elif 'jour' in salary_text or 'daily' in salary_text:
            period = 'daily'
        elif 'heure' in salary_text or 'hourly' in salary_text:
            period = 'hourly'
        
        # Traiter les valeurs K€
        if 'k' in salary_text.lower() or 'k€' in salary_text.lower():
            numbers = [float(n.replace(',', '.')) * 1000 for n in numbers]
        
        # Déduire min et max
        min_salary = None
        max_salary = None
        
        if numbers:
            if len(numbers) >= 2:
                min_salary = min(map(float, numbers))
                max_salary = max(map(float, numbers))
            else:
                # Si une seule valeur, considérer comme valeur minimale
                min_salary = float(numbers[0])
        
        return {
            'min': min_salary,
            'max': max_salary,
            'currency': currency,
            'period': period
        }
        
    def _parse_skills(self, skills_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et structure les compétences"""
        if not skills_data:
            return {
                'technicalSkills': [],
                'softSkills': [],
                'languages': [],
                'normalized': {}
            }
        
        # Normaliser les compétences techniques
        tech_skills = skills_data.get('technicalSkills', [])
        normalized_tech_skills = []
        
        for skill in tech_skills:
            # Normaliser chaque compétence
            normalized_skill = self.normalizer.correct_common_errors(skill)
            if normalized_skill:
                normalized_tech_skills.append(normalized_skill)
        
        # Normaliser les niveaux de compétence
        skill_levels = {}
        raw_skill_levels = skills_data.get('technicalSkillLevels', {})
        
        for skill, level in raw_skill_levels.items():
            # Normaliser le nom de la compétence
            normalized_skill = self.normalizer.correct_common_errors(skill)
            # Normaliser le niveau
            normalized_level = self._normalize_skill_level(level)
            
            if normalized_skill and normalized_level:
                skill_levels[normalized_skill] = normalized_level
        
        # Normaliser les soft skills
        soft_skills = skills_data.get('softSkills', [])
        normalized_soft_skills = []
        
        for skill in soft_skills:
            normalized_skill = self.normalizer.clean_text(skill)
            if normalized_skill:
                normalized_soft_skills.append(normalized_skill)
        
        # Normaliser les langues
        languages = skills_data.get('languages', [])
        normalized_languages = []
        
        for lang in languages:
            lang_info = self._parse_language(lang)
            if lang_info:
                normalized_languages.append(lang_info)
        
        # Structurer le résultat
        result = {
            'technicalSkills': skills_data.get('technicalSkills', []),
            'softSkills': skills_data.get('softSkills', []),
            'languages': skills_data.get('languages', []),
            'certifications': skills_data.get('certifications', []),
            'normalized': {
                'technicalSkills': normalized_tech_skills,
                'technicalSkillLevels': skill_levels,
                'softSkills': normalized_soft_skills,
                'languages': normalized_languages
            }
        }
        
        return result
    
    def _normalize_skill_level(self, level: str) -> Dict[str, Any]:
        """Normalise un niveau de compétence"""
        if not level:
            return {'level': 'Non spécifié', 'value': 0}
        
        # Nettoyer le texte
        level = self.normalizer.clean_text(level)
        
        # Mapper le niveau à une valeur numérique
        level_map = {
            'débutant': {'level': 'Débutant', 'value': 1},
            'notions': {'level': 'Débutant', 'value': 1},
            'basique': {'level': 'Débutant', 'value': 1},
            'basic': {'level': 'Débutant', 'value': 1},
            'intermédiaire': {'level': 'Intermédiaire', 'value': 2},
            'intermediaire': {'level': 'Intermédiaire', 'value': 2},
            'avancé': {'level': 'Avancé', 'value': 3},
            'avance': {'level': 'Avancé', 'value': 3},
            'confirmé': {'level': 'Avancé', 'value': 3},
            'confirme': {'level': 'Avancé', 'value': 3},
            'expert': {'level': 'Expert', 'value': 4},
            'maître': {'level': 'Expert', 'value': 4},
            'maitre': {'level': 'Expert', 'value': 4}
        }
        
        # Rechercher dans les correspondances
        for key, val in level_map.items():
            if key in level:
                return val
        
        # Valeur par défaut
        return {'level': level.capitalize(), 'value': 0}
    
    def _parse_language(self, language: str) -> Dict[str, Any]:
        """Parse et structure une compétence linguistique"""
        if not language:
            return None
        
        # Nettoyer le texte
        lang_text = self.normalizer.clean_text(language)
        
        # Extraire le niveau si présent (ex: "Anglais - B2" ou "Anglais (courant)")
        level_pattern = r'(.*?)[\s-]+\(?([A-C][1-2]|débutant|intermédiaire|avancé|courant|bilingue|natif)\)?'
        match = re.match(level_pattern, lang_text, re.IGNORECASE)
        
        if match:
            lang_name = match.group(1).strip()
            level_text = match.group(2).lower()
            
            # Normaliser le niveau
            level = self._normalize_language_level(level_text)
            
            return {
                'language': lang_name.capitalize(),
                'level': level['level'],
                'value': level['value'],
                'cefr': level.get('cefr')
            }
        else:
            # Si pas de niveau spécifié
            return {
                'language': lang_text.capitalize(),
                'level': 'Non spécifié',
                'value': 0,
                'cefr': None
            }
    
    def _normalize_language_level(self, level: str) -> Dict[str, Any]:
        """Normalise un niveau de langue"""
        if not level:
            return {'level': 'Non spécifié', 'value': 0}
        
        # Nettoyer le texte
        level = level.lower().strip()
        
        # Mapper le niveau à une valeur normalisée
        level_map = {
            'a1': {'level': 'Débutant', 'value': 1, 'cefr': 'A1'},
            'a2': {'level': 'Élémentaire', 'value': 2, 'cefr': 'A2'},
            'b1': {'level': 'Intermédiaire', 'value': 3, 'cefr': 'B1'},
            'b2': {'level': 'Avancé', 'value': 4, 'cefr': 'B2'},
            'c1': {'level': 'Autonome', 'value': 5, 'cefr': 'C1'},
            'c2': {'level': 'Maîtrise', 'value': 6, 'cefr': 'C2'},
            'débutant': {'level': 'Débutant', 'value': 1, 'cefr': 'A1'},
            'elementaire': {'level': 'Élémentaire', 'value': 2, 'cefr': 'A2'},
            'intermédiaire': {'level': 'Intermédiaire', 'value': 3, 'cefr': 'B1'},
            'intermediaire': {'level': 'Intermédiaire', 'value': 3, 'cefr': 'B1'},
            'avancé': {'level': 'Avancé', 'value': 4, 'cefr': 'B2'},
            'avance': {'level': 'Avancé', 'value': 4, 'cefr': 'B2'},
            'courant': {'level': 'Autonome', 'value': 5, 'cefr': 'C1'},
            'bilingue': {'level': 'Maîtrise', 'value': 6, 'cefr': 'C2'},
            'natif': {'level': 'Langue maternelle', 'value': 7, 'cefr': 'Native'}
        }
        
        # Rechercher dans les correspondances
        for key, val in level_map.items():
            if key in level:
                return val
        
        # Valeur par défaut
        return {'level': level.capitalize(), 'value': 0}
    
    def _parse_availability(self, availability_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et structure les informations de disponibilité"""
        if not availability_data:
            return {
                'currentlyEmployed': None,
                'interviewAvailability': None,
                'normalized': {}
            }
        
        # Déterminer le statut d'emploi
        currently_employed = availability_data.get('currentlyEmployed')
        normalized_employed = self.normalizer.clean_text(currently_employed)
        
        # Normaliser les raisons de recherche ou de fin de contrat
        job_search_reason = None
        job_end_reason = None
        
        if normalized_employed == 'oui':
            job_search_reason = availability_data.get('jobSearchReason')
            normalized_reason = self.normalizer.correct_common_errors(job_search_reason)
        elif normalized_employed == 'non':
            job_end_reason = availability_data.get('jobEndReason')
            normalized_reason = self.normalizer.correct_common_errors(job_end_reason)
        else:
            normalized_reason = None
        
        # Normaliser le préavis
        notice_period = availability_data.get('noticePeriod')
        normalized_notice = None
        
        if notice_period:
            normalized_notice = self.normalizer.correct_common_errors(notice_period)
        
        # Structure le résultat
        result = {
            'currentlyEmployed': availability_data.get('currentlyEmployed'),
            'interviewAvailability': availability_data.get('interviewAvailability'),
            'recruitmentStatus': availability_data.get('recruitmentStatus'),
            'relocateWilling': availability_data.get('relocateWilling'),
            'normalized': {
                'currentlyEmployed': 'oui' if normalized_employed == 'oui' else 'non' if normalized_employed == 'non' else None,
                'jobSearchReason': normalized_reason if normalized_employed == 'oui' else None,
                'jobEndReason': normalized_reason if normalized_employed == 'non' else None,
                'noticePeriod': normalized_notice,
                'noticeNegotiable': availability_data.get('noticeNegotiable'),
                'relocateWilling': availability_data.get('relocateWilling')
            }
        }
        
        # Ajouter les champs spécifiques au statut d'emploi
        if normalized_employed == 'oui':
            result['jobSearchReason'] = job_search_reason
            result['noticePeriod'] = notice_period
            result['noticeNegotiable'] = availability_data.get('noticeNegotiable')
        elif normalized_employed == 'non':
            result['jobEndReason'] = job_end_reason
        
        return result
    
    def _parse_additional(self, additional_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse et structure les informations complémentaires"""
        if not additional_data:
            return {
                'motivation': None,
                'strengths': None,
                'normalized': {}
            }
        
        # Extraire les termes clés des textes longs
        motivation_terms = self.normalizer.extract_key_terms(additional_data.get('motivation', ''))
        strengths_terms = self.normalizer.extract_key_terms(additional_data.get('strengths', ''))
        challenges_terms = self.normalizer.extract_key_terms(additional_data.get('challenges', ''))
        
        # Structurer le résultat
        result = {
            'motivation': additional_data.get('motivation'),
            'strengths': additional_data.get('strengths'),
            'challenges': additional_data.get('challenges'),
            'additionalInfo': additional_data.get('additionalInfo'),
            'priorities': additional_data.get('priorities'),
            'normalized': {
                'keyTerms': {
                    'motivation': motivation_terms,
                    'strengths': strengths_terms,
                    'challenges': challenges_terms
                },
                'priorities': self._normalize_priorities(additional_data.get('priorities', {}))
            }
        }
        
        return result
    
    def _normalize_priorities(self, priorities: Dict[str, Any]) -> Dict[str, int]:
        """Normalise les priorités du candidat"""
        if not priorities:
            return {}
        
        normalized = {}
        
        # Normaliser les clés et valeurs
        for key, value in priorities.items():
            normalized_key = self.normalizer.clean_text(key)
            if isinstance(value, (int, float)):
                normalized[normalized_key] = int(value)
            else:
                try:
                    normalized[normalized_key] = int(value)
                except (ValueError, TypeError):
                    normalized[normalized_key] = 0
        
        return normalized
    
    def _calculate_data_quality(self, job_prefs: Dict, skills: Dict, 
                               availability: Dict, additional: Dict) -> Dict[str, float]:
        """Calcule la qualité des données pour chaque section"""
        quality = {}
        
        # Calculer la qualité des préférences professionnelles
        if job_prefs:
            # Vérifier le remplissage des champs clés
            job_prefs_fields = ['preferredRole', 'contractType', 'location', 'remotePreference', 'salaryExpectation']
            filled_fields = sum(1 for field in job_prefs_fields if job_prefs.get(field))
            quality['jobPreferences'] = min(filled_fields / len(job_prefs_fields), 1.0)
        else:
            quality['jobPreferences'] = 0.0
        
        # Calculer la qualité des compétences
        if skills:
            has_technical = bool(skills.get('technicalSkills'))
            has_soft = bool(skills.get('softSkills'))
            has_languages = bool(skills.get('languages'))
            
            quality['skills'] = (has_technical + has_soft + has_languages) / 3
        else:
            quality['skills'] = 0.0
        
        # Calculer la qualité des informations de disponibilité
        if availability:
            has_employment_status = bool(availability.get('currentlyEmployed'))
            has_interview_availability = bool(availability.get('interviewAvailability'))
            has_reason = bool(availability.get('jobSearchReason') or availability.get('jobEndReason'))
            
            quality['availability'] = (has_employment_status + has_interview_availability + has_reason) / 3
        else:
            quality['availability'] = 0.0
        
        # Calculer la qualité des informations complémentaires
        if additional:
            has_motivation = bool(additional.get('motivation'))
            has_strengths = bool(additional.get('strengths'))
            
            quality['additional'] = (has_motivation + has_strengths) / 2
        else:
            quality['additional'] = 0.0
        
        # Qualité globale
        quality['overall'] = (quality['jobPreferences'] + quality['skills'] + 
                             quality['availability'] + quality['additional']) / 4
        
        return quality
    
    def _check_data_consistency(self, parsed_data: Dict) -> List[Dict[str, str]]:
        """Vérifie la cohérence des données"""
        inconsistencies = []
        
        # Vérifier la cohérence entre l'expérience et le niveau
        if parsed_data.get('jobPreferences') and parsed_data.get('skills'):
            pref_role = parsed_data['jobPreferences'].get('preferredRole', '')
            tech_skills = parsed_data['skills'].get('technicalSkills', [])
            
            # Vérifier si le poste demandé est cohérent avec les compétences
            if pref_role and tech_skills:
                skills_text = ' '.join(tech_skills).lower()
                role_lower = pref_role.lower()
                
                # Incohérence entre poste frontend et compétences backend
                if ('frontend' in role_lower or 'front-end' in role_lower) and not any(s.lower() in skills_text for s in ['html', 'css', 'javascript', 'react', 'vue', 'angular']):
                    inconsistencies.append({
                        'type': 'skill_mismatch',
                        'message': 'Le poste recherché (Frontend) ne correspond pas aux compétences déclarées'
                    })
                
                # Incohérence entre poste backend et compétences frontend
                if ('backend' in role_lower or 'back-end' in role_lower) and not any(s.lower() in skills_text for s in ['python', 'java', 'c#', 'nodejs', 'php', 'sql', 'mongo']):
                    inconsistencies.append({
                        'type': 'skill_mismatch',
                        'message': 'Le poste recherché (Backend) ne correspond pas aux compétences déclarées'
                    })
        
        # Vérifier la cohérence entre le niveau d'expérience et le salaire
        # (Logique simplifiée, à adapter selon les besoins réels)
        skill_levels = parsed_data.get('skills', {}).get('normalized', {}).get('technicalSkillLevels', {})
        salary_info = parsed_data.get('jobPreferences', {}).get('normalized', {}).get('salaryExpectation', {})
        
        if skill_levels and salary_info and salary_info.get('min'):
            # Calculer le niveau moyen
            avg_level = 0
            if skill_levels:
                level_values = [level.get('value', 0) for level in skill_levels.values()]
                if level_values:
                    avg_level = sum(level_values) / len(level_values)
            
            # Vérifier si le niveau de débutant demande un salaire trop élevé
            if avg_level <= 1.5 and salary_info.get('min', 0) > 50000:
                inconsistencies.append({
                    'type': 'salary_experience_mismatch',
                    'message': 'Le niveau d\'expérience (Débutant) semble incohérent avec les prétentions salariales'
                })
        
        return inconsistencies
    
    def _generate_matching_tags(self, parsed_data: Dict) -> List[str]:
        """Génère des tags pour faciliter le matching avec les offres"""
        tags = []
        
        # Ajouter des tags basés sur les préférences professionnelles
        if parsed_data.get('jobPreferences'):
            job_prefs = parsed_data['jobPreferences']
            
            # Poste recherché
            if job_prefs.get('preferredRole'):
                tags.append(f"role:{job_prefs['preferredRole'].lower()}")
            
            # Type de contrat
            if job_prefs.get('contractType'):
                tags.append(f"contract:{job_prefs['contractType'].lower()}")
            
            # Préférence de travail à distance
            if job_prefs.get('remotePreference'):
                tags.append(f"remote:{job_prefs['remotePreference'].lower()}")
        
        # Ajouter des tags basés sur les compétences
        if parsed_data.get('skills'):
            skills = parsed_data['skills']
            
            # Compétences techniques
            for skill in skills.get('technicalSkills', []):
                tags.append(f"skill:{skill.lower()}")
            
            # Langues
            for lang in skills.get('languages', []):
                tags.append(f"language:{lang.lower()}")
        
        # Ajouter des tags basés sur la disponibilité
        if parsed_data.get('availability'):
            avail = parsed_data['availability']
            
            # Statut d'emploi
            if avail.get('currentlyEmployed'):
                tags.append(f"employed:{avail['currentlyEmployed'].lower()}")
            
            # Disponibilité pour déménager
            if avail.get('relocateWilling') is not None:
                tags.append(f"relocate:{str(avail['relocateWilling']).lower()}")
        
        return tags


class ResponseValidator:
    """Classe pour valider les réponses et détecter les anomalies"""
    
    def __init__(self):
        pass
    
    def validate_responses(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Valide les réponses d'un candidat et détecte les anomalies"""
        if not candidate_data:
            return {'valid': False, 'errors': ['Données vides']}
        
        errors = []
        warnings = []
        suggestions = []
        
        # Valider les préférences professionnelles
        self._validate_job_preferences(candidate_data.get('jobPreferences', {}), errors, warnings, suggestions)
        
        # Valider les compétences
        self._validate_skills(candidate_data.get('skills', {}), errors, warnings, suggestions)
        
        # Valider la disponibilité
        self._validate_availability(candidate_data.get('availability', {}), errors, warnings, suggestions)
        
        # Résultat de la validation
        result = {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'suggestions': suggestions
        }
        
        return result
    
    def _validate_job_preferences(self, job_prefs: Dict[str, Any], 
                                 errors: List[str], warnings: List[str], suggestions: List[str]):
        """Valide les préférences professionnelles"""
        # Vérifier si le poste recherché est spécifié
        if not job_prefs.get('preferredRole'):
            warnings.append('Le poste recherché n\'est pas spécifié')
            suggestions.append('Spécifier le poste recherché pour améliorer la précision du matching')
        
        # Vérifier si le type de contrat est spécifié
        if not job_prefs.get('contractType'):
            warnings.append('Le type de contrat n\'est pas spécifié')
        
        # Vérifier si la localisation est spécifiée
        if not job_prefs.get('location'):
            warnings.append('La localisation n\'est pas spécifiée')
        
        # Vérifier le format des prétentions salariales
        salary = job_prefs.get('salaryExpectation', '')
        if salary and not re.match(r'^[\d\s.,k€-]+$', str(salary)):
            warnings.append('Le format des prétentions salariales est incorrect')
            suggestions.append('Indiquer les prétentions salariales au format "40K€" ou "40-50K€"')
    
    def _validate_skills(self, skills: Dict[str, Any], 
                        errors: List[str], warnings: List[str], suggestions: List[str]):
        """Valide les compétences"""
        # Vérifier si des compétences techniques sont spécifiées
        if not skills.get('technicalSkills'):
            warnings.append('Aucune compétence technique n\'est spécifiée')
            suggestions.append('Ajouter des compétences techniques pour améliorer le matching')
        
        # Vérifier si les compétences comportementales sont spécifiées
        if not skills.get('softSkills'):
            warnings.append('Aucune compétence comportementale n\'est spécifiée')
        
        # Vérifier si les langues sont spécifiées
        if not skills.get('languages'):
            warnings.append('Aucune langue n\'est spécifiée')
        
    def _validate_availability(self, availability: Dict[str, Any], 
                              errors: List[str], warnings: List[str], suggestions: List[str]):
        """Valide les informations de disponibilité"""
        # Vérifier si le statut d'emploi est spécifié
        if 'currentlyEmployed' not in availability:
            warnings.append('Le statut d\'emploi n\'est pas spécifié')
        
        # Si employé, vérifier si la raison de recherche est spécifiée
        if availability.get('currentlyEmployed') == 'oui' and not availability.get('jobSearchReason'):
            warnings.append('La raison de recherche d\'emploi n\'est pas spécifiée')
        
        # Si employé, vérifier si le préavis est spécifié
        if availability.get('currentlyEmployed') == 'oui' and not availability.get('noticePeriod'):
            warnings.append('La durée du préavis n\'est pas spécifiée')
        
        # Si non employé, vérifier si la raison de fin de contrat est spécifiée
        if availability.get('currentlyEmployed') == 'non' and not availability.get('jobEndReason'):
            warnings.append('La raison de fin du dernier contrat n\'est pas spécifiée')


# Classe principale pour utiliser le parser
class CandidateDataProcessor:
    """Classe principale pour traiter les données des candidats"""
    
    def __init__(self):
        self.parser = ResponseParser()
        self.validator = ResponseValidator()
    
    def process_candidate_data(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        """Traite les données d'un candidat"""
        if not candidate_data:
            return {'error': 'Données vides'}
        
        # Extraire les données du questionnaire
        questionnaire_data = candidate_data.get('questionnaire', {})
        
        # Analyser les données
        parsed_data = self.parser.parse_candidate_response(questionnaire_data)
        
        # Valider les données
        validation_result = self.validator.validate_responses(parsed_data)
        
        # Combiner les résultats
        result = {
            'originalData': candidate_data,
            'parsedData': parsed_data,
            'validation': validation_result
        }
        
        return result


# Fonction pour traiter les données candidat et les retourner au format JSON
def process_candidate(data_json):
    """Traite les données JSON d'un candidat et retourne le résultat"""
    try:
        # Parser les données JSON
        data = json.loads(data_json)
        
        # Initialiser le processeur
        processor = CandidateDataProcessor()
        
        # Traiter les données
        result = processor.process_candidate_data(data)
        
        # Retourner le résultat au format JSON
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        # En cas d'erreur, retourner un message d'erreur
        return json.dumps({
            'error': f"Erreur lors du traitement des données: {str(e)}"
        }, ensure_ascii=False)


# Point d'entrée pour les tests
if __name__ == "__main__":
    # Données d'exemple
    example_data = {
        "questionnaire": {
            "jobPreferences": {
                "preferredRole": "Développeur Frontend",
                "contractType": "CDI",
                "location": "Paris",
                "remotePreference": "Hybride",
                "salaryExpectation": "45-50k",
                "startDate": "2025-04-01"
            },
            "skills": {
                "technicalSkills": ["JavaScript", "React", "TypeScript", "HTML", "CSS"],
                "technicalSkillLevels": {
                    "JavaScript": "avancé", 
                    "React": "intermédiaire", 
                    "TypeScript": "débutant"
                },
                "softSkills": ["Communication", "Travail d'équipe", "Autonomie"],
                "languages": ["Français (natif)", "Anglais (B2)"],
                "certifications": ["AWS Certified Developer"]
            },
            "availability": {
                "currentlyEmployed": "oui",
                "jobSearchReason": "Manque de perspectives d'évolutions",
                "noticePeriod": "2_mois",
                "noticeNegotiable": "oui",
                "recruitmentStatus": "entretiens",
                "interviewAvailability": "Soirs et weekends",
                "relocateWilling": False
            },
            "additional": {
                "motivation": "Je cherche un environnement plus stimulant où je pourrai développer mes compétences.",
                "strengths": "Grande capacité d'apprentissage et autonomie dans la résolution de problèmes.",
                "challenges": "J'ai dû reprendre un projet complexe avec peu de documentation et le livrer dans des délais serrés.",
                "priorities": {
                    "Salaire et avantages": 2,
                    "Ambiance de travail": 1,
                    "Perspectives d'évolution": 3
                }
            }
        }
    }
    
    # Tester le parsing
    result = process_candidate(json.dumps(example_data))
    print(result)