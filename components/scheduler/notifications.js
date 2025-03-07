/**
 * Système de notification et rappels pour les rendez-vous
 * Permet d'envoyer des notifications par email et dans l'application
 */

class NotificationService {
    constructor(config = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/notifications',
            emailService: config.emailService || 'default',
            reminderTimes: config.reminderTimes || [24, 1], // heures avant le rendez-vous
            notificationsEnabled: config.notificationsEnabled || true,
            emailsEnabled: config.emailsEnabled || true,
            smsEnabled: config.smsEnabled || false,
            phoneNumber: config.phoneNumber || null,
            emailAddress: config.emailAddress || null,
            ...config
        };
        
        this.notifications = [];
        this.reminders = [];
        
        this.initialized = false;
    }

    /**
     * Initialise le service de notification
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initialisation du service de notification...');
        
        // Charger les notifications existantes
        await this.loadNotifications();
        
        // Vérifier les permissions de notification du navigateur
        if (this.config.notificationsEnabled && 'Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
        
        // Démarrer le vérificateur de rappels
        this.startReminderChecker();
        
        this.initialized = true;
        console.log('Service de notification initialisé');
    }

    /**
     * Charge les notifications existantes depuis le stockage local
     */
    async loadNotifications() {
        try {
            const storedNotifications = localStorage.getItem('notifications');
            if (storedNotifications) {
                this.notifications = JSON.parse(storedNotifications);
                
                // Convertir les dates de string à Date
                this.notifications.forEach(notification => {
                    if (notification.date) {
                        notification.date = new Date(notification.date);
                    }
                });
            }
            
            const storedReminders = localStorage.getItem('reminders');
            if (storedReminders) {
                this.reminders = JSON.parse(storedReminders);
                
                // Convertir les dates de string à Date
                this.reminders.forEach(reminder => {
                    if (reminder.date) {
                        reminder.date = new Date(reminder.date);
                    }
                    if (reminder.appointmentDate) {
                        reminder.appointmentDate = new Date(reminder.appointmentDate);
                    }
                });
                
                // Filtrer les rappels passés
                const now = new Date();
                this.reminders = this.reminders.filter(reminder => 
                    reminder.date > now || reminder.status === 'pending');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
        }
    }

    /**
     * Sauvegarde les notifications dans le stockage local
     */
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
            localStorage.setItem('reminders', JSON.stringify(this.reminders));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des notifications:', error);
        }
    }

    /**
     * Crée une notification
     */
    createNotification(notification) {
        const newNotification = {
            id: 'notification_' + Date.now(),
            date: new Date(),
            read: false,
            ...notification
        };
        
        this.notifications.push(newNotification);
        this.saveNotifications();
        
        // Envoyer une notification navigateur si activé
        if (this.config.notificationsEnabled && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/assets/img/notification-icon.png'
            });
            
            browserNotification.onclick = () => {
                window.focus();
                this.markAsRead(newNotification.id);
                if (notification.url) {
                    window.location.href = notification.url;
                }
            };
        }
        
        return newNotification;
    }

    /**
     * Marque une notification comme lue
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
        
        return notification;
    }

    /**
     * Supprime une notification
     */
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
    }

    /**
     * Crée un rappel pour un rendez-vous
     */
    createReminders(appointment) {
        if (!appointment || !appointment.start) {
            console.error('Rendez-vous invalide', appointment);
            return [];
        }
        
        const reminderIds = [];
        const appointmentDate = new Date(appointment.start);
        
        // Créer un rappel pour chaque délai configuré
        this.config.reminderTimes.forEach(hours => {
            const reminderDate = new Date(appointmentDate);
            reminderDate.setHours(reminderDate.getHours() - hours);
            
            // Ne pas créer de rappel si la date est déjà passée
            if (reminderDate <= new Date()) return;
            
            const reminder = {
                id: `reminder_${appointment.id}_${hours}`,
                appointmentId: appointment.id,
                appointmentTitle: appointment.title,
                appointmentDate: appointmentDate,
                date: reminderDate,
                hoursBeforeAppointment: hours,
                status: 'pending',
                sent: false
            };
            
            this.reminders.push(reminder);
            reminderIds.push(reminder.id);
        });
        
        this.saveNotifications();
        return reminderIds;
    }

    /**
     * Démarre le vérificateur de rappels
     */
    startReminderChecker() {
        // Vérifier les rappels toutes les minutes
        setInterval(() => {
            this.checkReminders();
        }, 60000);
        
        // Vérifier immédiatement
        this.checkReminders();
    }

    /**
     * Vérifie les rappels à envoyer
     */
    checkReminders() {
        const now = new Date();
        
        // Trouver les rappels à envoyer
        const remindersToSend = this.reminders.filter(reminder => 
            reminder.status === 'pending' && 
            reminder.date <= now && 
            !reminder.sent
        );
        
        // Envoyer les rappels
        remindersToSend.forEach(reminder => {
            this.sendReminder(reminder);
            reminder.sent = true;
            reminder.status = 'sent';
            reminder.sentDate = new Date();
        });
        
        // Mettre à jour le stockage si des rappels ont été envoyés
        if (remindersToSend.length > 0) {
            this.saveNotifications();
        }
    }

    /**
     * Envoie un rappel
     */
    async sendReminder(reminder) {
        console.log('Envoi d\'un rappel:', reminder);
        
        // Créer une notification
        const hourText = reminder.hoursBeforeAppointment === 1 ? 'heure' : 'heures';
        
        this.createNotification({
            title: 'Rappel de rendez-vous',
            message: `Rappel: ${reminder.appointmentTitle} dans ${reminder.hoursBeforeAppointment} ${hourText}`,
            type: 'reminder',
            appointmentId: reminder.appointmentId,
            icon: '/assets/img/calendar-icon.png'
        });
        
        // Envoyer un email si activé
        if (this.config.emailsEnabled && this.config.emailAddress) {
            await this.sendEmail({
                to: this.config.emailAddress,
                subject: `Rappel: ${reminder.appointmentTitle}`,
                body: `
                <h2>Rappel de rendez-vous</h2>
                <p>Votre rendez-vous "${reminder.appointmentTitle}" est prévu dans ${reminder.hoursBeforeAppointment} ${hourText}.</p>
                <p><strong>Date et heure:</strong> ${this.formatDateTime(reminder.appointmentDate)}</p>
                <p>Connectez-vous à votre espace pour plus de détails.</p>
                `
            });
        }
        
        // Envoyer un SMS si activé
        if (this.config.smsEnabled && this.config.phoneNumber) {
            await this.sendSMS({
                to: this.config.phoneNumber,
                message: `Rappel: ${reminder.appointmentTitle} le ${this.formatDate(reminder.appointmentDate)} à ${this.formatTime(reminder.appointmentDate)}`
            });
        }
    }

    /**
     * Envoie un email
     */
    async sendEmail(options) {
        const { to, subject, body } = options;
        
        try {
            // Dans une application réelle, appel à un service d'envoi d'emails
            console.log(`Envoi d'un email à ${to}:`, subject);
            
            // Simulation d'un appel API
            /*
            const response = await fetch(this.config.apiEndpoint + '/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to,
                    subject,
                    body,
                    service: this.config.emailService
                })
            });
            
            return response.ok;
            */
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            return false;
        }
    }

    /**
     * Envoie un SMS
     */
    async sendSMS(options) {
        const { to, message } = options;
        
        try {
            // Dans une application réelle, appel à un service d'envoi de SMS
            console.log(`Envoi d'un SMS à ${to}:`, message);
            
            // Simulation d'un appel API
            /*
            const response = await fetch(this.config.apiEndpoint + '/sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to,
                    message
                })
            });
            
            return response.ok;
            */
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du SMS:', error);
            return false;
        }
    }

    /**
     * Formate une date pour l'affichage
     */
    formatDate(date) {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Formate une heure pour l'affichage
     */
    formatTime(date) {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Formate une date et heure pour l'affichage
     */
    formatDateTime(date) {
        return `${this.formatDate(date)} à ${this.formatTime(date)}`;
    }

    /**
     * Récupère toutes les notifications non lues
     */
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    /**
     * Récupère tous les rappels à venir
     */
    getUpcomingReminders() {
        const now = new Date();
        return this.reminders.filter(r => r.date > now && r.status === 'pending');
    }
}

// Exportation du service
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationService };
} else {
    window.NotificationService = NotificationService;
}