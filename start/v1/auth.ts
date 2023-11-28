import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login').as('login')

  Route.post('/register', 'AuthController.register').as('register')

  Route.delete('/logout', 'AuthController.logout').as('logout')

  Route.get('/whoami', 'AuthController.whoAmI').as('whoami').middleware('auth')

  Route.put('/change-password', 'AuthController.changePassword')
    .as('changePassword')
    .middleware('auth')

  Route.post('/verify/email', 'AuthController.verifyEmail').as('verifyEmail')

  Route.post('/verify/resend', 'AuthController.resendEmailVerify').as('verifyResendEmail')
}).prefix('auth')
