import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Environment } from '../common/interfaces/environment.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService<Environment>) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('EMAIL_HOST', { infer: true }),
      port: configService.get('EMAIL_PORT', { infer: true }),
      secure: configService.get('EMAIL_SECURE', { infer: true }),
      auth: {
        user: configService.get('EMAIL_USERNAME', { infer: true }),
        pass: configService.get('EMAIL_PASSWORD', { infer: true }),
      },
    });
  }

  public async sendMail(to: string, subject: string, text: string) {
    const templatePath: string = join(
      __dirname,
      'templates',
      'forget-password.ejs',
    );
    const template = fs.readFileSync(templatePath, 'utf-8');
    const templateContext = ejs.render(template, { code: text });

    const mailOptions: Mail.Options = {
      from: `"${this.configService.get('APP_NAME', { infer: true })}" <${this.configService.get('EMAIL_USERNAME', { infer: true })}>`,
      to,
      subject,
      text: `Hello, We've received a request to reset the password for your epilepsy account. No changes have been made yet. Use the following code to reset your password: ${text} If you did not request a new password, please let us know immediately by replying to this email. You can find answers to most questions and get in touch with us at support@epilepsy.com. We're here to help. © 2025 Epilepsy. All rights reserved.`,
      html: templateContext,
      attachments: [
        {
          filename: 'logo.png',
          path: join(__dirname, 'templates', 'logo.png'),
          cid: 'logo',
        },
      ],
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
