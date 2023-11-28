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

import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export class UserService {
  constructor(private readonly model = User) {}

  /**
   * Create a new user
   * @params  user Partial<User>
   * @returns Promise<User>
   */
  public async create(user: Partial<User>) {
    return this.model.create(user)
  }

  /**
   * Get one by id
   * @param   id number
   * @returns Promise<User>
   */
  public async getById(id: number) {
    return this.model.findOrFail(id)
  }

  /**
   * Get one by email address
   * @param   email string
   * @returns Promise<User>
   */
  public async getByEmail(email: string) {
    return this.model.findByOrFail('email', email)
  }

  /**
   * Update a user
   * @param   id number
   * @param   user Partial<User>
   * @returns Promise<any[]>
   */
  public async update(id: number, user: Partial<User>) {
    return this.model.query().where('id', id).update(user)
  }

  /**
   * Update a user's email verification status
   * @param   email string
   * @returns Promise<any[]>
   */
  public async makeEmailVerified(email: string) {
    return this.model.query().where('email', email).update({ isEmailVerified: true })
  }

  /**
   * Update user's password
   * @param   id number
   * @param   pass string
   * @returns Promise<false | any[]>
   */
  public async changePassword(id: number, old: string, pass: string) {
    const user = await this.model.findOrFail(id)
    const isSame = await Hash.verify(user.password, old)
    if (!isSame) {
      return false // password not matched
    }
    const newPassword = await Hash.make(pass)
    return await this.model.query().where('id', id).update({ password: newPassword })
  }

  /**
   * Reset user's password
   * @param   email string
   * @param   pass string
   * @returns Promise<boolean> (True if success)
   */
  public async resetPassword(email: string, pass: string) {
    const newPassword = await Hash.make(pass)
    await this.model
      .query()
      .where('email', email)
      .update({ password: newPassword })
      .catch((err) => {
        throw new Error(err)
      })
    return true
  }

  /**
   * Remove a user
   * @param   id number
   * @returns Promise<any[]>
   */
  public async delete(id: number) {
    return this.model.query().where('id', id).delete()
  }
}
