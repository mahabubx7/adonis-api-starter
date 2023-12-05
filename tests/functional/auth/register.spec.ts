import { test } from '@japa/runner'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('register', async (group) => {
  const apiPrefix = '/api/v1' // <-- API prefix

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  }) // <--- prepare or rollback database

  // Test: Registration successful!
  test('register: should be successful!', async ({ assert, client }) => {
    const mailer = Mail.fake() // <-- Fake mailer

    const response = await client.post(apiPrefix + '/auth/register').form({
      email: 'testing@user.com',
      password: '12345678',
      password_confirmation: '12345678', // required for validation
    })

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === 'Email address verification!'
      })
    )

    Mail.restore() // <-- Restore mailer

    response.assertStatus(201) // <-- Expected 201: Created
    response.assertBodyContains({ message: 'User registered successfully!' }) // <-- Expected Successful message
    response.assertBodyContains({ token: Object }) // <-- Expected token object
    response.assertBodyContains({
      token: {
        type: 'bearer',
        expires_at: String,
        token: String,
      },
    }) // <-- Expected token object as above
    response.assertBodyContains({ user: Object }) // <-- Expected user object
  })

  // Test: Registration invalid request!
  test('register: should be invalid request!', async ({ client }) => {
    const response = await client.post(apiPrefix + '/auth/register').form({
      email: 'testing@user.com',
      password: '12345678',
      // confirm_password is missing to make the request invalid
    })

    response.assertStatus(422) // <-- Expected 422: Unprocessable Entity
    response.assertBodyContains({
      errors: [
        {
          message: 'confirmed validation failed',
          field: 'password_confirmation',
          rule: 'confirmed',
        },
      ],
    }) // <-- Expected error object as above
  })
})
