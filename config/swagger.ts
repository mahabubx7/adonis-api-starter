export default {
  path: __dirname + '../',
  title: 'AdonisJs (demo) API Documentation',
  version: '1.0.0',
  openapi: '3.0.0',
  snakeCase: true,
  tagIndex: 3,
  ignore: ['/api/docs.yml', '/api/docs', '/uploads/*'],
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same rout, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI confirm headers that are commonly used
  },
}
