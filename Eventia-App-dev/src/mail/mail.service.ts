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
    

}
