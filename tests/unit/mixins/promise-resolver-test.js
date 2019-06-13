import { defer } from 'rsvp';
import EmberObject from '@ember/object';
import PromiseResolverMixin from 'ember-promise-tools/mixins/promise-resolver';
import { module, test } from 'qunit';

module('Unit | Mixin | promise resolver', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    assert.expect(1);
    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();
    assert.ok(subject);
  });

  test('resolves null until the promise is resolved', function (assert) {
    assert.expect(3);

    let deferred = defer();

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), null);

    const text = 'yass!';

    deferred.resolve(text);

    let done = assert.async();

    return deferred.promise.then(() => {
      assert.equal(resultImmediate, null, 'immediate result is null');
      assert.equal(resultDelayed, text, 'delayed result is correct');
      done();
    });
  });

  test('resolves null until the promise is rejected', function (assert) {
    assert.expect(4);

    let deferred = defer();
    let deferredCatcher = defer();

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    let resultCatch = null;
    assert.equal(subject.resolvePromise(deferred.promise,
                                        (resolved) => resultImmediate = resolved,
                                        (resolved) => resultDelayed = resolved,
                                        (error) => {
                                          resultCatch = error;
                                          deferredCatcher.resolve();
                                        }), null);

    deferred.reject('oops');

    let done = assert.async();

    // we need to wrap, to ensure that we only throw the catch after we resolved above
    return deferredCatcher.promise.then(() => {
      return deferred.promise.catch(() => {
        assert.equal(resultImmediate, null, 'immediate result is null');
        assert.equal(resultDelayed, null, 'delayed result is null');
        assert.equal(resultCatch, 'oops', 'catched error is correct');
        done();
      });
    });
  });

  test('changing the promise changes the eventually resolved value', function (assert) {
    assert.expect(6);

    let deferred1 = defer();
    let deferred2 = defer();

    const deferred1Text = 'hi';
    const deferred2Text = 'bye';

    deferred1.resolve(deferred1Text);

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred1.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), deferred1Text);

    let done = assert.async();

    return deferred1.promise.then(() => {
      assert.equal(resultImmediate, deferred1Text, 'immediate result matches expected');
      assert.equal(resultDelayed, null, 'delayed result is null');
      assert.equal(subject.resolvePromise(deferred2.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), null);
      deferred2.resolve(deferred2Text);
      return deferred2.promise;
    }).then(() => {
      assert.equal(resultImmediate, deferred1Text, 'immediate result matches expected');
      assert.equal(resultDelayed, deferred2Text, 'delayed result matches expected');
      done();
    });
  });

  test('always resolves with the last promise set', function (assert) {
    assert.expect(6);

    let deferred1 = defer();
    let deferred2 = defer();

    const deferred1Text = 'hi';
    const deferred2Text = 'bye';

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred1.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), null);

    assert.equal(subject.resolvePromise(deferred2.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), null);

    deferred1.resolve(deferred1Text);

    let done = assert.async();

    return deferred1.promise.then(() => {
      assert.equal(resultImmediate, null, 'immediate result is null');
      assert.equal(resultDelayed, null, 'delayed result is null');
      deferred2.resolve(deferred2Text);
      return deferred2.promise;
    }).then(() => {
      assert.equal(resultImmediate, null, 'immediate result is null');
      assert.equal(resultDelayed, deferred2Text, 'delayed result matches expected');
      done();
    });
  });

  test('passes through non-promise values unchanged', function (assert) {
    assert.expect(3);

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(42, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), 42);
    assert.equal(resultImmediate, 42, 'immediate result is 42');
    assert.equal(resultDelayed, null, 'delayed result is null');
  });

  test('switching from promise to non-promise correctly ignores promise resolution', function (assert) {
    assert.expect(4);

    let deferred = defer();

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), null);

    assert.equal(subject.resolvePromise(42, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), 42);

    const text = 'yass!';

    deferred.resolve(text);

    let done = assert.async();

    return deferred.promise.then(() => {
      assert.equal(resultImmediate, 42, 'immediate result is 42');
      assert.equal(resultDelayed, null, 'delayed result is null');
      done();
    });
  });

  test('previously fullfilled promise right away', function (assert) {
    assert.expect(5);

    const text = 'yass!';

    let deferred = defer();
    deferred.resolve(text);

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred.promise, (resolved) => resultImmediate = resolved, (resolved) => resultDelayed = resolved), text);

    assert.equal(resultImmediate, text, 'immediate result matches text');
    assert.equal(resultDelayed, null, 'delayed result is null');

    let done = assert.async();

    return deferred.promise.then(() => {
      assert.equal(resultImmediate, text, 'immediate result matches text');
      assert.equal(resultDelayed, null, 'delayed result is null');
      done();
    });
  });

  test('if delayed function isnt passed in, uses immediate function', function (assert) {
    assert.expect(3);

    const text = 'yass!';

    let deferred = defer();

    let PromiseResolverObject = EmberObject.extend(PromiseResolverMixin);
    let subject = PromiseResolverObject.create();

    let resultImmediate = null;
    let resultDelayed = null;
    assert.equal(subject.resolvePromise(deferred.promise, (resolved) => resultImmediate = resolved), null);

    deferred.resolve(text);

    let done = assert.async();

    return deferred.promise.then(() => {
      assert.equal(resultImmediate, text, 'immediate result matches text');
      assert.equal(resultDelayed, null, 'delayed result is null');
      done();
    });
  });
});