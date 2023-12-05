import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login').as('login')

  Route.post('/register', 'AuthController.register').as('register')

  Route.get('/whoami', 'AuthController.whoAmI').as('whoami').middleware('auth')

  Route.delete('/logout', 'AuthController.logout').as('logout').middleware('auth')

  Route.put('/password/change', 'AuthController.changePassword')
    .as('changePassword')
    .middleware('auth')

  Route.post('/password/forgot', 'AuthController.forgotPassword').as('forgotPassword')

  Route.put('/password/reset', 'AuthController.resetPassword').as('resetPassword')

  Route.post('/verify/email', 'AuthController.verifyEmail').as('verifyEmail')

  Route.post('/verify/resend', 'AuthController.resendEmailVerify').as('verifyResendEmail')
}).prefix('auth')
