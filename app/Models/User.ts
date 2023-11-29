import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'
import { BaseModel, HasMany, beforeSave, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { Role } from 'App/Enums'
import Todo from './Todo'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  // @no-swagger
  public rememberMeToken?: string

  @column()
  public isEmailVerified?: boolean

  @column()
  // @enum(user, auditor, admin, super_admin)
  public role: string

  // has-many relation: Todo[]
  @hasMany(() => Todo)
  public todos: HasMany<typeof Todo>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // hash password before saving
  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  // check if user is USER | Customer
  // @no-swagger
  public get isCustomer() {
    return this.role === Role.USER
  }

  // check if user is ADMIN
  // @no-swagger
  public get isAdmin() {
    return this.role === Role.ADMIN
  }

  // check if user is AUDITOR
  // @no-swagger
  public get isAuditor() {
    return this.role === Role.AUDITOR
  }

  // check if user is SUPER . ADMIN
  // @no-swagger
  public get isSuperAdmin() {
    return this.role === Role.SUPER_ADMIN
  }
}
