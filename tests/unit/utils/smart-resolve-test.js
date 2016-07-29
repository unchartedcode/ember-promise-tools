import Ember from 'ember';
import DS from 'ember-data';
import smartResolve from 'ember-promise-tools/utils/smart-resolve';
import { module, test } from 'qunit';

module('Unit | Utils | smart resolve');

test('Smart Resolve returns non promise value', function(assert) {
  assert.expect(1);

  let value = 4;

  let returnValue = smartResolve(value);

  assert.equal(returnValue, value);
});

test('Smart Resolve returns unresolved Ember Promise Proxy mixin', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();
  let promiseObject = DS.PromiseObject.create({ promise: deferred.promise });

  let returnValue = smartResolve(promiseObject);

  assert.equal(returnValue, promiseObject);
});

test('Smart Resolve returns unresolved RSVP Promise', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();

  let returnValue = smartResolve(deferred.promise);

  assert.equal(returnValue, deferred.promise);
});

test('Smart Resolve returns Duck typed promise', function(assert) {
  assert.expect(1);

  let promise = { then() {}, catch() {} };

  let returnValue = smartResolve(promise);

  assert.equal(returnValue, promise);
});

test('Smart Resolve returns resolved Ember Promise Proxy mixin value', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();
  let promiseObject = DS.PromiseObject.create({ promise: deferred.promise });

  deferred.resolve('done');

  let done = assert.async();

  deferred.promise.then(() => {
    let returnValue = smartResolve(promiseObject);
    assert.equal(returnValue, 'done');
    done();
  });
});

test('Smart Resolve returns resolved RSVP Promise value', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();

  deferred.resolve('done');

  let done = assert.async();

  deferred.promise.then(() => {
    let returnValue = smartResolve(deferred.promise);
    assert.equal(returnValue, 'done');
    done();
  });
});

test('Smart Resolve does not return resolved Duck typed promise value', function(assert) {
  assert.expect(2);

  let promise = {
    then() { this.done = true; },
    catch() {},
    done: false
  };

  promise.then();

  let returnValue = smartResolve(promise);
  assert.notEqual(returnValue, true);
  assert.equal(promise.done, true);
});
