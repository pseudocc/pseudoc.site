const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');

if (require.main == module) {
  const env = try_get_env();
  const Koa = require('koa');
  const Router = require('@koa/router');
  const favicon = require('koa-favicon');
  
  const app = new Koa();
  const router = new Router();

  router.get('/', async ctx => {
    ctx.body = 'Hello, world!';
  });

  app
    .use(favicon(path.join(__dirname, 'assets', 'pseudoc.ico')))
    .use(router.routes())
    .use(router.allowedMethods());
  
  assert.ok(env.HTTP_PORT !== undefined);
  const http_server = http.createServer(app.callback());
  http_server.listen(env.HTTP_PORT, () => {
    console.log('HTTP server is hosting on port %d', env.HTTP_PORT);
  });

  if (env.HTTPS_PORT !== undefined) {
    const https = require('https');
    const options = {
      key: get_secret('key.pem'),
      cert: get_secret('cert.pem')
    };
    const https_server = https.createServer(options, app.callback());
    https_server.listen(env.HTTPS_PORT, () => {
      console.log('HTTPS server is hosting on port %d', env.HTTPS_PORT);
    });
  }
}

function try_get_env() {
  const env_output = require('dotenv').config();
  if (env_output.error) {
    console.error(env_output.error);
    process.exit(1);
  }
  return env_output.parsed;
}

/**
 * @param {string} name 
 * @returns 
 */
function get_secret(name) {
  return fs.readFileSync(path.join(__dirname, 'secrets', name));
}
