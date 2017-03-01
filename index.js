(function(){
  'use strict'

  const methods = require("methods")
  const compose = require("koa-compose")
  const p2re = require('path-to-regexp')
  const ignore = require('koa-ignore')

  class Router {
    constructor(path, options){
      if ('object' === typeof path){
        options = path
        path = null
      }
      if (Array.isArray(path)){
        this.routers = path.map(p=>new Router(p, options))
        this.path = null
      }
      else {
        this.keys = []
        this.path = p2re(path, this.keys, options)
        this.routers = null
      }
      this.mw = []

      methods.forEach(m=>
        this[m.toLowerCase()] = this.on.bind(this, m)
      )
    }

    use(path, ...mw){
      let chain = 'function' != typeof path
        ? [].concat(path, mw)
        : [].concat(path).map(p=>new Router(p).use(...mw).routes())

      if (this.routers){
        this.routers.forEach(r=>r.use(...mw))
      }
      else this.mw.push(...mw)
      return this
    }

    on(methods, path, ...mw){
      let chain;
      if ('function' != typeof path){
        return mw.length ? this.use(new Router(p).on(methods,...mw).routes()) : this
      }
      if (!path){
        console.error('Missing middleware argument for route method')
        return this
      }
      chain = ignore(path, ...mw).unless(ctx=>{
        let M = ctx.method.toUpperCase()
        let Methods = methods && methods.map(m=>m.toUpperCase());
        return !methods || ~Methods.indexOf(M) || (M==='HEAD' && ~Methods.indexOf('GET'))
      });

      [].concat(this.routers || this).forEach(r=>r.use(chain))
      return this
    }

    routes(){
      return async (ctx,next) => {
        let match;
        if (this.path){
          let path = ctx.routed ? ctx.path.replace(new RegExp(`^${ctx.routed}`), '') : ctx.path;
          match = this.path.exec(path);
          if (! match){
            return next()
          }
          ctx.routed = (ctx.routed||'')+match.shift()
          ctx.params = this.match.reduce((p,k,i)=>{
            let v = k ? decodeURIComponent(k) : null
            p[i] = v
            if (this.keys.length) p[this.keys[i].name] = v
            return p
          }, ctx.params || {})
        }
        return compose([].concat(this.routers ? this.routers.map(r=>r.routes()) : this.mw))(ctx,next)
      }
    }
  }

  module.exports = (path, options) => new Router(path, options)
}())
