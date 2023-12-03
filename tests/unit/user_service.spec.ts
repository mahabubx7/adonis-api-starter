import { test } from '@japa/runner'
import { UserService } from 'App/Services'
import User from 'App/Models/User'

test.group('User', () => {
  const userService = new UserService()

  // User: create a user
  test('user: should create a user', async ({ assert }) => {
    const user = await userService.create({
      email: 'service@email.com',
      password: 'password',
    })
    // checks
    assert.instanceOf(user, User) // <--- Object of its model
    assert.exists(user.id) // <--- User has ID
    assert.exists(user.email) // <--- User has email
    assert.strictEqual(user.email, 'service@email.com') // <--- Email is OK!
    assert.notEqual(user.password, 'password') // <--- Password is hashed
  })

  // User: cannot have a duplicated user [unique: email]
  test('user: should not be able to make duplicate by Email', async ({ assert }) => {
    const user = await userService.create({
      email: 'origin@email.com',
      password: 'password',
    }) // <--- Created first entry

    const duplicateTry = async () =>
      await userService.create({
        email: user.email,
        password: 'password',
      }) // <--- Try to create a duplicate

    // checks
    assert.rejects(duplicateTry) // <--- Should reject
  })

  // User: find a user (by Id)
  test('user: should find a user (by Id)', async ({ assert }) => {
    const user = await userService.create({
      email: 'userId@email.com',
      password: 'password',
    }) // <--- Created a user first
    const findUser = await userService.getById(user.id) // <--- Find user by ID
    // checks
    assert.notEqual(user, null) // <--- User cannot be null
    assert.exists(findUser!.id) // <--- User has ID
  })

  // User: find a user (by Email)
  test('user: should find a user (by Email)', async ({ assert }) => {
    const user = await userService.create({
      email: 'mail@email.com',
      password: 'password',
    }) // <--- Created a user first
    const findUser = await userService.getByEmail(user.email) // <--- Find user by Email
    // checks
    assert.notEqual(user, null) // <--- User cannot be null
    assert.strictEqual(findUser!.email, user.email) // <--- User has email
  })
})
