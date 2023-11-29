import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TodoService } from 'App/Services'
import CreateTodoDto from 'App/Validators/CreateTodoDto'
import UpdateTodoDto from 'App/Validators/UpdateTodoDto'

export default class TodosController {
  constructor(private readonly todoService: TodoService = new TodoService()) {}

  // CREATE
  public async createTodo({ request, auth, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Create a new todo
    | @Sanitized:   Validating user-inputs
    | @Auth:        Already authenticated from route => middleware
    *--------------------------------------------------------------*/
    const payload = await request.validate(CreateTodoDto)
    const todo = await this.todoService.create({ ...payload, userId: +auth.user!.id })
    return response.created({ message: 'Todo created successfully!', todo })
  }

  // GET ALL
  public async getTodos({ auth }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Get all todos of current user
    | @Auth:        Already authenticated from route => middleware
    *--------------------------------------------------------------*/
    const todos = await this.todoService.getTodos(+auth.user!.id)
    return { todos }
  }

  // GET ONE
  public async getTodo({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Get one todo item
    | @Auth:        Already authenticated from route => middleware
    *--------------------------------------------------------------*/
    const { id } = request.params()
    const todo = await this.todoService.getById(+id)
    if (!todo) return response.notFound({ message: 'Todo not found!' })
    return { todo }
  }

  // UPDATE
  public async updateTodo({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Update a todo item
    | @Auth:        Already authenticated from route => middleware
     *-------------------------------------------------------------*/
    const { id } = request.params()
    const payload = await request.validate(UpdateTodoDto)
    const updated = await this.todoService.update(+id, payload)
    if (updated[0] === 0) return response.badRequest({ message: 'Something went wrong!' })
    return response.accepted({ message: 'Todo updated successfully!' })
  }

  // DELETE
  public async deleteTodo({ request, response }: HttpContextContract) {
    /*-------------------------------------------------------------*
    | @Todo:        Delete a todo item
    | @Auth:        Already authenticated from route => middleware
     *-------------------------------------------------------------*/
    const { id } = request.params()
    const deleted = await this.todoService.delete(+id)
    if (deleted[0] === 0) return response.badRequest({ message: 'Something went wrong!' })
    return response.accepted({ message: 'Todo deleted successfully!' })
  }
}
