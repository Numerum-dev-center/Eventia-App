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
        subject: 'Votre code d\'activation Eventia',
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
        subject: 'Réinitialisation de votre mot de passe',
        template: './password-reset', // ton fichier password-reset.hbs
        context: { code }, // passe le code au template
        });
    }

  async sendActivationEmail(email: string, activationLink: string): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('BREVO_API_KEY');
      const senderEmail = this.configService.get<string>('MAIL_FROM') || 'no-reply@eventia.com';

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey || '',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { 
            name: 'Eventia', 
            email: senderEmail 
          },
          to: [{ email }],
          subject: 'Activez votre compte Eventia',
          htmlContent: `<p>Bonjour, veuillez cliquer sur le lien suivant pour activer votre compte : <a href="${activationLink}">Activer mon compte</a></p>`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API Brevo: ${JSON.stringify(errorData)}`);
      }

      this.logger.log(`E-mail d'activation envoyé avec succès à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'e-mail à ${email}:`, error);
      throw new InternalServerErrorException("Impossible d'envoyer l'e-mail d'activation");
    }
  }
    

}
