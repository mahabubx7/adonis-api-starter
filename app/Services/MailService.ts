/*
|-------------------------------------------------------------
| @MailService class
| @Author: Mahabub (@mahabubx7)
|-------------------------------------------------------------
|
| This is a service class that can be used for some custom
| services to handle some specific business requirements.
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
   * @Params: email string
   * @Params: name string
   * @Params: expiresIn string [optional]
   */
  public static async sendEmailVerification(email: string, name: string, expiresIn: number = 120) {
    // generate OTP
    const otp = await TokenService.generateOtp({ email }, expiresIn) // 2 mins

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
        .from('noreply@company.mail', 'XCompany')
        .subject('XCompany - Email Verification!')
        .html(rendered)
    })
  }
}
