import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class MailService {

    private readonly logger = new Logger(MailService.name);
    constructor(private readonly mailerService: MailerService) {}

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
      await this.mailerService.sendMail({
        to: email,
        subject: 'Activez votre compte Eventia',
        template: '/inscription', 
        context: {
          activationLink, // Injecte le lien dans la variable {{activationLink}} du template
        },
      });
      
      this.logger.log(`E-mail d'activation envoyé avec succès à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'e-mail à ${email}:`, error);
      throw new InternalServerErrorException("Impossible d'envoyer l'e-mail d'activation");
    }
  }
    

}
