import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class MailService {

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


}
