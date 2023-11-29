import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Todo from 'App/Models/Todo'

export default class TodoPolicy extends BasePolicy {
  /*-------------------------------------------------------------*
  | @Authorization: AdonisJS/Bouncer
  | @AccessType:    Policy based permissions per role
  | @Description:   Todo Policy
  *--------------------------------------------------------------*/
  public async before(user: User, action: string) {
    if (!user) {
      // only after authenticated
      return false
    }

    if ((user.isAdmin || user.isSuperAdmin) && action !== 'create') {
      return true // <-- allow all actions, except create a todo
    }
  }

  public async viewOwnList(user: User) {
    return user.isCustomer || user.isAuditor // <-- allow only if user is owner or auditor
  }

  public async view(user: User, todo: Todo) {
    return user.id === todo.ownerId || user.isAuditor // <-- allow only if user is owner or auditor
  }

  public async create(user: User) {
    return user.isCustomer // <-- allow only if user is actually a user/customer & !auditor or !admins
  }

  public async update(user: User, todo: Todo) {
    return user.id === todo.ownerId // <-- allow only if user is owner & !auditor
  }

  public async delete(user: User, todo: Todo) {
    return user.id === todo.ownerId // <-- allow only if user is owner & !auditor
  }
}
