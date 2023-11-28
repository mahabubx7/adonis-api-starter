import User from 'App/Models/User'

export default class MyService {
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
