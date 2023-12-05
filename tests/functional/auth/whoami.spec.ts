import { test } from '@japa/runner'

test.group('whoami', () => {
  const apiPrefix = '/api/v1'

  // Whoami: successful!
  test('whoami: should be successful!', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    login.assertStatus(202) // <--- login first!
    const { token } = login.body().token // <--- extract token

    const whoami = await client
      .get(`${apiPrefix}/auth/whoami`)
      .header('Authorization', `Bearer ${token}`)
    whoami.assertStatus(200) // <--- whoami successful!
    whoami.assertBodyContains({
      id: Number,
      email: String,
      // more as you need...
    })
  })

  // Whoami: unauthorized!
  test('whoami: should return unauthorized!', async ({ client }) => {
    // whoami without the bearer token!
    const whoami = await client.get(`${apiPrefix}/auth/whoami`)
    whoami.assertStatus(401) // <--- unauthorized!
    whoami.assertBodyContains({
      errors: [
        {
          message: 'E_UNAUTHORIZED_ACCESS: Unauthorized access',
        },
      ],
    }) // <--- error unauthorized response!
  })
})
