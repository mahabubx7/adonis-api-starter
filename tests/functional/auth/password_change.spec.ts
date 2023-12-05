import { test } from '@japa/runner'
import { extractToken } from '../../helpers'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('password', (group) => {
  const apiPrefix = '/api/v1' // <--- API prefix

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  }) // <--- prepare or rollback database

  // Password: changed password successfully
  test('password: should change password successfully', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    }) // <--- login first for auth token

    const token = extractToken(login.body()) // <--- extract token from the response

    const response = await client
      .put(`${apiPrefix}/auth/password/change`) // <--- change password request
      .form({
        current: '12345678',
        password: 'password', // <--- new password
        confirm: 'password',
      })
      .headers({
        Authorization: `Bearer ${token}`, // <--- set the token
      })

    response.assertStatus(202) // <--- Accepted 202
    response.assertBodyContains({
      message: 'Password changed successfully!',
    }) // <--- response body
  })

  // Password: change password without token failed
  test('password: should be unauthorized without token', async ({ client }) => {
    const response = await client
      .put(`${apiPrefix}/auth/password/change`) // <--- change password request
      .form({
        current: '12345678',
        password: 'password', // <--- new password
        confirm: 'password',
      }) // <--- no token given

    response.assertStatus(401) // <--- Accepted 202
    response.assertBodyContains({
      errors: [{ message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access' }],
    }) // <--- response body
  })
})
