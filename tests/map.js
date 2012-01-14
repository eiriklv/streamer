/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true setTimeout: true */

!(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

var Stream = require('../core').Stream

exports.Assert = require('./assert').Assert
exports['test map empty'] = function(test, complete) {
  var actual = Stream.empty.map(function(element) {
    test.fail('map fn was executed')
  })
  test(actual).to.be.empty().then(complete)
}

exports['test number map'] = function(test, complete) {
  var numbers = Stream.of(1, 2, 3, 4)
  var actual = numbers.map(function(number) { return number * 2 })
  test(actual).to.be(2, 4, 6, 8).then(complete)
}

exports['test map with async stream'] = function(test, complete) {
  var stream = Stream.of(5, 4, 3, 2, 1).delay()
  var mapped = stream.map(function(x) { return x + 1 })
  test(mapped).to.be(6, 5, 4, 3, 2).then(complete)
}

exports['test map broken stream'] = function(test, complete) {
  var boom = Error('Boom!')
  var stream = Stream.of(3, 2, 1).append(Stream.error(boom)).delay()
  var actual = stream.map(function(x) { return x * x })
  var expected = [ 9, 4, 1 ]

  test(actual).to.have.elements(9, 4, 1).and.an.error(boom).then(complete)
}

if (module == require.main)
  require('test').run(exports)

});
