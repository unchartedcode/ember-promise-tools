import Ember from 'ember';
import DS from 'ember-data';
import isPromise from 'ember-promise-tools/utils/is-promise';
import { module, test } from 'qunit';

module('Unit | Utils | is promise');

test('Ember Promise Proxy mixin is detected', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();
  let promiseObject = DS.PromiseObject.create({ promise: deferred.promise });

  assert.ok(isPromise(promiseObject));
});

test('RSVP Promise mixin is detected', function(assert) {
  assert.expect(1);

  let deferred = Ember.RSVP.defer();

  assert.ok(isPromise(deferred.promise));
});

test('Duck typed promise is detected', function(assert) {
  assert.expect(1);

  let promise = { then() {}, catch() {} };

  assert.ok(isPromise(promise));
});
