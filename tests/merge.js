/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true setTimeout: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

var streamer = require('../streamer.js'),
    merge = streamer.merge, list = streamer.list
var test = require('./utils.js').test

exports['test merge stream of empty streams'] = function(assert, done) {
  test(assert, done, merge(list(list(), list())), [])
}

exports['test merge empty & non-empty'] = function(assert, done) {
  test(assert, done, merge(list(list(), list(1, 2), list())), [1, 2])
}

exports['test merge merged'] = function(assert, done) {
  var stream = merge(list(list(1, 2), list('a', 'b')))
  stream = merge(list(list('>'), stream, list()))
  test(assert, done, stream, ['>', 1, 2, 'a', 'b'])
}

exports['test merge sync & async streams'] = function(assert, done) {
  function async(next, stop) {
    var x = 3
    setTimeout(function onTimeout() {
      if (!x) return stop()
      next(x--)
      setTimeout(onTimeout, 0)
    }, 0)
  }

  var stream = merge(list(async, list(), list('a', 'b')))
  test(assert, done, stream, [ 'a', 'b', 3, 2, 1 ])
}

exports['test merge with broken stream'] = function(assert, done) {
  var buffer = []
  function async(next, stop) {
    var x = 3
    setTimeout(function onTimeout() {
      if (!x) return stop(new Error("Boom!"))
      next(x--)
      setTimeout(onTimeout, 0)
    }, 0)
  }
  
  var stream = merge(list(list('>'), async, list(1, 2) ))
  stream(function next(x) { buffer.push(x) }, function stop(error) {
    assert.equal(error.message, 'Boom!', 'error propagated')
    assert.deepEqual(buffer, [ '>', 1, 2, 3, 2, 1 ],
                     'all values were yielded before error')
    done()
  })
}

exports['test merge async stream of streams'] = function(assert, done) {
  function async(next, stop) {
    var x = 3
    setTimeout(function onTimeout() {
      if (!x) return stop()
      next(x--)
      setTimeout(onTimeout, 0)
    }, 0)
  }
  function source(next, stop) {
    var x = 3
    next(list())
    next(list(1, 2))
    setTimeout(function onTimeout() {
      if (!x) return next(async) || stop()
      next(list('a', x--))
      setTimeout(onTimeout, 0)
    }, 0)
  }

  test(assert, done, merge(source), [1, 2, 'a', 3, 'a', 2, 'a', 1, 3, 2, 1])
}

if (module == require.main)
  require('test').run(exports);

})