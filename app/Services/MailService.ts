/*
|-------------------------------------------------------------
| @MailService class
| @Author: Mahabub (@mahabubx7)
|-------------------------------------------------------------
|
| This is a service class that can be used for some custom
| services to handle some specific business requirements.
|
| @Dependencies: Mail, View, TokenService
|
|*/

import mjml from 'mjml'
import Mail from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import { TokenService } from './TokenService'

export class MailService {
  constructor() {}

  /**
   * @MailService: Send a verification email to user
   * @Params: email     string
   * @Params: name      string
   * @Params: expiresIn string [optional]
   */
  public static async sendEmailVerification(email: string, name: string, expiresIn: number = 120) {
    // generate OTP
    const otp = await TokenService.generateOtp({ email, type: 'email_verification' }, expiresIn) // 2 mins

    // render email from template
    const rendered = mjml(
      await View.render('verify_email', {
        name,
        otp,
      })
    ).html

    // enqueue to send a email
    await Mail.sendLater((mail) => {
      mail
        .to(email)
        .from('noreply@company.com', 'XCompany')
        .subject('Email address verification!')
        .html(rendered)
    })
  }

  /**
   * @MailService: Send a notification email to user
   * @Params: email       string
   * @Params: name        string
   * @Params: subject     string
   */
  public static async sendNotification(email: string, name: string, subject: string) {
    // render email from template
    const rendered = mjml(
      await View.render('notify_email', {
        name,
        subject,
        supportEmail: 'support@company.com',
      })
    ).html

    // enqueue to send a email
    await Mail.sendLater((mail) => {
      mail.to(email).from('noreply@company.com', 'XCompany').subject(subject).html(rendered)
    })
  }

  /**
   * @MailService: Send a reset password email to user
   * @Params: email       string
   * @Params: name        string
   */
  public static async sendResetPasswordOtp(
    email: string,
    name: string,
    expiresIn: number = 60 * 5
  ) {
    // generate OTP
    const otp = await TokenService.generateOtp({ email, type: 'reset_password' }, expiresIn) // 5 mins: default

    // render email from template
    const rendered = mjml(
      await View.render('reset_password', {
        name,
        otp,
      })
    ).html

    // enqueue to send a email
    await Mail.sendLater((mail) => {
      mail
        .to(email)
        .from('noreply@company.com', 'XCompany')
        .subject('Reset your password!')
        .html(rendered)
    })
  }
}
