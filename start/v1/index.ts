import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  require('./auth') // Authentication routes

  Route.get('/', async () => {
    return { hello: 'world from v1' }
  })
}).prefix('v1')
