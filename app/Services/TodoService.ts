/*
|-------------------------------------------------------------
| @TodoService class
| @Author: Mahabub (@mahabubx7)
|-------------------------------------------------------------
|
| This is a service class that can be used to handle database
| access layer delicately & handle necessary operations.
|
|*/

import Todo from 'App/Models/Todo'

export class TodoService {
  constructor(private readonly model = Todo) {}

  /**
   * Create a new Todo
   * @params payload Partial<Todo>
   * @returns Promise<Todo>
   */
  public async create(payload: Partial<Todo>) {
    return this.model.create(payload)
  }

  /**
   * Get one by id
   * @param id number
   * @returns Promise<Todo>
   */
  public async getById(id: number) {
    return this.model.findOrFail(id).catch(() => false)
  }

  /**
   * Get all todos for a user
   * @param userId number
   * @returns Promise<Todo[]>
   */
  public async getTodos(userId: number) {
    return this.model.query().where('user_id', userId).orderBy('id', 'desc')
  }

  /**
   * Update a Todo
   * @param id number
   * @param payload Partial<Todo>
   * @returns Promise<any[]>
   */
  public async update(id: number, payload: Partial<Todo>) {
    return this.model.query().where('id', id).update(payload)
  }

  /**
   * Remove a Todo
   * @param id number
   * @returns Promise<any[]>
   */
  public async delete(id: number) {
    return this.model.query().where('id', id).delete()
  }
}
