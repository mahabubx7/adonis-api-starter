import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { UserService, MailService, TokenService } from 'App/Services'
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
  |   - Update Password
  |   - Forgot/Reset Password
  *-------------------------------------------------------*/

  /**
   * @whoAmI
   * @summery Get authenticated user's details
   * @responseBody 200 - <User> - Success
   * @responseBody 401 - {"errors": [{"message": "error_message"}]}
   */
  public async whoAmI({ auth }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Auth:  Already authenticated from route => middleware
    *-------------------------------------------------------*/
    return auth.user
  }

  /**
   * @login
   * @summery Login a user
   * @requestBody { "email": "john.doe@gmail.com", "password": "xxxxxxxx" }
   * @responseBody 202 - {"message":"string","token":{"type":"bearer","token":"string","expiresIn":"string"}}
   * @responseBody 400 - {"errors": [{"message": "error_message"}]}
   */
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

  /**
   * @logout
   * @summery Logout a user
   * @responseBody 202 - {"message":"string","revoked":true}
   * @responseBody 401 - {"errors": [{"message": "error_message"}]}
   */
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

  /**
   * @register
   * @summery User registration
   * @requestBody { "email": "john.doe@gmail.com", "password": "xxxxxxxx" }
   * @responseBody 201 - {"message":"string","token":{"type":"bearer","token":"string","expiresIn":"string"},"user": {"id":1,"email":"john.doe@gmail.com","is_email_verified":false,"role":"user","created_at":"2021-09-30T06:59:59.000Z","updated_at":"2021-09-30T06:59:59.000Z"}}
   * @responseBody 400 - {"errors": [{"message": "error_message"}]}
   */
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

  /**
   * @verifyEmail
   * @summery Verify user's email by validating OTP
   * @requestBody { "otp": "123456" }
   * @responseBody 202 - {"message":"string"}
   * @responseBody 400 - {"errors": [{"message": "error_message"}]}
   * @responseBody 500 - {"errors": [{"message": "error_message"}]}
   */
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
    if (!payload || payload.type !== 'email_verification') {
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

  /**
   * @changePassword
   * @summery Change current password
   * @requestBody { "current": "xxxxxxxx", "password": "xxxxxxxx", "confirm": "xxxxxxxx" }
   * @responseBody 202 - {"message":"string"}
   * @responseBody 401 - {"errors": [{"message": "error_message"}]}
   * @responseBody 400 - {"errors": [{"message": "error_message"}]}
   */
  public async changePassword({ request, auth, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-request inputs
    | @Auth:       Change user's password
    *-------------------------------------------------------*/
    const { current, password } = await request.validate(ChangePasswordInput)
    const { id, email } = await auth.use('api').authenticate()
    const update = await this.userService.changePassword(id, current, password)

    if (!update) {
      return response.badRequest({ message: 'Current password not matched!' })
    }

    // send a notify email to the user
    await MailService.sendNotification(email, email, 'Password changed successfully!')

    return response.accepted({ message: 'Password changed successfully!' })
  }

  /**
   * @resendEmailVerify
   * @summery Resend email verification link
   * @requestBody {"email": "john.doe@gmail.com"}
   * @responseBody 200 - {"message":"string"}
   * @responseBody 422 - {"errors": [{"message": "error_message"}]}
   */
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

  /**
   * @forgotPassword
   * @summery Forgot password & reset request
   * @requestBody {"email": "john.doe@gmail.com"}
   * @responseBody 200 - {"message":"string"}
   * @responseBody 422 - {"errors": [{"message": "error_message"}]}
   */
  public async forgotPassword({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user-inputs
    | @Auth:       Forgot password & reset request
    *-------------------------------------------------------*/
    const { email } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.exists({ table: 'users', column: 'email' }),
        ]),
      }),
    })

    await MailService.sendResetPasswordOtp(email, email) // send email verification

    return response.ok({
      message: 'Please check your email & use the OTP to reset your password within 5 minutes!',
    })
  }

  /**
   * @resetPassword
   * @summery Reset request with OTP & new password
   * @requestBody {"otp": "123456","password": "xxxxxxxx","confirm": "xxxxxxxx"}
   * @responseBody 202 - {"message":"string"}
   * @responseBody 400 - {"errors": [{"message": "error_message"}]}
   * @responseBody 500 - {"errors": [{"message": "error_message"}]}
   */
  public async resetPassword({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------
    | @Sanitized:  Validating user inputs
    | @Auth:       Reset user's password
    *-------------------------------------------------------*/
    // validate request inputs
    const { otp, password } = await request.validate({
      schema: schema.create({
        otp: schema.string({ trim: true }, [rules.minLength(6)]),
        password: schema.string({ trim: true }, [rules.minLength(6)]),
        confirm: schema.string({ trim: true }, [rules.minLength(6), rules.confirmed('password')]),
      }),
    })

    // verify OTP
    const payload = await TokenService.verifyOtp(otp)
    if (!payload || payload.type !== 'reset_password') {
      return response.badRequest({ message: 'Invalid or expired OTP!' })
    }

    // update user's password
    const update = await this.userService.resetPassword(payload.email, password)
    if (!update) {
      return response.internalServerError({ message: 'Something went wrong!' })
    }

    await MailService.sendNotification(payload.email, payload.email, 'Password reset successful!')
    return response.accepted({ message: 'Password reset successful!' })
  }
}
