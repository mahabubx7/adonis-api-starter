import { test } from '@japa/runner'

test.group('logout', () => {
  const apiPrefix = '/api/v1'

  // Logout: successful!
  test('logout: should be successful!', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    login.assertStatus(202) // <--- login first!

    const { token } = login.body().token // <--- extract token
    const logout = await client
      .delete(`${apiPrefix}/auth/logout`)
      .header('Authorization', `Bearer ${token}`)

    logout.assertStatus(202) // <--- logout successful!
    logout.assertBodyContains({
      message: 'Logout successfully!',
      revoked: true,
    }) // <--- logout response!
  })

  // Logout: unauthorized!
  test('logout: should return unauthorized!', async ({ client }) => {
    // logout without the bearer token!
    const logout = await client.delete(`${apiPrefix}/auth/logout`)
    logout.assertStatus(401) // <--- unauthorized!
    logout.assertBodyContains({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    }) // <--- error unauthorized response!
  })
})
