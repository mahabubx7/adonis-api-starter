/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(422).json(error.messages)
    }

    /**
     * Forward rest of the exceptions to the parent class
     */

    // Route 404
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).json({
        message: 'Route not found!',
        error,
      })
    }

    // Bouncer Authorization Failure
    if (error.code === 'E_AUTHORIZATION_FAILURE') {
      return ctx.response.status(403).json({
        message: 'You are not authorized to access this resource!',
        error: {
          message: error.message,
          stack: error.stack,
        },
      })
    }
    return super.handle(error, ctx)
  }
}
