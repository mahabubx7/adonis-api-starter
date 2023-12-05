import { test } from '@japa/runner'
import { TodoService, UserService } from 'App/Services'
import Todo from 'App/Models/Todo'
import Database from '@ioc:Adonis/Lucid/Database'
// import Database from '@ioc:Adonis/Lucid/Database'

test.group('Todo', (group) => {
  const todoService = new TodoService()
  const userService = new UserService()

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  }) // <--- prepare or rollback database

  // Todo: create & read a todo
  test('todo: should create & read a todo', async ({ assert }) => {
    const author = await userService.create({
      email: 'todo@mail.com',
      password: 'password',
    }) // <--- Create a user first
    const todo = await todoService.create({
      title: 'todo',
      description: 'todo description',
      userId: author.id, // <--- Owner or Author User ID
    }) // <--- Create a todo

    // checks
    assert.instanceOf(todo, Todo)
    assert.exists(todo.id)
    assert.exists(todo.title)
    assert.exists(todo.description)
    assert.strictEqual(todo.title, 'todo')
    assert.strictEqual(todo.description, 'todo description')
    assert.isTrue(!todo.isCompleted) // <--- Default value should be false
    assert.strictEqual(todo.userId, author.id) // <--- Author ID
  })

  // Todo: update a todo
  test('todo: should update todo item', async ({ assert }) => {
    const author = await new UserService().create({
      email: 'todo2@mail.com',
      password: 'password',
    }) // <--- Create a user first

    const todo = await todoService.create({
      title: 'todo',
      description: 'todo description',
      userId: author.id, // <--- Owner or Author User ID
    }) // <--- Create a todo first

    const updatedTodo = await todoService.update(todo, {
      title: 'todo updated',
      isCompleted: true,
    }) // <--- Update a todo

    // checks
    assert.isTrue(updatedTodo) // <--- Should be true
    const updated = await todoService.getById(todo.id) // <--- get updated todo
    assert.strictEqual(updated!.title, 'todo updated') // <--- Title is updated
    assert.strictEqual(updated!.isCompleted, true) // <--- isCompleted is updated
  })
})
