import Ember from 'ember';
import DS from 'ember-data';
import isPromise from 'ember-promise-tools/utils/is-promise';
import isFulfilled from 'ember-promise-tools/utils/is-fulfilled';
import getPromiseContent from 'ember-promise-tools/utils/get-promise-content';
import { module, test } from 'qunit';

module('Unit | Utils | get promise content');

test('Ember Promise Proxymixin gets fulfilled content', function(assert) {
  let deferred = Ember.RSVP.defer();
  let promiseObject = DS.PromiseObject.create({ promise: deferred.promise });

  assert.ok(isPromise(promiseObject));

  assert.equal(isFulfilled(promiseObject), false);

  deferred.resolve('done');

  deferred.promise.then(() => {
    assert.equal(isFulfilled(promiseObject), true);
    assert.equal(getPromiseContent(promiseObject), 'done');
  });
});

test('RSVP Promise mixin gets fulfilled content', function(assert) {
  let deferred = Ember.RSVP.defer();

  assert.ok(isPromise(deferred.promise));

  assert.equal(isFulfilled(deferred.promise), false);

  deferred.resolve('done');

  deferred.promise.then(() => {
    assert.equal(isFulfilled(deferred.promise), true);
    assert.equal(getPromiseContent(deferred.promise), 'done');
  });
});


test('Duck typed promise cant get fulfilled content', function(assert) {
  let promise = {
    then(result) {
      this.done = true;
      this.result = result;
    },
    catch() {},
    done: false,
    result: null
  };

  assert.ok(isPromise(promise));

  assert.equal(isFulfilled(promise), false);

  promise.then('done');

  assert.equal(isFulfilled(promise), false);
  assert.equal(promise.done, true);
  assert.equal(getPromiseContent(promise), null);
  assert.equal(promise.result, 'done');
});
