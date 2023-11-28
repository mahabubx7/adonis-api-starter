import fs from 'fs'
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
    this.name = this.name + 'Service'
    // pre-check for duplicate
    if (fs.existsSync(join(this.application.appRoot, `app/Services/${this.name}.ts`))) {
      this.logger.error(`❌ ${this.name} service class already exists.`)
      return
    }
    const model = await this.prompt.ask('Enter the model class (Please use capital at starts):', {
      default: this.name,
      result: (value) => value.trim(),
    })
    // generate the service class file
    this.generator
      .addFile(this.name, {
        extname: '.ts',
      })
      .appRoot(this.application.appRoot)
      .destinationDir('app/Services')
      .useMustache()
      .stub(join(__dirname, '../templates/service.txt'))
      .apply({ model, name: this.name })

    await this.generator.run() // class file created
    this.logger.success(`✅ ${this.name} service class created successfully.`)

    // add this class into service registerer file
    try {
      const registererFile = join(this.application.appRoot, 'app/Services/index.ts')
      let register = fs.readFileSync(registererFile, 'utf-8')
      const entry = `export * from './${this.name}'`

      if (!register.includes(entry)) {
        register += '\n' + entry + '\n'
        fs.writeFileSync(registererFile, register)
      }
    } catch (error) {
      this.logger.error(`❌ Unable to add ${this.name} service class into the registerer file.`)
      this.logger.error(error)
      return
    }

    this.logger.info(`✅ ${this.name} service class was added into the registerer file.`)
  }
}
