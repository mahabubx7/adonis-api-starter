import Mail from '@ioc:Adonis/Addons/Mail'
import { test } from '@japa/runner'
import { extractOtp } from '../../helpers'

test.group('email-verify', () => {
  const apiPrefix = '/api/v1'

  // Email verification: verify OTP successfully
  test('email: should verify email from otp', async ({ client }) => {
    const mailer = Mail.fake() // <--- Fake mailer
    const sendOtp = await client.post(`${apiPrefix}/auth/verify/resend`).form({
      email: 'test@user.com',
    }) // <--- Send OTP first
    sendOtp.assertStatus(200) // <--- OTP sent

    const response = await client.post(`${apiPrefix}/auth/verify/email`).form({
      otp: extractOtp(mailer),
    }) // <--- Verify OTP request

    response.assertStatus(202) // <--- OTP verified
    response.assertBodyContains({ message: 'Email verified successfully!' }) // <--- OTP verified message
  })

  // Email verification: verify OTP failed
  test('email: should not verify email from invalid otp', async ({ client }) => {
    const sendOtp = await client.post(`${apiPrefix}/auth/verify/resend`).form({
      email: 'test@user.com',
    }) // <--- Send OTP first

    sendOtp.assertStatus(200) // <--- OTP sent

    const response = await client.post(`${apiPrefix}/auth/verify/email`).form({
      otp: '000101', // wrong OTP given
    }) // <--- Verify OTP request

    response.assertStatus(400 ?? 500) // <--- OTP verification failed
    response.assertBodyContains({ message: 'Invalid or expired OTP!' }) // <--- OTP verification failed message
  })
})
