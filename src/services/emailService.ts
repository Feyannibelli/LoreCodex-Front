// src/services/emailService.ts
import apiAuth from './apiAuth';

export interface EmailNotificationSettings {
    emailNotificationsEnabled: boolean;
}

class EmailService {
    // Actualizar configuración de notificaciones por email
    async updateEmailNotifications(enabled: boolean): Promise<void> {
        try {
            await apiAuth.patch('/settings/email-notifications', null, {
                params: { enabled }
            });
        } catch (error) {
            console.error('Error updating email notifications:', error);
            throw error;
        }
    }

    // Enviar email de prueba (usando el endpoint que ya tienes)
    async sendTestEmail(email: string): Promise<void> {
        try {
            await apiAuth.post('/test-email', null, {
                params: { to: email }
            });
        } catch (error) {
            console.error('Error sending test email:', error);
            throw error;
        }
    }
}

export default new EmailService();