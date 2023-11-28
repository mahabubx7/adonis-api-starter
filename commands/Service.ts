import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import { join } from 'path'

export default class Service extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:service'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Make a new service class'

  /**
   * The name of the service class file.
   */
  @args.string({
    description: 'Name of the service class',
    required: true,
  })
  public name: string

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    const model = await this.prompt.ask('Enter the model class (Please use capital at starts):', {
      default: this.name,
    })
    // generate the service class file
    this.generator
      .addFile(this.name + 'Service', {
        extname: '.ts',
      })
      .appRoot(this.application.appRoot)
      .destinationDir('app/Services')
      .useMustache()
      .stub(join(__dirname, '../templates/service.txt'))
      .apply({ model })

    await this.generator.run()
    this.logger.success(`✅ ${this.name} service class created successfully.`)
  }
}
