/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: false latedef: false */
/*global define: true */

!(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

'use strict';

var streamer = require('./core'), Stream = streamer.Stream,
    map = streamer.map, merge = streamer.merge, append = streamer.append,
    tail = streamer.tail, defer = streamer.defer, promise = streamer.promise

var unbind = Function.call.bind(Function.bind, Function.call)
var slice = unbind(Array.prototype.slice)
var forward = Math.floor(Math.random() * 100000000000000000)

function Stack() {
/**
  Creates a queue.
  **/
  var queued = [], pending = [], next = function next() {
    var deferred = defer()
    if (queued.length) deferred.resolve(queued.shift())
    else if (pending) pending.push(deferred)
    else deferred.resolve(null)
    return deferred.promise
  }

  return Object.create(Queue.prototype, {
    then: { value: function then(resolve, reject) {
      return next().then(resolve, reject)
    }},
    enqueue: { value: function enqueue(item) {
      if (!pending) return
      if (pending.length) pending.shift().resolve(Stream(item, next))
      else queued.unshift(Stream(item, next))
    }},
    close: { value: function close() {
      if (!pending) return
      while (pending.length) pending.shift().resolve(null)
      pending = null
    }}
  })
}

function enqueue(item, queue) {
  queue.enqueue(item)
}
enqueue.all = function enqueueall(item1, item2, item3, queue) {
  var items = slice(arguments)
  queue = items.pop()
  while (items.length) queue.enqueue(items.shift())
}
exports.enqueue = enqueue

function close(channel) {
  channel.close()
}
exports.close = close


function tree(isBranch, children, root) {
  /**
  Returns a lazy stream of the nodes in a tree, via a depth-first walk.
  `isBranch` must be a function that takes one argument and returns true if
  passed a node that can have children (but may not). `children` must be a
  function that takes one argument and returns a stream of the children. Will
  only be called on nodes for which `isBranch` returns true. `root` is the root
  node of the tree.
  **/

  return (function walk(node) {
    return function stream(next, stop) {
      var $ = isBranch(node)
      !(typeof($) === 'function' ? $ : list($))(function(isBranch) {
        (isBranch ?
         append(list(node), merge(map(walk, children(node)))) :
         list(node))(next, stop)
      })
    }
  })(root)
}
exports.tree = tree

exports.fibs = function(fibs) {
  return (fibs = Stream(0, Stream(1, function rest() {
    return map.all(function(a, b) { return a + b }, fibs, tail(fibs))
  })))
}

});

