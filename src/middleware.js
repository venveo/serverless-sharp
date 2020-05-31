/**
 * serverless-http koa middleware example
 */

'use strict';

const fs = require('fs')
const serverless = require('serverless-http');
const Koa = require('koa');

const { handler } = require('./index') 
// Or ./node_modules/serverless-sharp/src/index

const app = new Koa();

app.use(async(ctx,next) => {

  /**
  * handler
  * @param {string} path
  * @param {hash} headers
  * @param {hash} queryStringParameters
  **/

  const result = await handler({
    path: ctx.path,
    headers: ctx.header,
    queryStringParameters: {...ctx.request.query}
  })

  if(result.body){
    ctx.set(result.headers)
    ctx.status = result.statusCode
    ctx.body = new Buffer(result.body, 'base64')
    await next();
  }
});
module.exports.handler  = serverless(app, {binary: ['*/*']});