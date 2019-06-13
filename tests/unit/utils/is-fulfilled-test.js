import { defer } from 'rsvp';
import DS from 'ember-data';
import isPromise from 'ember-promise-tools/utils/is-promise';
import isFulfilled from 'ember-promise-tools/utils/is-fulfilled';
import { module, test } from 'qunit';

module('Unit | Utils | is fulfilled');

test('Ember Promise proxy mixin detects its fulfilled', function(assert) {
  assert.expect(3);

  let deferred = defer();
  let promiseObject = DS.PromiseObject.create({ promise: deferred.promise });

  assert.ok(isPromise(promiseObject));

  assert.equal(isFulfilled(promiseObject), false);

  deferred.resolve(true);

  let done = assert.async();

  deferred.promise.then(() => {
    assert.equal(isFulfilled(promiseObject), true);
    done();
  });
});

test('RSVP Promise mixin detects its fulfilled', function(assert) {
  assert.expect(3);

  let deferred = defer();

  assert.ok(isPromise(deferred.promise));

  assert.equal(isFulfilled(deferred.promise), false);

  deferred.resolve(true);

  let done = assert.async();

  deferred.promise.then(() => {
    assert.equal(isFulfilled(deferred.promise), true);
    done();
  });
});

test('Duck typed promise cant detect fulfilled', function(assert) {
  assert.expect(4);

  let promise = {
    then() { this.done = true; },
    catch() {},
    done: false
  };

  assert.ok(isPromise(promise));

  assert.equal(isFulfilled(promise), false);

  promise.then();

  assert.equal(isFulfilled(promise), false);
  assert.equal(promise.done, true);
});
