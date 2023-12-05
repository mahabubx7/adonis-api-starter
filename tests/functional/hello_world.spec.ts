import { test } from '@japa/runner'

test('display api welcome!', async ({ client }) => {
  const response = await client.get('/api')

  response.assertStatus(200)
  response.assertBodyContains({ hello: 'world' })
})
