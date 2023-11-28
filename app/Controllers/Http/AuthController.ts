import mjml from 'mjml'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { UserService } from 'App/Services'
import Env from '@ioc:Adonis/Core/Env'
import Mail from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'
import Route from '@ioc:Adonis/Core/Route'
import LoginInputValidator from 'App/Validators/LoginInputValidator'
import RegisterInputValidator from 'App/Validators/RegisterInputValidator'

export default class AuthController {
  constructor(private readonly userService: UserService = new UserService()) {}
  /*-------------------------------------------------------
  | @AuthController class
  | @Features:
  |   - Login
  |   - Register
  |   - Logout
  |   - WhoAmI
  |   - Verify Email
  |   - Resend Email Verification
  |   - Update Profile (TODO)
  |   - Update Password (TODO)
  |   - Forgot/Reset Password (TODO)
  *-------------------------------------------------------*/

  // WHOAMI
  public async whoAmI({ auth }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Auth:  Already authenticated from route => middleware
    *-------------------------------------------------------*/
    return auth.user
  }

  // LOGIN
  public async login({ request, auth }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Login a user!
    *-------------------------------------------------------*/
    const { email, password } = await request.validate(LoginInputValidator)
    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '10 days',
    })

    return token
  }

  // LOGOUT
  public async logout({ auth }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Auth:   Logout user & revoked token
    *-------------------------------------------------------*/
    await auth.use('api').revoke()
    return { revoked: true }
  }

  // REGISTER
  public async register({ request, auth }: HttpContextContract) {
    const payload = await request.validate(RegisterInputValidator)
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Registering new user!
    *-------------------------------------------------------*/
    const user = await this.userService.create(payload)
    const token = await auth.use('api').login(user, {
      expiresIn: '10 days',
    })
    return {
      token,
      data: user,
    }
  }

  // VERIFY Email
  public async verifyEmail({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-request link
    | @Auth:       Verify user's email
    *-------------------------------------------------------*/

    // verify signature from requested url
    if (!request.hasValidSignature()) {
      return response.badRequest({ message: 'Invalid url provided!' })
    }

    // update user's email verify status
    await this.userService
      .makeEmailVerified(request.params().email)
      .then(() => {
        return response.accepted({ message: 'Email verified successfully!' })
      })
      .catch((err) => {
        return response.internalServerError({ message: 'Something went wrong!', errors: err })
      })
  }

  // SEND Email Verification :: Resend
  public async resendEmailVerify({ request }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Resend email verification link
    *-------------------------------------------------------*/
    const { email } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.exists({ table: 'users', column: 'email' }),
        ]),
      }),
    })

    // compose email
    const verifyLink = Route.makeSignedUrl('verifyEmail', {
      email, // if your model has 'name' property, you can pass it here
      expiresIn: '30m',
    })

    const rendered = mjml(
      await View.render('verify_email', {
        name: email,
        verifyLink: `${Env.get('DOMAIN')}${verifyLink}`,
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

    return { message: 'Email verification link has been sent successfully!' }
  }
}
