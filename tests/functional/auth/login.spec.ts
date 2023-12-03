import { test } from '@japa/runner'

test.group('login', () => {
  const apiPrefix = '/api/v1'

  // Test: Login successful request!
  test('login: successful!', async ({ client }) => {
    const response = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })

    response.assertStatus(202) // <-- Expected 202: Accepted
    response.assertBodyContains({ message: 'Login successfully!' }) // <-- Expected Successful message
    response.assertBodyContains({ token: Object }) // <-- Expected token object
    response.assertBodyContains({
      token: {
        type: 'bearer',
        expires_at: String,
        token: String,
      },
    }) // <-- Expected token object as above
  })

  // Test: Login invalid request!
  test('login: wrong-password check!', async ({ client }) => {
    const response = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: 'xxxxxxxx', // <-- Wrong password
    })

    response.assertStatus(400) // <-- Expected 400: BadRequest
    response.assertBodyContains({
      errors: [
        {
          message: 'E_INVALID_AUTH_PASSWORD: Password mis-match',
        },
      ],
    }) // <-- Expected error message
  })

  // Test: Login user not found!
  test('login: user-404', async ({ client }) => {
    const response = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test00@user.com', // <-- Wrong email or user doesn't exist
      password: 'xxxxxxxx',
    })

    response.assertStatus(400) // <-- Expected 400: BadRequest
    response.assertBodyContains({
      errors: [
        {
          message: 'E_INVALID_AUTH_UID: User not found',
        },
      ],
    })
  })
})
