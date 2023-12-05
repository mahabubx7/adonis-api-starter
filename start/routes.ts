/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Route from '@ioc:Adonis/Core/Route'
import AutoSwagger from 'adonis-autoswagger'
import Swagger from 'Config/swagger'

Route.group(() => {
  require('./v1') //  <--- API version [ 1 ]

  Route.get('health', async ({ response }) => {
    const report = await HealthCheck.getReport()
    return report.healthy ? response.ok(report) : response.badRequest(report)
  }) // <--- Health Check

  // Swagger :: YML
  Route.get('/docs.yml', async () => {
    return AutoSwagger.docs(Route.toJSON(), Swagger)
  }) // <--- API docs in YAML format

  // Swagger :: UI
  Route.get('/docs', async () => {
    return AutoSwagger.ui('/api/docs.yml')
  }) // <--- API docs in Swagger/OpenAPI UI format

  Route.get('/', async () => {
    return { hello: 'world' }
  }) // <-- API root :: for Hello World
}).prefix('api') // <--- API root prefix
