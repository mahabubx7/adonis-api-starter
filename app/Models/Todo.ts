import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public userId: number

  @column()
  public title: string

  @column()
  public isCompleted: boolean

  @column()
  public description: string | null

  // belongsTo relation: User
  // @foreignKey: userId [By default] (converted to 'user_id' in database query time)
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // get this Todo item owner
  public get ownerId() {
    return this.userId
  }
}
