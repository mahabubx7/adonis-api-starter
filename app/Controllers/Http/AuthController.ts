import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { UserService, MailService, TokenService } from 'App/Services'
import Hash from '@ioc:Adonis/Core/Hash'
import ChangePasswordInput from 'App/Validators/ChangePasswordInput'
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
  public async login({ request, auth, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Login a user!
    *-------------------------------------------------------*/
    const { email, password } = await request.validate(LoginInputValidator)
    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '7 days',
      ip_address: request.ip(),
    })

    return response.accepted({
      message: 'Login successfully!',
      token,
    })
  }

  // LOGOUT
  public async logout({ auth, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Auth:   Logout user & revoked token
    *-------------------------------------------------------*/
    await auth.use('api').revoke()
    return response.accepted({
      message: 'Logout successfully!',
      revoked: true,
    })
  }

  // REGISTER
  public async register({ request, auth, response }: HttpContextContract) {
    const payload = await request.validate(RegisterInputValidator)
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Registering new user!
    *-------------------------------------------------------*/
    const user = await this.userService.create(payload)

    const token = await auth.use('api').generate(user, {
      expiresIn: '7 days',
      ip_address: request.ip(),
    })

    /**
     * @MailService: Send a verification email to user
     * @Params: email string
     * @Params: name string [I didn't have 'name' field so I passed email as name]
     * @Params: expiresIn string [optional]
     */
    await MailService.sendEmailVerification(user.email, user.email) // send email verification

    return response.created({
      message: 'User registered successfully!',
      token,
      user,
    })
  }

  // VERIFY Email
  public async verifyEmail({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-request OTP
    | @Auth:       Verify user's email
    *-------------------------------------------------------*/
    // validate OTP
    const { otp } = await request.validate({
      schema: schema.create({
        otp: schema.string({ trim: true }, [rules.minLength(6)]),
      }),
    })

    // verify OTP
    const payload = await TokenService.verifyOtp(otp)
    if (!payload) {
      return response.badRequest({ message: 'Invalid or expired OTP!' })
    }

    // update user's email verify status
    await this.userService
      .makeEmailVerified(payload.email)
      .then(() => {
        return response.accepted({ message: 'Email verified successfully!' })
      })
      .catch((err) => {
        return response.internalServerError({ message: 'Something went wrong!', errors: err })
      })
  }

  // Change Password
  public async changePassword({ request, auth, response }: HttpContextContract) {
    const { current, password } = await request.validate(ChangePasswordInput)
    const { id } = await auth.use('api').authenticate()
    if (!auth.isAuthenticated) {
      return response.unauthorized({ message: 'You are not authorized!' })
    }
    const update = await this.userService.changePassword(id, current, password)

    if (!update) {
      return response.badRequest({ message: 'Current password not matched!' })
    }

    // send a notify email to user
    return response.accepted({ message: 'Password changed successfully!' })
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

    /**
     * @MailService: Send a verification email to user
     * @Params: email string
     * @Params: name string [I didn't have 'name' field so I passed email as name]
     * @Params: expiresIn string [optional]
     */
    await MailService.sendEmailVerification(email, email) // send email verification

    return { message: 'Email verification link has been sent successfully!' }
  }
}
