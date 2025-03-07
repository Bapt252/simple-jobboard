/**
 * Composant de planification pour intégration avec Outlook/Google Calendar
 * Permet la gestion des créneaux et la synchronisation avec les calendriers
 */

class SchedulerComponent {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'scheduler-container',
            apiKey: config.apiKey || null,
            calendarSources: config.calendarSources || ['outlook', 'google'],
            defaultDuration: config.defaultDuration || 60, // minutes
            startHour: config.startHour || 9,
            endHour: config.endHour || 18,
            timeStep: config.timeStep || 30, // minutes
            locale: config.locale || 'fr-FR',
            onSlotSelected: config.onSlotSelected || null,
            onAppointmentCreated: config.onAppointmentCreated || null,
            onAppointmentCancelled: config.onAppointmentCancelled || null,
            onCalendarSync: config.onCalendarSync || null,
        };

        this.selectedDate = new Date();
        this.availableSlots = [];
        this.userAvailability = [];
        this.appointments = [];
        this.initialized = false;
        this.microsoftAuthProvider = null;
        this.googleAuthProvider = null;
        
        // Tokens de connexion pour les APIs
        this.outlookToken = localStorage.getItem('outlook_token') || null;
        this.googleToken = localStorage.getItem('google_token') || null;
    }

    /**
     * Initialise le composant de planification
     */
    async init() {
        if (this.initialized) return;

        console.log('Initialisation du composant de planification...');
        
        // Création du conteneur s'il n'existe pas
        if (!document.getElementById(this.config.containerId)) {
            console.warn(`Le conteneur #${this.config.containerId} n'existe pas. Création d'un conteneur par défaut.`);
            const container = document.createElement('div');
            container.id = this.config.containerId;
            document.body.appendChild(container);
        }
        
        // Chargement des APIs externes
        await this.loadExternalLibraries();
        
        // Initialisation de l'interface utilisateur
        this.renderUI();
        
        // Essayer de restaurer les sessions
        this.tryRestoreSessions();
        
        this.initialized = true;
        console.log('Composant de planification initialisé');
    }

    /**
     * Charge les bibliothèques externes nécessaires
     */
    async loadExternalLibraries() {
        return new Promise((resolve, reject) => {
            // Chargement des APIs Microsoft
            if (this.config.calendarSources.includes('outlook')) {
                const msScript = document.createElement('script');
                msScript.src = 'https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js';
                msScript.async = true;
                msScript.onload = () => {
                    console.log('API Microsoft MSAL chargée');
                    this.initMicrosoftAuth();
                };
                msScript.onerror = () => console.error('Erreur lors du chargement de l\'API Microsoft');
                document.head.appendChild(msScript);
            }
            
            // Chargement des APIs Google
            if (this.config.calendarSources.includes('google')) {
                const googleScript = document.createElement('script');
                googleScript.src = 'https://apis.google.com/js/api.js';
                googleScript.async = true;
                googleScript.onload = () => {
                    console.log('API Google chargée');
                    this.initGoogleAuth();
                };
                googleScript.onerror = () => console.error('Erreur lors du chargement de l\'API Google');
                document.head.appendChild(googleScript);
            }
            
            // Résoudre après un court délai pour permettre aux APIs de se charger
            setTimeout(resolve, 1000);
        });
    }

    /**
     * Initialise l'authentification Microsoft
     */
    initMicrosoftAuth() {
        if (!window.msal) {
            console.error('La bibliothèque MSAL n\'est pas chargée');
            return;
        }
        
        // Configuration de l'authentification MSAL pour Outlook
        const msalConfig = {
            auth: {
                clientId: 'APPLICATION_CLIENT_ID', // À remplacer par votre ID client
                authority: 'https://login.microsoftonline.com/common',
                redirectUri: window.location.origin,
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false,
            }
        };
        
        this.microsoftAuthProvider = new msal.PublicClientApplication(msalConfig);
        console.log('Authentification Microsoft initialisée');
    }

    /**
     * Initialise l'authentification Google
     */
    initGoogleAuth() {
        if (!window.gapi) {
            console.error('La bibliothèque Google API n\'est pas chargée');
            return;
        }
        
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: this.config.apiKey,
                clientId: 'YOUR_GOOGLE_CLIENT_ID', // À remplacer par votre ID client
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: 'https://www.googleapis.com/auth/calendar'
            }).then(() => {
                this.googleAuthProvider = gapi.auth2.getAuthInstance();
                console.log('Authentification Google initialisée');
            }).catch(error => {
                console.error('Erreur lors de l\'initialisation de l\'authentification Google', error);
            });
        });
    }

    /**
     * Tente de restaurer les sessions de connexion existantes
     */
    tryRestoreSessions() {
        if (this.outlookToken) {
            console.log('Tentative de restauration de la session Outlook');
            // Logic de validation du token et restauration de session
        }
        
        if (this.googleToken) {
            console.log('Tentative de restauration de la session Google');
            // Logic de validation du token et restauration de session
        }
    }

    /**
     * Authentifie l'utilisateur avec Microsoft
     */
    async authenticateWithMicrosoft() {
        if (!this.microsoftAuthProvider) {
            console.error('L\'authentification Microsoft n\'est pas initialisée');
            return;
        }
        
        const loginRequest = {
            scopes: ['user.read', 'calendars.read', 'calendars.readwrite']
        };
        
        try {
            const loginResponse = await this.microsoftAuthProvider.loginPopup(loginRequest);
            console.log('Connexion Microsoft réussie', loginResponse);
            this.outlookToken = loginResponse.accessToken;
            localStorage.setItem('outlook_token', this.outlookToken);
            
            // Après authentification, charger les informations du calendrier
            this.loadOutlookCalendar();
            
            return loginResponse;
        } catch (error) {
            console.error('Erreur lors de la connexion Microsoft', error);
            return null;
        }
    }

    /**
     * Authentifie l'utilisateur avec Google
     */
    async authenticateWithGoogle() {
        if (!this.googleAuthProvider) {
            console.error('L\'authentification Google n\'est pas initialisée');
            return;
        }
        
        try {
            const googleUser = await this.googleAuthProvider.signIn();
            const authResponse = googleUser.getAuthResponse();
            console.log('Connexion Google réussie', authResponse);
            this.googleToken = authResponse.access_token;
            localStorage.setItem('google_token', this.googleToken);
            
            // Après authentification, charger les informations du calendrier
            this.loadGoogleCalendar();
            
            return googleUser;
        } catch (error) {
            console.error('Erreur lors de la connexion Google', error);
            return null;
        }
    }

    /**
     * Charge les événements du calendrier Outlook
     */
    async loadOutlookCalendar() {
        if (!this.outlookToken) {
            console.error('Aucun token Outlook disponible');
            return;
        }
        
        console.log('Chargement des événements Outlook...');
        // Ici, appel à l'API Microsoft Graph pour obtenir les événements
        // Exemple: https://graph.microsoft.com/v1.0/me/calendar/events
        
        // Mise à jour de la disponibilité
        this.updateAvailability();
    }

    /**
     * Charge les événements du calendrier Google
     */
    async loadGoogleCalendar() {
        if (!this.googleToken) {
            console.error('Aucun token Google disponible');
            return;
        }
        
        console.log('Chargement des événements Google Calendar...');
        // Ici, appel à l'API Google Calendar pour obtenir les événements
        // Exemple: gapi.client.calendar.events.list({calendarId: 'primary'})
        
        // Mise à jour de la disponibilité
        this.updateAvailability();
    }

    /**
     * Crée un événement dans Outlook
     */
    async createOutlookEvent(event) {
        if (!this.outlookToken) {
            console.error('Aucun token Outlook disponible');
            return null;
        }
        
        console.log('Création d\'un événement Outlook...', event);
        // Ici, appel à l'API Microsoft Graph pour créer un événement
        // Exemple: https://graph.microsoft.com/v1.0/me/calendar/events
        
        // Simulation d'un événement créé
        const createdEvent = {
            id: 'outlook_' + Date.now(),
            ...event,
            source: 'outlook'
        };
        
        this.appointments.push(createdEvent);
        
        // Notifier la création
        if (this.config.onAppointmentCreated) {
            this.config.onAppointmentCreated(createdEvent);
        }
        
        return createdEvent;
    }

    /**
     * Crée un événement dans Google Calendar
     */
    async createGoogleEvent(event) {
        if (!this.googleToken) {
            console.error('Aucun token Google disponible');
            return null;
        }
        
        console.log('Création d\'un événement Google Calendar...', event);
        // Ici, appel à l'API Google Calendar pour créer un événement
        // Exemple: gapi.client.calendar.events.insert({calendarId: 'primary', resource: event})
        
        // Simulation d'un événement créé
        const createdEvent = {
            id: 'google_' + Date.now(),
            ...event,
            source: 'google'
        };
        
        this.appointments.push(createdEvent);
        
        // Notifier la création
        if (this.config.onAppointmentCreated) {
            this.config.onAppointmentCreated(createdEvent);
        }
        
        return createdEvent;
    }

    /**
     * Met à jour la disponibilité en fonction des calendriers
     */
    updateAvailability() {
        // Recalculer les créneaux disponibles en fonction des événements des calendriers
        this.generateAvailableSlots();
        
        // Mettre à jour l'interface
        this.renderTimeSlots();
        
        // Notifier la synchronisation
        if (this.config.onCalendarSync) {
            this.config.onCalendarSync(this.availableSlots);
        }
    }

    /**
     * Génère les créneaux horaires disponibles
     */
    generateAvailableSlots() {
        const slots = [];
        const date = new Date(this.selectedDate);
        date.setHours(this.config.startHour, 0, 0, 0);
        
        // Générer les créneaux par pas de temps
        while (date.getHours() < this.config.endHour) {
            const startTime = new Date(date);
            date.setMinutes(date.getMinutes() + this.config.timeStep);
            
            if (date.getHours() >= this.config.endHour) {
                break;
            }
            
            const endTime = new Date(date);
            
            // Vérifier si le créneau est disponible (pas de conflit avec les événements existants)
            const isAvailable = this.isTimeSlotAvailable(startTime, endTime);
            
            slots.push({
                start: startTime,
                end: endTime,
                available: isAvailable
            });
        }
        
        this.availableSlots = slots;
    }

    /**
     * Vérifie si un créneau horaire est disponible
     */
    isTimeSlotAvailable(start, end) {
        // Par défaut, tous les créneaux sont disponibles
        // Dans une implémentation réelle, vérifier les conflits avec les événements du calendrier
        return true;
    }

    /**
     * Crée un rendez-vous dans le calendrier sélectionné
     */
    async createAppointment(details) {
        const { title, description, start, end, attendees, calendarSource } = details;
        
        const event = {
            title,
            description,
            start,
            end,
            attendees
        };
        
        let createdEvent = null;
        
        if (calendarSource === 'outlook') {
            createdEvent = await this.createOutlookEvent(event);
        } else if (calendarSource === 'google') {
            createdEvent = await this.createGoogleEvent(event);
        } else {
            console.error('Source de calendrier non prise en charge:', calendarSource);
        }
        
        if (createdEvent) {
            // Mise à jour de l'interface
            this.updateAvailability();
            
            // Envoi de confirmation par email
            this.sendAppointmentConfirmation(createdEvent);
        }
        
        return createdEvent;
    }

    /**
     * Envoie une confirmation de rendez-vous par email
     */
    sendAppointmentConfirmation(event) {
        console.log('Envoi d\'une confirmation pour:', event);
        // Dans une application réelle, appel à une API d'envoi d'emails
        
        // Planification d'un rappel
        this.scheduleReminder(event);
    }

    /**
     * Planifie un rappel pour un rendez-vous
     */
    scheduleReminder(event) {
        const reminderTime = new Date(event.start);
        reminderTime.setHours(reminderTime.getHours() - 24); // 24h avant
        
        const now = new Date();
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        if (timeUntilReminder > 0) {
            console.log(`Rappel planifié pour: ${event.title}`);
            // Dans une application réelle, stocker les rappels dans une base de données
            // et utiliser un service de planification comme cron ou une file d'attente
        }
    }

    /**
     * Annule un rendez-vous
     */
    async cancelAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        
        if (!appointment) {
            console.error('Rendez-vous non trouvé:', appointmentId);
            return false;
        }
        
        try {
            if (appointment.source === 'outlook') {
                // Appel à l'API Microsoft Graph pour supprimer l'événement
                console.log('Suppression de l\'événement Outlook:', appointmentId);
            } else if (appointment.source === 'google') {
                // Appel à l'API Google Calendar pour supprimer l'événement
                console.log('Suppression de l\'événement Google Calendar:', appointmentId);
            }
            
            // Supprimer de la liste locale
            this.appointments = this.appointments.filter(a => a.id !== appointmentId);
            
            // Mise à jour de l'interface
            this.updateAvailability();
            
            // Notifier l'annulation
            if (this.config.onAppointmentCancelled) {
                this.config.onAppointmentCancelled(appointment);
            }
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'annulation du rendez-vous:', error);
            return false;
        }
    }

    /**
     * Change la date sélectionnée
     */
    changeDate(date) {
        this.selectedDate = new Date(date);
        this.updateAvailability();
    }

    /**
     * Déconnecte les comptes connectés
     */
    disconnect(provider) {
        if (provider === 'outlook' || provider === 'all') {
            this.outlookToken = null;
            localStorage.removeItem('outlook_token');
            console.log('Déconnexion de Microsoft Outlook');
        }
        
        if (provider === 'google' || provider === 'all') {
            this.googleToken = null;
            localStorage.removeItem('google_token');
            if (this.googleAuthProvider) {
                this.googleAuthProvider.signOut();
            }
            console.log('Déconnexion de Google Calendar');
        }
        
        // Mettre à jour l'interface
        this.renderUI();
    }

    /**
     * Rendu de l'interface utilisateur
     */
    renderUI() {
        const container = document.getElementById(this.config.containerId);
        if (!container) return;
        
        // Structure HTML du composant
        container.innerHTML = `
            <div class="scheduler">
                <div class="scheduler-header">
                    <h2>Planification de rendez-vous</h2>
                    <div class="scheduler-actions">
                        <button id="sync-outlook" class="btn ${this.outlookToken ? 'btn-success' : 'btn-primary'}">
                            <i class="fab fa-microsoft"></i> ${this.outlookToken ? 'Outlook connecté' : 'Connecter Outlook'}
                        </button>
                        <button id="sync-google" class="btn ${this.googleToken ? 'btn-success' : 'btn-primary'}">
                            <i class="fab fa-google"></i> ${this.googleToken ? 'Google connecté' : 'Connecter Google'}
                        </button>
                    </div>
                </div>
                <div class="scheduler-calendar">
                    <div class="scheduler-date-picker">
                        <button id="prev-day" class="date-nav-btn"><i class="fas fa-chevron-left"></i></button>
                        <div id="current-date" class="current-date">${this.formatDate(this.selectedDate)}</div>
                        <button id="next-day" class="date-nav-btn"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div id="time-slots" class="time-slots">
                        <!-- Les créneaux seront ajoutés ici dynamiquement -->
                    </div>
                </div>
                <div id="appointment-form" class="appointment-form" style="display: none;">
                    <h3>Nouveau rendez-vous</h3>
                    <div class="form-group">
                        <label for="appointment-title">Titre</label>
                        <input type="text" id="appointment-title" class="form-control" placeholder="Entretien technique">
                    </div>
                    <div class="form-group">
                        <label for="appointment-description">Description</label>
                        <textarea id="appointment-description" class="form-control" placeholder="Détails du rendez-vous..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="appointment-attendees">Participants (emails séparés par des virgules)</label>
                        <input type="text" id="appointment-attendees" class="form-control" placeholder="participant@example.com">
                    </div>
                    <div class="form-group">
                        <label>Calendrier</label>
                        <div class="calendar-source-selector">
                            <label class="radio-label">
                                <input type="radio" name="calendar-source" value="outlook" ${this.outlookToken ? 'checked' : ''} ${!this.outlookToken ? 'disabled' : ''}>
                                <span>Outlook</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="calendar-source" value="google" ${!this.outlookToken && this.googleToken ? 'checked' : ''} ${!this.googleToken ? 'disabled' : ''}>
                                <span>Google</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button id="cancel-appointment" class="btn btn-secondary">Annuler</button>
                        <button id="save-appointment" class="btn btn-primary">Créer le rendez-vous</button>
                    </div>
                </div>
                <div class="scheduler-footer">
                    <p>Les créneaux affichés sont vos disponibilités. Choisissez un créneau pour programmer un rendez-vous.</p>
                </div>
            </div>
        `;
        
        // Appliquer des styles CSS
        this.applyStyles();
        
        // Ajouter les gestionnaires d'événements
        this.addEventListeners();
        
        // Rendre les créneaux horaires
        this.renderTimeSlots();
    }

    /**
     * Applique les styles CSS au composant
     */
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .scheduler {
                font-family: 'Inter', sans-serif;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .scheduler-header {
                background-color: #f8fafc;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .scheduler-header h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
                color: #1e293b;
            }
            
            .scheduler-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .btn {
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                font-weight: 500;
                font-size: 0.875rem;
                cursor: pointer;
                border: none;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background-color: #6366f1;
                color: white;
            }
            
            .btn-primary:hover {
                background-color: #4f46e5;
            }
            
            .btn-secondary {
                background-color: #e5e7eb;
                color: #4b5563;
            }
            
            .btn-secondary:hover {
                background-color: #d1d5db;
            }
            
            .btn-success {
                background-color: #10b981;
                color: white;
            }
            
            .btn-success:hover {
                background-color: #059669;
            }
            
            .scheduler-calendar {
                padding: 1.5rem;
            }
            
            .scheduler-date-picker {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1.5rem;
                gap: 1rem;
            }
            
            .date-nav-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: #f1f5f9;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .date-nav-btn:hover {
                background-color: #e2e8f0;
            }
            
            .current-date {
                font-size: 1.125rem;
                font-weight: 600;
                color: #1e293b;
            }
            
            .time-slots {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 0.75rem;
            }
            
            .time-slot {
                padding: 0.75rem;
                border-radius: 0.375rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid #e5e7eb;
                background-color: white;
            }
            
            .time-slot:hover {
                border-color: #6366f1;
                background-color: #f5f3ff;
            }
            
            .time-slot.available {
                color: #1e293b;
            }
            
            .time-slot.unavailable {
                color: #9ca3af;
                background-color: #f3f4f6;
                cursor: not-allowed;
            }
            
            .time-slot.selected {
                background-color: #6366f1;
                color: white;
                border-color: #6366f1;
            }
            
            .appointment-form {
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                background-color: #f8fafc;
            }
            
            .appointment-form h3 {
                margin-top: 0;
                font-size: 1.125rem;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 1rem;
            }
            
            .form-group {
                margin-bottom: 1rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                font-size: 0.875rem;
                color: #4b5563;
            }
            
            .form-control {
                width: 100%;
                padding: 0.625rem;
                border-radius: 0.375rem;
                border: 1px solid #e5e7eb;
                font-family: inherit;
                font-size: 0.875rem;
            }
            
            textarea.form-control {
                min-height: 80px;
                resize: vertical;
            }
            
            .calendar-source-selector {
                display: flex;
                gap: 1rem;
            }
            
            .radio-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 0.75rem;
                margin-top: 1.5rem;
            }
            
            .scheduler-footer {
                padding: 1rem 1.5rem;
                background-color: #f8fafc;
                border-top: 1px solid #e5e7eb;
                font-size: 0.875rem;
                color: #64748b;
            }
            
            @media (max-width: 640px) {
                .scheduler-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 1rem;
                }
                
                .time-slots {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Ajoute les gestionnaires d'événements aux éléments du composant
     */
    addEventListeners() {
        // Boutons de synchronisation
        const syncOutlookBtn = document.getElementById('sync-outlook');
        const syncGoogleBtn = document.getElementById('sync-google');
        
        if (syncOutlookBtn) {
            syncOutlookBtn.addEventListener('click', () => {
                if (this.outlookToken) {
                    this.disconnect('outlook');
                } else {
                    this.authenticateWithMicrosoft();
                }
            });
        }
        
        if (syncGoogleBtn) {
            syncGoogleBtn.addEventListener('click', () => {
                if (this.googleToken) {
                    this.disconnect('google');
                } else {
                    this.authenticateWithGoogle();
                }
            });
        }
        
        // Navigation dans le calendrier
        const prevDayBtn = document.getElementById('prev-day');
        const nextDayBtn = document.getElementById('next-day');
        
        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => {
                const prevDay = new Date(this.selectedDate);
                prevDay.setDate(prevDay.getDate() - 1);
                this.changeDate(prevDay);
            });
        }
        
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                const nextDay = new Date(this.selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                this.changeDate(nextDay);
            });
        }
        
        // Formulaire de rendez-vous
        const cancelAppointmentBtn = document.getElementById('cancel-appointment');
        const saveAppointmentBtn = document.getElementById('save-appointment');
        
        if (cancelAppointmentBtn) {
            cancelAppointmentBtn.addEventListener('click', () => {
                this.hideAppointmentForm();
            });
        }
        
        if (saveAppointmentBtn) {
            saveAppointmentBtn.addEventListener('click', () => {
                this.saveAppointment();
            });
        }
    }

    /**
     * Rendu des créneaux horaires
     */
    renderTimeSlots() {
        const slotsContainer = document.getElementById('time-slots');
        if (!slotsContainer) return;
        
        slotsContainer.innerHTML = '';
        
        this.availableSlots.forEach((slot, index) => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
            slotElement.textContent = this.formatTime(slot.start) + ' - ' + this.formatTime(slot.end);
            slotElement.dataset.index = index;
            
            if (slot.available) {
                slotElement.addEventListener('click', () => {
                    this.selectTimeSlot(index);
                });
            }
            
            slotsContainer.appendChild(slotElement);
        });
    }

    /**
     * Sélectionne un créneau horaire
     */
    selectTimeSlot(index) {
        const slot = this.availableSlots[index];
        
        // Mettre à jour l'interface
        const slotElements = document.querySelectorAll('.time-slot');
        slotElements.forEach(el => el.classList.remove('selected'));
        
        const selectedElement = document.querySelector(`.time-slot[data-index="${index}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        // Notifier la sélection
        if (this.config.onSlotSelected) {
            this.config.onSlotSelected(slot);
        }
        
        // Afficher le formulaire de rendez-vous
        this.showAppointmentForm(slot);
    }

    /**
     * Affiche le formulaire de rendez-vous
     */
    showAppointmentForm(slot) {
        const form = document.getElementById('appointment-form');
        if (!form) return;
        
        // Stocker le créneau sélectionné
        this.selectedSlot = slot;
        
        // Afficher le formulaire
        form.style.display = 'block';
        
        // Réinitialiser les champs
        document.getElementById('appointment-title').value = '';
        document.getElementById('appointment-description').value = '';
        document.getElementById('appointment-attendees').value = '';
        
        // Sélectionner le calendrier par défaut
        if (this.outlookToken) {
            document.querySelector('input[name="calendar-source"][value="outlook"]').checked = true;
        } else if (this.googleToken) {
            document.querySelector('input[name="calendar-source"][value="google"]').checked = true;
        }
    }

    /**
     * Cache le formulaire de rendez-vous
     */
    hideAppointmentForm() {
        const form = document.getElementById('appointment-form');
        if (!form) return;
        
        form.style.display = 'none';
        
        // Désélectionner le créneau
        const slotElements = document.querySelectorAll('.time-slot');
        slotElements.forEach(el => el.classList.remove('selected'));
        
        this.selectedSlot = null;
    }

    /**
     * Enregistre un nouveau rendez-vous
     */
    async saveAppointment() {
        if (!this.selectedSlot) {
            console.error('Aucun créneau sélectionné');
            return;
        }
        
        const title = document.getElementById('appointment-title').value;
        const description = document.getElementById('appointment-description').value;
        const attendeesInput = document.getElementById('appointment-attendees').value;
        const calendarSourceEl = document.querySelector('input[name="calendar-source"]:checked');
        
        if (!title) {
            alert('Veuillez saisir un titre pour le rendez-vous');
            return;
        }
        
        if (!calendarSourceEl) {
            alert('Veuillez sélectionner un calendrier');
            return;
        }
        
        const calendarSource = calendarSourceEl.value;
        
        // Vérifier la connexion au calendrier
        if ((calendarSource === 'outlook' && !this.outlookToken) || 
            (calendarSource === 'google' && !this.googleToken)) {
            alert(`Veuillez vous connecter à ${calendarSource === 'outlook' ? 'Outlook' : 'Google'} d'abord`);
            return;
        }
        
        // Préparer les participants
        const attendees = attendeesInput
            .split(',')
            .map(email => email.trim())
            .filter(email => email);
        
        // Créer le rendez-vous
        try {
            const appointment = await this.createAppointment({
                title,
                description,
                start: this.selectedSlot.start,
                end: this.selectedSlot.end,
                attendees,
                calendarSource
            });
            
            if (appointment) {
                alert('Rendez-vous créé avec succès !');
                this.hideAppointmentForm();
            }
        } catch (error) {
            console.error('Erreur lors de la création du rendez-vous:', error);
            alert('Une erreur est survenue lors de la création du rendez-vous. Veuillez réessayer.');
        }
    }

    /**
     * Formate une date pour l'affichage
     */
    formatDate(date) {
        return date.toLocaleDateString(this.config.locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    /**
     * Formate une heure pour l'affichage
     */
    formatTime(date) {
        return date.toLocaleTimeString(this.config.locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Exportation du composant
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SchedulerComponent };
} else {
    window.SchedulerComponent = SchedulerComponent;
}