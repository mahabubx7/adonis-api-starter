import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { extractToken } from '../helpers'

test.group('todo', (group) => {
  const apiPrefix = '/api/v1' // <-- API prefix

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  }) // <--- prepare or rollback database

  // todo: add a new todo
  test('todo: add a new todo', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    const token = extractToken(login.body())
    const response = await client
      .post(`${apiPrefix}/todo`)
      .form({
        title: 'test todo',
        description: 'test todo description',
      })
      .headers({
        Authorization: `Bearer ${token}`,
      })
    response.assertStatus(201) // <--- 201 created
    response.assertBodyContains({
      message: 'Todo created successfully!',
    }) // <--- response body
  })

  // todo: get all todos (user's own list)
  test('todo: get all todos', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    const token = extractToken(login.body())
    const response = await client.get(`${apiPrefix}/todo`).headers({
      Authorization: `Bearer ${token}`,
    })

    response.assertStatus(200) // <--- 200 OK
    response.assertBodyContains({
      todo: Array,
    }) // <--- response body (must be an array)
  })

  // todo: get a todo
  test('todo: get a todo', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    const token = extractToken(login.body())
    const todo = await client
      .post(`${apiPrefix}/todo`)
      .form({
        title: 'test todo',
        description: 'test todo description',
      })
      .headers({
        Authorization: `Bearer ${token}`,
      })

    const todoBody = todo.body().todo
    const response = await client.get(`${apiPrefix}/todo/${todoBody.id}`).headers({
      Authorization: `Bearer ${token}`,
    })

    response.assertStatus(200) // <--- 200 OK
    response.assertBodyContains({
      todo: { ...todoBody },
    }) // <--- response body
  })

  // todo: update a todo
  test('todo: update a todo', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    const token = extractToken(login.body())
    const todo = await client
      .post(`${apiPrefix}/todo`)
      .form({
        title: 'test todo',
        description: 'test todo description',
      })
      .headers({
        Authorization: `Bearer ${token}`,
      })

    const todoBody = todo.body().todo
    const response = await client
      .put(`${apiPrefix}/todo/${todoBody.id}`)
      .headers({
        Authorization: `Bearer ${token}`,
      })
      .form({
        title: 'updated todo',
        description: 'updated todo description',
        isCompleted: true,
      }) // <--- update request

    response.assertStatus(202) // <--- 202 Accepted
    response.assertBodyContains({
      message: 'Todo updated successfully!',
    }) // <--- response body
  })

  // todo: delete a todo
  test('todo: delete a todo', async ({ client }) => {
    const login = await client.post(`${apiPrefix}/auth/login`).form({
      email: 'test@user.com',
      password: '12345678',
    })
    const token = extractToken(login.body())
    const todo = await client
      .post(`${apiPrefix}/todo`)
      .form({
        title: 'test todo',
        description: 'test todo description',
      })
      .headers({
        Authorization: `Bearer ${token}`,
      })

    const todoBody = todo.body().todo
    const response = await client.delete(`${apiPrefix}/todo/${todoBody.id}`).headers({
      Authorization: `Bearer ${token}`,
    }) // <--- update request

    response.assertStatus(202) // <--- 202 Accepted
    response.assertBodyContains({
      message: 'Todo deleted successfully!',
    }) // <--- response body
  })
})
