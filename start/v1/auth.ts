import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login').as('login')
  Route.post('/register', 'AuthController.register').as('register')
  Route.delete('/logout', 'AuthController.logout').as('logout')
  Route.get('/whoami', 'AuthController.whoAmI').as('whoami').middleware('auth')
  Route.get('/verify/:email', 'AuthController.verifyEmail').as('verifyEmail')
  Route.post('/verify/resend', 'AuthController.resendEmailVerify').as('verifyResendEmail')
}).prefix('auth')
