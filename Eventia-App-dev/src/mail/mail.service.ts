import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService,
      private readonly mailerService: MailerService
    ) {}

    async sendActivationCode(email: string, nom: string, code: string) {
    await this.mailerService.sendMail({
        to: email,
        subject: 'Your Eventia verification code',
        template: './activation', 
        context: {
        nom: nom,
        codeActivation: code, 
        },
    });
    }

    async sendCodeResetEmail(email: string, code: string) {
        await this.mailerService.sendMail({
        to: email,
        subject: 'Password reset request',
        template: './password-reset',
        context: { code },
        });
    }

  async sendActivationEmail(email: string, activationLink: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Activate your Eventia account',
        html: `<p>Hello, please click the following link to activate your account: <a href="${activationLink}">Activate my account</a></p>`,
      });

      this.logger.log(`Activation email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send activation email to ${email}:`, error);
      throw new InternalServerErrorException("Unable to send activation email");
    }
  }

  async sendEventRejectedEmail(email: string, eventTitle: string, reason: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `Événement "${eventTitle}" rejeté`,
        html: `<p>Bonjour,</p>
<p>L'événement <strong>${eventTitle}</strong> a été rejeté par l'administrateur.</p>
<p>Motif : <strong>${reason || 'Aucun motif fourni'}</strong></p>
<p>Vous pouvez modifier l'événement et le soumettre à nouveau pour validation.</p>
<p>Cordialement,<br>L'équipe Eventia</p>`,
      });
      this.logger.log(`Event rejection email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send event rejection email to ${email}:`, error);
    }
  }

  async sendOrganizerApprovedEmail(email: string, organizerName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Votre profil organisateur a été validé',
        html: `<p>Bonjour <strong>${organizerName}</strong>,</p>
<p>Félicitations ! Votre profil organisateur a été <strong>validé</strong> par l'administrateur Eventia.</p>
<p>Vous pouvez désormais créer des événements, les publier et gérer votre billetterie.</p>
<p>Cordialement,<br>L'équipe Eventia</p>`,
      });
      this.logger.log(`Organizer approval email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send organizer approval email to ${email}:`, error);
    }
  }

  async sendOrganizerRejectedEmail(email: string, organizerName: string, reason: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Votre profil organisateur a été rejeté',
        html: `<p>Bonjour <strong>${organizerName}</strong>,</p>
<p>Nous sommes désolés, votre profil organisateur a été <strong>rejeté</strong> par l'administrateur Eventia.</p>
<p>Motif : <strong>${reason || 'Aucun motif fourni'}</strong></p>
<p>Vous pouvez corriger les informations de votre profil et le soumettre à nouveau.</p>
<p>Cordialement,<br>L'équipe Eventia</p>`,
      });
      this.logger.log(`Organizer rejection email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send organizer rejection email to ${email}:`, error);
    }
  }

}
