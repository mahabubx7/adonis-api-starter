/*
|-------------------------------------------------------------
| @UserService class
| @Author: Mahabub (@mahabubx7)
|-------------------------------------------------------------
|
| This is a service class that can be used to handle database
| access layer delicately & handle necessary operations.
|
|*/

import User from 'App/Models/User'

export class UserService {
  constructor(private readonly model = User) {}

  /**
   * Get one by id
   * @param id number
   * @returns Promise<User>
   */
  public async getById(id: number) {
    return this.model.findOrFail(id)
  }
}
