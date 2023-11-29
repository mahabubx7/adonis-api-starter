import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TodoService } from 'App/Services'
import CreateTodoDto from 'App/Validators/CreateTodoDto'
import UpdateTodoDto from 'App/Validators/UpdateTodoDto'

export default class TodosController {
  constructor(private readonly todoService: TodoService = new TodoService()) {}

  // CREATE
  public async createTodo({ request, auth, bouncer, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Create a new todo
    | @Sanitized:   Validating user-inputs
    | @Auth:        Already authenticated from route => middleware
    | @Permission:  TodoPolicy
    *--------------------------------------------------------------*/
    await bouncer.with('TodoPolicy').authorize('create') // <-- authorize
    const payload = await request.validate(CreateTodoDto)
    const todo = await this.todoService.create({ ...payload, userId: +auth.user!.id })
    return response.created({ message: 'Todo created successfully!', todo })
  }

  // GET ALL
  public async getTodos({ auth, bouncer }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Get all todos of current user
    | @Auth:        Already authenticated from route => middleware
    | @Permission:  TodoPolicy
    *--------------------------------------------------------------*/
    await bouncer.with('TodoPolicy').authorize('viewOwnList') // <-- authorize
    const todos = await this.todoService.getTodos(+auth.user!.id)
    return { todos }
  }

  // GET ONE
  public async getTodo({ request, bouncer, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Get one todo item
    | @Auth:        Already authenticated from route => middleware
    | @Permission:  TodoPolicy
    *--------------------------------------------------------------*/
    const { id } = request.params()
    const todo = await this.todoService.getById(+id)
    if (!todo) return response.notFound({ message: 'Todo not found!' })
    await bouncer.with('TodoPolicy').authorize('view', todo) // <-- authorize
    return { todo }
  }

  // UPDATE
  public async updateTodo({ request, bouncer, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Update a todo item
    | @Auth:        Already authenticated from route => middleware
    | @Permission:  TodoPolicy
     *-------------------------------------------------------------*/
    const { id } = request.params()
    const payload = await request.validate(UpdateTodoDto)
    const todo = await this.todoService.getById(+id)
    if (!todo) return response.notFound({ message: 'Todo not found!' })
    await bouncer.with('TodoPolicy').authorize('update', todo) // <-- authorize
    const updated = await this.todoService.update(todo, payload)
    if (!updated) return response.badRequest({ message: 'Something went wrong!' })
    return response.accepted({ message: 'Todo updated successfully!' })
  }

  // DELETE
  public async deleteTodo({ request, bouncer, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Delete a todo item
    | @Auth:        Already authenticated from route => middleware
    | @Permission:  TodoPolicy
     *-------------------------------------------------------------*/
    const { id } = request.params()
    const todo = await this.todoService.getById(+id)
    if (!todo) return response.notFound({ message: 'Todo not found!' })
    await bouncer.with('TodoPolicy').authorize('delete', todo) // <-- authorize
    const deleted = await this.todoService.remove(todo)
    if (!deleted) return response.badRequest({ message: 'Something went wrong!' })
    return response.accepted({ message: 'Todo deleted successfully!' })
  }
}
