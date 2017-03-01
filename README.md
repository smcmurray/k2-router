# k2-router

k2-router is koa@2 middleware to allow request routing.

# Installation

````
yarn add k2-router
````
or
````
npm install k2-router
````

# Usage

const Koa = require('koa')
const app = new Koa()
const Router = require('k2-router')

let router = Router('/hello')

route.on('get', async ctx=>{ ctx.body = 'Hello' })

app.use(router.routes())
app.use(Router('/goodbye').get(ctx => { ctx.body = 'Goodbye' }))

# Initialization

## require('k2-router')([path,] [options])

* path - a string, regexp, or array of strings/regexps
* options - an object containing path-to-regexp options

# API

## on(method [,path] ,middleware [, ...])

* method - string or array of strings containing HTTP method names
* path - optional string, regexp, or array of strings/regexps
* middleware - one or more middleware functions

Given a method or array of methods, associates the given middleware with requests of the given method(s). Method can be null to associate the middleware with requests of any method. An optional path can be used to refine path of matching requests for the middleware. If the path is provided, it will be appended to the router's path to determine matching requests.

If no middleare is indicated, no action will be taken on the router.

## get|post|put|delete|etc([path,] middleware, [,...])

Shortcut methods are provided for each of the methods provided by node's methods library. These methods are bound to the router's `on` method, providing a default method argument to the `on` method. For more information, see `on` above. 

## use([path,] middleware [,...])

* path - optional string, regexp, or array of strings/regexps
* middleware - one or more middleware functions

Associates the given middleware with the router's path. If optional paths are provided, creates new subrouters for each of those paths and associates the given middleware with each of those subrouters.
