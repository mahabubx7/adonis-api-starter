import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { extractOtp } from '../../helpers'

test.group('reset', (group) => {
  const apiPrefix = '/api/v1' // <--- API prefix

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  }) // <--- prepare or rollback database

  // Reset password: reset password successfully
  test('reset: should reset password successfully', async ({ client }) => {
    const mailer = Mail.fake() // <--- fake mailer
    const forgot = await client.post(`${apiPrefix}/auth/password/forgot`).form({
      email: 'test@user.com',
    })
    forgot.assertStatus(200) // <--- forgot password request sent!
    const otp = extractOtp(mailer) // <--- extract OTP from fake mailer
    const response = await client.put(`${apiPrefix}/auth/password/reset`).form({
      otp,
      password: 'pass1111',
      confirm: 'pass1111',
    }) // <--- reset password request

    Mail.restore() // <-- Restore mailer
    response.assertStatus(202) // <--- reset password request successful!
    response.assertBodyContains({
      message: 'Password reset successful!',
    }) // <--- reset password request successful message
  })
})
