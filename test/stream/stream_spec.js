/* global describe, it, chai, sinon */
'use strict';
import { Process } from 'src/process/process.js';
import { Stream } from 'src/stream/stream.js';

describe(`Stream >`, function() {
  var expect = chai.expect;
  it(`should exist`, function() {
    expect(Stream).to.exist;
  });

  it(`should work as Process when there is no configs`, function(done) {
    var stream = new Stream();
    stream.start()
      .next(() => 9)
      .next((nine) => {
        expect(nine).to.equal(9);
      })
      .next(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => { resolve(10); }, 200);
        });
      })
      .next((ten) => {
        expect(ten).to.equal(10);
      })
      .next(() => {
        return (new Process())
          .start()
          .next(() => 'foo')
          .next((foo) => foo);
      })
      .next((foo) => {
        expect(foo).to.equal('foo');
      })
      .rescue((err) => {
        done(err);
      })
      .next(() => {
        done();
      });
  });

  it(`would only handle events after it's ready,
        and after the process get stopped, it would stop to handle events`,
  function(done) {
    var stubHandler = sinon.stub();
    var stream = new Stream({
      events: ['foo'],
      interrupts: ['bar'],
      // A fake source is enough for testing.
      sources: [{
        start: () => {},
        stop: () => {}
      }]
    });
    stream
      .start(stubHandler)
      .ready()
      .onchange(new CustomEvent('foo'))
      .onchange(new CustomEvent('foo'))
      .next(() => {
        return stream.stop()
          .onchange(new CustomEvent('foo'))
          .next(() => {
            expect(stubHandler.calledOnce).to.equal(false);
            expect(stubHandler.calledTwice).to.equal(true);
            expect(stubHandler.calledThrice).to.equal(false);
          })
          .next(done)
          .rescue(done);
      });
  });

  it(`receive an interrupt, and the handler would not be queued`,
  function(done) {
    var stubHandler = sinon.spy((evt) => {
      // The first 'foo' would be handled only after the stack
      // is empty, so the actual handling order is 'bar->bar->foo',
      // and then the queue get stuck since we don't resolve it,
      // which is also the moment we do assertion.
      if ('foo' === evt.type) {
        expect(stubHandler.calledThrice).to.equal(true);
        done();
      }
      var { promise } = Process.defer();
      return promise;
      // Don't resolve.
      // So the next handler would not be executed,
      // unless the event is an interrupt.
    });
    var stream = new Stream({
      events: ['foo'],
      interrupts: ['bar'],
      sources: [{
        start: () => {},
        stop: () => {}
      }]
    });
    stream
      .start(stubHandler)
      .ready()
      .onchange(new CustomEvent('foo'))       // execute
      .onchange(new CustomEvent('foo'))       // no execute
      .onchange(new CustomEvent('bar'))       // execute
      .onchange(new CustomEvent('bar'));      // execute
  });
});
