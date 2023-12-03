import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        email: 'test@user.com', // user
        password: '12345678',
        isEmailVerified: true,
      },
      {
        email: 'test@auditor.com',
        password: '12345678',
        role: 'auditor', // auditor
        isEmailVerified: true,
      },
      {
        email: 'test@admin.com',
        password: 'admin',
        role: 'admin', // admin
        isEmailVerified: true,
      },
    ])
  }
}
