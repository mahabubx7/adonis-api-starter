import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/', 'TodosController.createTodo').as('createTodo')
  Route.get('/', 'TodosController.getTodos').as('getTodos')
  Route.get('/:id', 'TodosController.getTodo').as('getTodo')
  Route.put('/:id', 'TodosController.updateTodo').as('updateTodo')
  Route.delete('/:id', 'TodosController.deleteTodo').as('deleteTodo')
})
  .prefix('todo') // <--- Todo prefix
  .middleware('auth') // <--- Authentication required
